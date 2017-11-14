//
//  R5VideoView.m
//  Red5ProDemo
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
    
    R5VideoViewController *ctrl = [[R5VideoViewController alloc] init];
    [ctrl setView:self];
    
    self.controller = ctrl;
    
    _scaleMode = 0;
    _logLevel = 3;
    _showDebugInfo = NO;
    _useVideo = YES;
    _useAudio = YES;
    _bitrate = 750;
    _framerate = 15;
    _audioBitrate = 32;
    _cameraWidth = 640;
    _cameraHeight = 360;
    _audioSampleRate = 16000;
    _useAdaptiveBitrateController = NO;
    _audioMode = R5AudioControllerModeStandardIO;
    _useBackfacingCamera = NO;
    
  }
  return self;
  
}

- (void)loadConfiguration:(R5Configuration *)configuration forKey:(NSString *)key {
  
  R5Connection *connection = [[R5Connection alloc] initWithConfig:configuration];
  R5Stream *stream = [[R5Stream alloc] initWithConnection:connection];
  [stream setDelegate:self];
  [stream setClient:self];
  
  self.stream = stream;
  self.connection = connection;
  [self.controller showPreview:YES];
  [self.controller showDebugInfo:_showDebugInfo];
  [self.controller attachStream:self.stream];
  
  UIViewController *rootVc = [UIApplication sharedApplication].delegate.window.rootViewController;
  [self.controller setFrame:rootVc.view.frame];
  
  // Needed to dispatch event on main thread as this request on configuration was made through RN. (?)
  dispatch_async(dispatch_get_main_queue(), ^{
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
  
  _isPublisher = NO;
  _streamName = streamName;
  
  [self.controller setScaleMode:_scaleMode];
  [self.stream setAudioController:[[R5AudioController alloc] initWithMode:_audioMode]];
  
  [self.stream play:streamName];
  
}

- (void)unsubscribe {
  
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

- (void)publish:(NSString *)streamName withMode:(int)publishMode {
  
  _isPublisher = YES;
  _streamName = streamName;
  
  if (_useVideo) {
    AVCaptureDevice *video = [self getCameraDevice:_useBackfacingCamera];
    R5Camera *camera = [[R5Camera alloc] initWithDevice:video andBitRate:_bitrate];
    [camera setWidth:_cameraWidth];
    [camera setHeight:_cameraHeight];
    [camera setOrientation:90];
    [camera setFps:_framerate];
    [self.stream attachVideo:camera];
  }
  if (_useAudio) {
    AVCaptureDevice *audio = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeAudio];
    R5Microphone *microphone = [[R5Microphone alloc] initWithDevice:audio];
    microphone.bitrate = _audioBitrate;
    microphone.sampleRate = _audioSampleRate;
    [self.stream attachAudio:microphone];
  }
  
  if (_useAdaptiveBitrateController) {
    R5AdaptiveBitrateController *abrController = [[R5AdaptiveBitrateController alloc] init];
    [abrController attachToStream:self.stream];
    [abrController setRequiresVideo:_useVideo];
  }
  
  [self onDeviceOrientation:NULL];
  [self.stream publish:streamName type:publishMode];
  [self.stream updateStreamMeta];
  
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
  
  if (_isPublisher) {
    _useBackfacingCamera = !_useBackfacingCamera;
    AVCaptureDevice *device = [self getCameraDevice:_useBackfacingCamera];
    R5Camera *camera = (R5Camera *)[self.stream getVideoSource];
    [camera setDevice:device];
  }
  
}

- (void)tearDown {
  
  if (self.stream != nil) {
    [self.stream setDelegate:nil];
    [self.stream setClient:nil];
  }
  
  _streamName = nil;
  _isStreaming = NO;

}

- (void)updateOrientation:(int)value {
  
  if (_currentRotation == value) {
    return;
  }
  _currentRotation = value;
  [self.controller.view.layer setTransform:CATransform3DMakeRotation(value, 0.0, 0.0, 0.0)];
  
}

- (void)onDeviceOrientation:(NSNotification *)notification {
  
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

}

- (void)layoutSubviews {
  
  [super layoutSubviews];
  CGRect b = self.frame;
  [self.controller setFrame:CGRectMake(0.0, 0.0, b.size.width, b.size.height)];
  
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
  [self.controller setScaleMode:_scaleMode];
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
