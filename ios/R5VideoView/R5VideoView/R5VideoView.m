//
//  R5VideoView.m
//  React Native Red5 Pro
//
//  Created by Todd Anderson on 10/27/17.
//  Copyright © 2017 Infrared5, Inc. All rights reserved.
//

#import "R5VideoView.h"
#import "R5StreamPublisher.h"
#import "R5StreamSubscriber.h"

@interface R5VideoView() {
  
    BOOL _attached;
    NSObject<R5StreamInstance> *_streamInstance;
    
    int _scaleMode;
    int _logLevel;
    int _audioMode;
    BOOL _showDebugInfo;
    NSString *_streamName;  // required.
  
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
    BOOL _enableBackgroundStreaming;
    BOOL _hasExplicitlyPausedVideo;
    
    int _currentRotation;
  
}
@end

@implementation R5VideoView

- (id)init {
  
  if (self = [super init]) {
    
      _attached = NO;
      
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
      _hasExplicitlyPausedVideo = NO;
      r5_set_log_level(_logLevel);
      [self addObservers];
    
  }
  return self;
  
}

- (void)onWillResignActive:(NSNotification *)notification {
    [self sendToBackground];
}
- (void)onEnterForegroundActive:(NSNotification *)notification {
    [self bringToForeground];
}

- (void)addObservers {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onWillResignActive:) name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onEnterForegroundActive:) name:UIApplicationWillEnterForegroundNotification object:nil];
}

- (void)removeObservers {
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
}

- (void)loadConfiguration:(R5Configuration *)configuration forKey:(NSString *)key andAttach:(BOOL)autoAttach {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        
        _attached = autoAttach;
        self.configuration = configuration;
        if (self.onConfigured) {
            self.onConfigured(@{@"key": key});
        }
        
    });
  
}

- (NSDictionary *)getSubscriberProps {
    return @{
             @"logLevel": @(_logLevel),
             @"scaleMode": @(_scaleMode),
             @"audioMode": @(_audioMode),
             @"showDebugView": @(_showDebugInfo),
             @"subscribeVideo": @(_playbackVideo),
             @"enableBackgroundStreaming": @(_enableBackgroundStreaming)
             };
}

- (void)subscribe:(NSString *)streamName {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamSubscriber.class]) {
            [self.configuration setStreamName:streamName];
            NSDictionary *props = [self getSubscriberProps];
            [(R5StreamSubscriber *)_streamInstance subscribe:self.configuration andProps:props];
            if (_attached) {
                [self attach];
            }
        }
        
    });
  
}

- (void)unsubscribe {
  
    if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamSubscriber.class]) {
        [(R5StreamSubscriber *)_streamInstance unsubscribe];
    }
    [self detach];
  
}

- (NSDictionary *)getPublisherProps {
    return @{
             @"logLevel": @(_logLevel),
             @"scaleMode": @(_scaleMode),
             @"audioMode": @(_audioMode),
             @"showDebugView": @(_showDebugInfo),
             @"publishVideo": @(_useVideo),
             @"publishAudio": @(_useAudio),
             @"bitrate": @(_bitrate),
             @"framerate": @(_framerate),
             @"audioBitrate": @(_audioBitrate),
             @"audioSampleRate": @(_audioSampleRate),
             @"cameraWidth": @(_cameraWidth),
             @"cameraHeight": @(_cameraHeight),
             @"useBackfacingCamera": @(_useBackfacingCamera),
             @"enableBackgroundStreaming": @(_enableBackgroundStreaming),
             @"useAdaptiveBitrateController": @(_useAdaptiveBitrateController)
             };
}

- (void)publish:(NSString *)streamName withMode:(int)publishMode {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [self.configuration setStreamName:streamName];
            NSDictionary *props = [self getPublisherProps];
            [(R5StreamPublisher *)_streamInstance publish:self.configuration withType:publishMode andProps:props];
            if (_attached) {
                [self attach];
            }
        }
        
    });
  
}

