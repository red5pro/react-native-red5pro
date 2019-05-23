//
//  R5StreamPublisher.m
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <React/RCTEventEmitter.h>
#import <R5Streaming/R5Streaming.h>
#import "R5StreamPublisher.h"

@interface R5StreamPublisher() {
    
    BOOL _isStreaming;
    BOOL _hasExplicitlyPausedVideo;
    
    RCTEventEmitter *_emitter;
    int _recordType;
    NSString *_streamName;  // required.
    
    int _logLevel;
    int _scaleMode;
    int _audioMode;
    BOOL _showDebugInfo;
    
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
    BOOL _enableBackgroundStreaming;
    
}
@end

@implementation R5StreamPublisher
{
    bool hasListeners;
}

- (id)initWithDeviceEmitter:(RCTEventEmitter *)emitter {
    
    if ([super init] != nil) {
        _emitter = emitter;
        [self addObservers];
    }
    return self;
}

- (id)init {

    if ([super init] != nil) {
        [self addObservers];
    }
    return self;
    
}

-(void)startObserving {
    hasListeners = YES;
}

-(void)stopObserving {
    hasListeners = NO;
}

- (void)addObservers {
    [self startObserving];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onWillResignActive:) name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onEnterForegroundActive:) name:UIApplicationWillEnterForegroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onDeviceOrientation:) name:UIDeviceOrientationDidChangeNotification object:nil];
}

- (void)removeObservers {
    [self stopObserving];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceOrientationDidChangeNotification object:nil];
}

- (void)unpackProps:(NSDictionary *)props {
    
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
    _useBackfacingCamera = NO;
    _enableBackgroundStreaming = NO;
    _useAdaptiveBitrateController = NO;
    _audioMode = R5AudioControllerModeStandardIO;
    
    if (props == nil) {
        return;
    }
    
    _logLevel = [props objectForKey:@"logLevel"] != nil ? [[props objectForKey:@"logLevel"] intValue] : _logLevel;
    _scaleMode = [props objectForKey:@"scaleMode"] != nil ? [[props objectForKey:@"scaleMode"] intValue] : _scaleMode;
    _audioMode = [props objectForKey:@"audioMode"] != nil ? [[props objectForKey:@"audioMode"] intValue] : _audioMode;
    _showDebugInfo = [props objectForKey:@"showDebugView"] != nil ? [[props objectForKey:@"showDebugView"] boolValue] : _showDebugInfo;
    _useVideo = [props objectForKey:@"publishVideo"] != nil ? [[props objectForKey:@"publishVideo"] boolValue] : _useVideo;
    _useAudio = [props objectForKey:@"publishAudio"] != nil ? [[props objectForKey:@"publishAudio"] boolValue] : _useAudio;
    _cameraWidth = [props objectForKey:@"cameraWidth"] != nil ? [[props objectForKey:@"cameraWidth"] intValue] : _cameraWidth;
    _cameraHeight = [props objectForKey:@"cameraHeight"] != nil ? [[props objectForKey:@"cameraHeight"] intValue] : _cameraHeight;
    _bitrate = [props objectForKey:@"bitrate"] != nil ? [[props objectForKey:@"bitrate"] intValue] : _bitrate;
    _framerate = [props objectForKey:@"framerate"] != nil ? [[props objectForKey:@"framerate"] intValue] : _framerate;
    _audioBitrate = [props objectForKey:@"audioBitrate"] != nil ? [[props objectForKey:@"audioBitrate"] intValue] : _audioBitrate;
    _audioSampleRate = [props objectForKey:@"audioSampleRate"] != nil ? [[props objectForKey:@"audioSampleRate"] intValue] : _audioSampleRate;
    _useBackfacingCamera = [props objectForKey:@"useBackfacingCamera"] != nil ? [[props objectForKey:@"useBackfacingCamera"] boolValue] : _useBackfacingCamera;
    _enableBackgroundStreaming = [props objectForKey:@"enableBackgroundStreaming"] != nil ? [[props objectForKey:@"enableBackgroundStreaming"] boolValue] : _enableBackgroundStreaming;
    _useAdaptiveBitrateController = [props objectForKey:@"useAdaptiveBitrateController"] != nil ? [[props objectForKey:@"useAdaptiveBitrateController"] boolValue] : _useAdaptiveBitrateController;
}

