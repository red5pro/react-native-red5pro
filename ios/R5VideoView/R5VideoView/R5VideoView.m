//
//  R5VideoView.m
//  React Native Red5 Pro
//
//  Created by Todd Anderson on 10/27/17.
//  Copyright © 2017 Infrared5, Inc. All rights reserved.
//

#import "R5VideoView.h"

@interface R5VideoView() {
  
  int _scaleMode;
  int _logLevel;
  int _audioMode;
  BOOL _showDebugInfo;
  NSString *_streamName;  // required.
  
  BOOL _isStreaming;
  BOOL _isPublisher;      // determined.
  BOOL _useVideo;
  BOOL _useAudio;
  BOOL _playbackVideo;
  int _cameraWidth;
  int _cameraHeight;
  int _bitrate;
  int _framerate;
  int _audioBitrate;
  int _audioSampleRate;
  BOOL _useAdaptiveBitrateController;
  BOOL _useBackfacingCamera;
  
  int _currentRotation;
  
}
@end

@implementation R5VideoView

- (id)init {
  
  if (self = [super init]) {
    
    _scaleMode = 0;
    _logLevel = 3;
    _showDebugInfo = NO;
    _useVideo = YES;
    _useAudio = YES;
    _playbackVideo = YES;
    _bitrate = 750;
    _framerate = 15;
    _audioBitrate = 32;
    _cameraWidth = 640;
    _cameraHeight = 360;
    _audioSampleRate = 16000;
    _useAdaptiveBitrateController = NO;
    _audioMode = R5AudioControllerModeStandardIO;
    _useBackfacingCamera = NO;
    r5_set_log_level(_logLevel);
    
  }
  return self;
  
}

- (void)loadConfiguration:(R5Configuration *)configuration forKey:(NSString *)key {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        R5Connection *connection = [[R5Connection alloc] initWithConfig:configuration];
        R5Stream *stream = [[R5Stream alloc] initWithConnection:connection];
        [stream setDelegate:self];
        [stream setClient:self];
        
        self.stream = stream;
        self.connection = connection;
        
        if (self.onConfigured) {
            self.onConfigured(@{@"key": key});
        }
    });
  
}

- (AVCaptureDevice *)getCameraDevice:(BOOL)backfacing {
  
  NSArray *list = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
  AVCaptureDevice *frontCamera;
  AVCaptureDevice *backCamera;
  for (AVCaptureDevice *device in list) {
    if (device.position == AVCaptureDevicePositionFront) {
      frontCamera = device;
    }
    else if (device.position == AVCaptureDevicePositionBack) {
      backCamera = device;
    }
  }
  
  if (backfacing && backCamera != NULL) {
    return backCamera;
  }
  return frontCamera;
  
}

- (void)subscribe:(NSString *)streamName {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        _isPublisher = NO;
        _streamName = streamName;
 
        if (_playbackVideo) {
            
            R5VideoViewController *ctrl = [[R5VideoViewController alloc] init];
            UIView *view = [[UIView alloc] initWithFrame:self.frame];
            [ctrl setView:view];
            [self addSubview:view];
            
            self.controller = ctrl;
            
            [self.controller showPreview:YES];
            [self.controller attachStream:self.stream];
                
            UIViewController *rootVc = [UIApplication sharedApplication].delegate.window.rootViewController;
            [self.controller setFrame:rootVc.view.frame];
            [self.controller showDebugInfo:_showDebugInfo];
            [self.controller setScaleMode:_scaleMode];
            
        }

        [self.stream setAudioController:[[R5AudioController alloc] initWithMode:_audioMode]];
  
        [self.stream play:streamName];
    });
  
}

- (void)unsubscribe {
  
  dispatch_async(dispatch_get_main_queue(), ^{
    if (_isStreaming) {
      [self.stream stop];
    }
    else {
      self.onUnsubscribeNotification(@{});
      [self tearDown];
    }
  });
  
}

- (R5Camera *)setUpCamera {
    AVCaptureDevice *video = [self getCameraDevice:_useBackfacingCamera];
    R5Camera *camera = [[R5Camera alloc] initWithDevice:video andBitRate:_bitrate];
    [camera setWidth:_cameraWidth];
    [camera setHeight:_cameraHeight];
    [camera setOrientation:90];
    [camera setFps:_framerate];
    return camera;
}