- (void)unpublish {

//    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [(R5StreamPublisher *)_streamInstance unpublish];
//            [_streamInstance setEmitter:nil];
        }
//        [self setStreamInstance:nil];
        [self detach];
//    });
  
}

- (void)updateScaleMode:(int)mode {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        _scaleMode = mode;
        if (self.controller != nil) {
            [self.controller setScaleMode:mode];
        }
    });
    
}

- (void)swapCamera {
  
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [(R5StreamPublisher *)_streamInstance swapCamera];
        }
    });
  
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

- (void)muteAudio {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [(R5StreamPublisher *)_streamInstance muteAudio];
        }
    });
}
- (void)unmuteAudio {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [(R5StreamPublisher *)_streamInstance unmuteAudio];
        }
    });
}
- (void)muteVideo {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [(R5StreamPublisher *)_streamInstance muteVideo];
        }
    });
}
- (void)unmuteVideo {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamPublisher.class]) {
            [(R5StreamPublisher *)_streamInstance unmuteVideo];
        }
    });
}

- (void)setPlaybackVolume:(int)value {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamSubscriber.class]) {
            [(R5StreamSubscriber *)_streamInstance setPlaybackVolume:value];
        }
    });
}

- (void)sendToBackground {

    if (_enableBackgroundStreaming && self.controller != nil) {
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamSubscriber.class]) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self.controller pauseRender];
            });
        }
    }
    
}

- (void)bringToForeground {
   
    if (_enableBackgroundStreaming && self.controller != nil) {
        if (_streamInstance != nil && [_streamInstance isKindOfClass:R5StreamSubscriber.class]) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [self.controller resumeRender];
            });
        }
    }
    
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

- (void)layoutSubviews {
  
  [super layoutSubviews];
  if (_playbackVideo) {
    CGRect b = self.frame;
    [self.controller setFrame:CGRectMake(0.0, 0.0, b.size.width, b.size.height)];
  }
  
}

- (int)getScaleMode {
    return _scaleMode;
}
- (void)setScaleMode:(int)mode {
    _scaleMode = mode;
    if (self.controller != nil) {
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

- (BOOL)getEnableBackgroundStreaming {
    return _enableBackgroundStreaming;
}
- (void)setEnableBackgroundStreaming:(BOOL)value {
    _enableBackgroundStreaming = value;
}

- (void)setStreamInstance:(NSObject<R5StreamInstance> *)streamInstance {
    
//    if (_streamInstance != nil && streamInstance == nil) {
//        [_streamInstance setEmitter:nil];
//    }
    _streamInstance = streamInstance;
    if (_streamInstance != nil) {
        [_streamInstance setEmitter:self];
    }
    
}

- (R5VideoViewController *)getOrCreateVideoView {
    R5VideoViewController *ctrl = self.controller;
    if (ctrl == nil) {
        ctrl = [[R5VideoViewController alloc] init];
        UIView *view = [[UIView alloc] initWithFrame:self.frame];
        [ctrl setView:view];
        [self addSubview:ctrl.view];
    }
    return ctrl;
}

- (void)attach {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil) {
            self.controller = [self getOrCreateVideoView];
            [self.controller showDebugInfo:_showDebugInfo];
            [self.controller setScaleMode:_scaleMode];
            [_streamInstance setVideoView:self.controller];
            _attached = YES;
        }
    });

}

- (void)detach {
    
    _attached = NO;
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_streamInstance != nil) {
            [_streamInstance removeVideoView:self.controller];
            [self setStreamInstance:nil];
        }
        if (self.controller != nil) {
            [self.controller.view removeFromSuperview];
            [self.controller setView:nil];
            [self.controller removeFromParentViewController];
            self.controller = nil;
        }
    });
    
}

- (BOOL)getIsAttached {
    return _attached;
}

@end