- (void)tearDown {
    
    if (self.stream != nil) {
        [self.stream setDelegate:nil];
        [self.stream setClient:nil];
    }
    _streamName = nil;
    _isStreaming = NO;
    self.stream = nil;

    _hasExplicitlyPausedVideo = NO;
    [self removeObservers];
    [self setEmitter:nil];
    self.viewEmitter = nil;
    
}

- (void)establishConnection:(R5Configuration *)configuration {
    
    R5Connection *connection = [[R5Connection alloc] initWithConfig:configuration];
    R5Stream *stream = [[R5Stream alloc] initWithConnection:connection];
    [stream setDelegate:self];
    [stream setClient:self];
    
    _streamName = configuration.streamName;
    
    self.stream = stream;
    self.connection = connection;
    self.configuration = configuration;
    
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

- (void)publish:(R5Configuration *)configuration withType:(int)type andProps:(NSDictionary *)props {
    int recordType = R5RecordTypeLive;
    if (type == 1) {
        recordType = R5RecordTypeRecord;
    } else if (type == 2) {
        recordType = R5RecordTypeAppend;
    }
    
    _recordType = recordType;
    
    [self unpackProps:props];
    r5_set_log_level(_logLevel);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (self.stream == nil) {
            [self establishConnection:configuration];
        }
        
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
            [self.stream attachVideo:camera];
        }
        
        [self.stream publish:[self.configuration streamName] type:_recordType];
        [self onDeviceOrientation:NULL];
        [self.stream updateStreamMeta];
        
    });
    
}

- (void)unpublish {
    
    if (_isStreaming) {
        [self.stream stop];
    }
    else {
        [self emitEvent:@"onUnpublishNotification" withBody:@{}];
        [self tearDown];
    }
    
}

- (void)swapCamera {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        _useBackfacingCamera = !_useBackfacingCamera;
        AVCaptureDevice *device = [self getCameraDevice:_useBackfacingCamera];
        R5Camera *camera = (R5Camera *)[self.stream getVideoSource];
        [camera setDevice:device];
    });
    
}

- (void)muteAudio {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_isStreaming) {
            [self.stream setPauseAudio:YES];
        }
    });
    
}

- (void)unmuteAudio {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_isStreaming) {
            [self.stream setPauseAudio:NO];
        }
    });
    
}

- (void)muteVideo {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_isStreaming) {
            _hasExplicitlyPausedVideo = YES;
            [self.stream setPauseVideo:YES];
        }
    });
    
}

- (void)unmuteVideo {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        if (_isStreaming) {
            _hasExplicitlyPausedVideo = NO;
            [self.stream setPauseVideo:NO];
        }
    });
    
}

- (void)onDeviceOrientation:(NSNotification *)notification {
    
    dispatch_async(dispatch_get_main_queue(), ^{
        
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
        
        // Because there is no way to attach the view controller as a sub view controller... do it manually.
        UIInterfaceOrientation statusBarOrientation = [UIApplication sharedApplication].statusBarOrientation;
        AVCaptureVideoPreviewLayer *preview = [self.stream getPreviewLayer];
        if(statusBarOrientation == UIInterfaceOrientationPortrait){
            [[preview connection] setVideoOrientation:AVCaptureVideoOrientationPortrait];
        } else if (statusBarOrientation == UIInterfaceOrientationPortraitUpsideDown){
            [[preview connection] setVideoOrientation:AVCaptureVideoOrientationPortraitUpsideDown];
        } else if (statusBarOrientation == UIInterfaceOrientationLandscapeLeft){
            [[preview connection] setVideoOrientation:AVCaptureVideoOrientationLandscapeLeft];
        } else if (statusBarOrientation == UIInterfaceOrientationLandscapeRight){
            [[preview connection] setVideoOrientation:AVCaptureVideoOrientationLandscapeRight];
        }
        
        [self.stream updateStreamMeta];
        
    });
    
}