- (R5Microphone *)setUpMicrophone {
    AVCaptureDevice *audio = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeAudio];
    R5Microphone *microphone = [[R5Microphone alloc] initWithDevice:audio];
    microphone.bitrate = _audioBitrate;
    microphone.sampleRate = _audioSampleRate;
    return microphone;
}

- (void)publish:(NSString *)streamName withMode:(int)publishMode {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        _isPublisher = YES;
        _streamName = streamName;
        
        if (_useAdaptiveBitrateController) {
            R5AdaptiveBitrateController *abrController = [[R5AdaptiveBitrateController alloc] init];
            [abrController attachToStream:self.stream];
            [abrController setRequiresVideo:_useVideo];
        }
        
        if (_useAudio) {
            R5Microphone *microphone = [self setUpMicrophone];
            [self.stream attachAudio:microphone];
        }
  
        if (_useVideo) {
            R5Camera *camera = [self setUpCamera];
            
            self.controller = [[R5VideoViewController alloc] init];
            UIView *view = [[UIView alloc] initWithFrame:self.frame];
            [self.controller setView:view];
            [self addSubview:view];
            
            [self.controller showPreview:YES];
            [self.controller showDebugInfo:_showDebugInfo];
            
            [self.controller attachStream:self.stream];
            [self.stream attachVideo:camera];
        }
  
        [self.stream publish:streamName type:publishMode];
        [self onDeviceOrientation:NULL];
        [self.stream updateStreamMeta];
        
    });
  
}

- (void)unpublish {

  dispatch_async(dispatch_get_main_queue(), ^{
    if (_isStreaming) {
      [self.stream stop];
    }
    else {
      self.onUnpublishNotification(@{});
      [self tearDown];
    }
  });
  
}

- (void)swapCamera {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_isPublisher) {
            _useBackfacingCamera = !_useBackfacingCamera;
            AVCaptureDevice *device = [self getCameraDevice:_useBackfacingCamera];
            R5Camera *camera = (R5Camera *)[self.stream getVideoSource];
            [camera setDevice:device];
        }
    });
  
}

- (void)updateScaleMode:(int)mode {
    
    [self setScaleMode:mode];
    
}

- (void)updateScaleSize:(int)width withHeight:(int)height withScreenWidth:(int)screenWidth withScreenHeight:(int)screenHeight {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_playbackVideo) {
            float xscale = (width*1.0f) / (screenWidth*1.0f);
            float yscale = (height*1.0f) / (screenHeight*1.0f);
            int dwidth = [[UIScreen mainScreen] bounds].size.width;
            int dheight = [[UIScreen mainScreen] bounds].size.height;
            
            [self.controller setFrame:CGRectMake(0.0, 0.0, dwidth * xscale, dheight * yscale)];
        }
    });
    
}

- (void)tearDown {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.stream != nil) {
            [self.stream setDelegate:nil];
            [self.stream setClient:nil];
    }
  
        _streamName = nil;
        _isStreaming = NO;
    });

}

- (void)updateOrientation:(int)value {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_currentRotation == value) {
            return;
        }
        _currentRotation = value;
        [self.controller.view.layer setTransform:CATransform3DMakeRotation(value, 0.0, 0.0, 0.0)];
    });
  
}

- (void)onDeviceOrientation:(NSNotification *)notification {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_isPublisher) {
            R5Camera *camera = (R5Camera *)[self.stream getVideoSource];
            UIDeviceOrientation orientation = [UIDevice currentDevice].orientation;
  
            if (orientation == UIDeviceOrientationPortraitUpsideDown) {
                [camera setOrientation: 270];
            }
            else if (orientation == UIDeviceOrientationLandscapeLeft) {
                if (_useBackfacingCamera) {
                    [camera setOrientation: 0];
                }
                else {
                    [camera setOrientation: 180];
                }
            }
            else if (orientation == UIDeviceOrientationLandscapeRight) {
                if (_useBackfacingCamera) {
                    [camera setOrientation: 180];
                }
                else {
                    [camera setOrientation: 0];
                }
            }
            else {
                [camera setOrientation: 90];
            }
            [self.controller showPreview:YES];
            [self.stream updateStreamMeta];
    
        }
    });

}

- (void)layoutSubviews {
  
  [super layoutSubviews];
  if (_playbackVideo) {
    CGRect b = self.frame;
    [self.controller setFrame:CGRectMake(0.0, 0.0, b.size.width, b.size.height)];
  }
  
}