- (void)sendToBackground {
    
    if (!_enableBackgroundStreaming) {
        [self unpublish];
        return;
    }
    
    if (_isStreaming && self.stream != nil) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.stream setPauseVideo:YES];
        });
    }
    
}

- (void)bringToForeground {
    
    if (!_enableBackgroundStreaming) {
        return;
    }
    
    if (_isStreaming && self.stream != nil) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.stream setPauseVideo:_hasExplicitlyPausedVideo];
        });
    }
    
}

- (void)onWillResignActive:(NSNotification *)notification {
    [self sendToBackground];
}
- (void)onEnterForegroundActive:(NSNotification *)notification {
    [self bringToForeground];
}

- (NSObject<R5LayoutEventEmitter> *) getEmitter {
    return self.viewEmitter;
}

- (void) setEmitter:(NSObject<R5LayoutEventEmitter> *)emitter {
    self.viewEmitter = emitter;
}

- (void) setVideoView:(R5VideoViewController *)view {
    
//    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.stream != nil && _useVideo) {
            [view showDebugInfo:_showDebugInfo];
            [view attachStream:self.stream];
            [self.stream updateStreamMeta];
        }
//    });
    
}

- (void) removeVideoView:(R5VideoViewController *)view {
    
//    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.stream != nil) {
            [view showDebugInfo:NO];
//            [view attachStream:nil];
            [self.stream updateStreamMeta];
        }
//    });
    
}

- (void) updateLogLevel:(int)level {
    _logLevel = level;
    r5_set_log_level(_logLevel);
}

- (void)emitEvent:(NSString *)eventName withBody:(NSDictionary *)body {

    if (self.viewEmitter != nil) {
        if ([eventName isEqualToString:@"onMetaDataEvent"]) {
            self.viewEmitter.onMetaDataEvent(body);
        } else if([eventName isEqualToString:@"onPublisherStreamStatus"]) {
            self.viewEmitter.onPublisherStreamStatus(body);
        } else if([eventName isEqualToString:@"onUnpublishNotification"]) {
            self.viewEmitter.onUnpublishNotification(body);
        }
    }
    else if (_emitter != nil && hasListeners) {
        [_emitter sendEventWithName:eventName body:body];
    }
    
}

# pragma R5StreamDelegate
-(void)onR5StreamStatus:(R5Stream *)stream withStatus:(int) statusCode withMessage:(NSString*)msg {
    
    NSString *tmpStreamName = _streamName;
    
    if (statusCode == r5_status_start_streaming) {
        _isStreaming = YES;
    }
    
    dispatch_async(dispatch_get_main_queue(), ^{
        NSDictionary *status = @{
                                 @"code": @(statusCode),
                                 @"message": msg,
                                 @"name": @(r5_string_for_status(statusCode)),
                                 @"streamName": tmpStreamName
                                 };
        
        [self emitEvent:@"onPublisherStreamStatus" withBody:@{@"status": status}] ;
        
        if (statusCode == r5_status_disconnected && _isStreaming) {
            [self emitEvent:@"onUnpublishNotification" withBody:@{}];
            [self tearDown];
            _isStreaming = NO;
        }
    });
    
}

# pragma R5Stream:client
- (void)onMetaData:(NSString *)params {
   
    dispatch_async(dispatch_get_main_queue(), ^{
        [self emitEvent:@"onMetaDataEvent" withBody:@{@"metadata": params}];
    });
    
}

@end