# pragma R5StreamDelegate
-(void)onR5StreamStatus:(R5Stream *)stream withStatus:(int) statusCode withMessage:(NSString*)msg {
  
  NSString *tmpStreamName = _streamName;
  
  if (statusCode == r5_status_start_streaming) {
    _isStreaming = YES;
  }
  
  dispatch_async(dispatch_get_main_queue(), ^{
    
    if (_isPublisher) {
      self.onPublisherStreamStatus(@{
                                     @"status": @{
                                         @"code": @(statusCode),
                                         @"message": msg,
                                         @"name": @(r5_string_for_status(statusCode)),
                                         @"streamName": tmpStreamName
                                         }
                                     });
    }
    else {
      self.onSubscriberStreamStatus(@{
                                      @"status": @{
                                          @"code": @(statusCode),
                                          @"message": msg,
                                          @"name": @(r5_string_for_status(statusCode)),
                                          @"streamName": tmpStreamName
                                          }
                                      });
    }
    
    if (statusCode == r5_status_disconnected && _isStreaming) {
      if (!_isPublisher) {
        self.onUnsubscribeNotification(@{});
      }
      else if (_isPublisher) {
        self.onUnpublishNotification(@{});
      }
      [self tearDown];
      _isStreaming = NO;
    }
    
  });
  
}

# pragma R5Stream:client
- (void)onMetaData:(NSString *)params {
  
  NSArray *paramListing = [params componentsSeparatedByString:@";"];
  for (id param in paramListing) {
    NSArray *keyValue = [(NSString *)param componentsSeparatedByString:@"="];
    NSString *key = (NSString *)[keyValue objectAtIndex:0];
    if ([key  isEqual: @"streamingMode"]) {
      NSString *streamMode = (NSString *)[keyValue objectAtIndex:1];
    }
    else if ([key isEqual: @"orientation"]) {
      [self updateOrientation:[[keyValue objectAtIndex:1] intValue]];
    }
  }
  
  dispatch_async(dispatch_get_main_queue(), ^{
    self.onMetaDataEvent(@{@"metadata": params});
  });
  
}

- (int)getScaleMode {
  return _scaleMode;
}
- (void)setScaleMode:(int)mode {
  _scaleMode = mode;
  if (_playbackVideo) {
    [self.controller setScaleMode:_scaleMode];
  }
}

- (BOOL)getShowDebugInfo {
  return _showDebugInfo;
}
- (void)setShowDebugInfo:(BOOL)show {
  _showDebugInfo = show;
  if (self.controller != nil) {
    [self.controller showDebugInfo:show];
  }
}

- (int)getLogLevel {
  return _logLevel;
}
- (void)setLogLevel:(int)level {
  _logLevel = level;
  r5_set_log_level(_logLevel);
}

- (BOOL)getPublishVideo {
  return _useVideo;
}
- (void)setPublishVideo:(BOOL)value {
  _useVideo = value;
}

- (BOOL)getPublishAudio {
  return _useAudio;
}
- (void)setPublishAudio:(BOOL)value {
  _useAudio = value;
}

- (BOOL)getSubscribeVideo {
  return _playbackVideo;
}
- (void)setSubscribeVideo:(BOOL)value {
  _playbackVideo = value;
}

- (int)getCameraWidth {
  return _cameraWidth;
}
- (void)setCameraWidth:(int)value {
  _cameraWidth = value;
}

- (int)getCameraHeight {
  return _cameraHeight;
}
- (void)setCameraHeight:(int)value {
  _cameraHeight = value;
}

- (int)getBitrate {
  return _bitrate;
}
- (void)setBitrate:(int)value {
  _bitrate = value;
}

- (int)getFramerate {
  return _framerate;
}
- (void)setFramerate:(int)value {
  _framerate = value;
}

- (int)getAudioBitate {
  return _audioBitrate;
}
- (void)setAudioBitrate:(int)value {
  _audioBitrate = value;
}

- (int)getAudioSampleRate {
  return _audioSampleRate;
}
- (void)setAudioSampleRate:(int)value {
  _audioSampleRate = value;
}

- (int)getAudioMode {
  return _audioMode;
}
- (void)setAudioMode:(int)value {
  _audioMode = value;
}

- (BOOL)getUseBackfacingCamera {
  return _useBackfacingCamera;
}
- (void)setUseBackfacingCamera:(BOOL)value {
  _useBackfacingCamera = value;
}

- (BOOL)getUseAdaptiveBitrateController {
  return _useAdaptiveBitrateController;
}
- (void)setUseAdaptiveBitrateController:(BOOL)value {
  _useAdaptiveBitrateController = value;
}

@end
