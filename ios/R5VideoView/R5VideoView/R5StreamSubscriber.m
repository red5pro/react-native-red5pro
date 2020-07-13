//
//  R5StreamSubscriber.m
//  R5VideoView
//
//  Created by Todd Anderson on 04/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <React/RCTEventEmitter.h>
#import <R5Streaming/R5Streaming.h>
#import "R5StreamSubscriber.h"
#import <React/RCTLog.h>

@interface R5StreamSubscriber() {
    
    BOOL _isStreaming;
    
    RCTEventEmitter *_emitter;
    
    int _logLevel;
    int _scaleMode;
    int _audioMode;
    BOOL _showDebugInfo;
    BOOL _playbackVideo;
    BOOL _enableBackgroundStreaming;
    BOOL _hardwareAccelerated;
    NSString *_streamName;  // required.
    
}
@end

@implementation R5StreamSubscriber
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
}

- (void)removeObservers {
    [self stopObserving];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
}

- (void)unpackProps:(NSDictionary *)props {
    
    _scaleMode = 0;
    _logLevel = 3;
    _showDebugInfo = NO;
    _playbackVideo = YES;
    _hardwareAccelerated = YES;
    _enableBackgroundStreaming = NO;
    
    if (props == nil) {
        return;
    }
    
    _logLevel = [props objectForKey:@"logLevel"] != nil ? [[props objectForKey:@"logLevel"] intValue] : _logLevel;
    _scaleMode = [props objectForKey:@"scaleMode"] != nil ? [[props objectForKey:@"scaleMode"] intValue] : _scaleMode;
    _audioMode = [props objectForKey:@"audioMode"] != nil ? [[props objectForKey:@"audioMode"] intValue] : _audioMode;
    _showDebugInfo = [props objectForKey:@"showDebugView"] != nil ? [[props objectForKey:@"showDebugView"] boolValue] : _showDebugInfo;
    _playbackVideo = [props objectForKey:@"subscribeVideo"] != nil ? [[props objectForKey:@"subscribeVideo"] boolValue] : _playbackVideo;
    _hardwareAccelerated = [props objectForKey:@"hardwareAccelerated"] != nil ? [[props objectForKey:@"hardwareAccelerated"] boolValue] : _hardwareAccelerated;
    _enableBackgroundStreaming = [props objectForKey:@"enableBackgroundStreaming"] != nil ? [[props objectForKey:@"enableBackgroundStreaming"] boolValue] : _enableBackgroundStreaming;
    
}

- (void)tearDown {
    
    RCTLogInfo(@"R5StreamSubscriber:teardown()");
    if (self.stream != nil) {
        [self.stream setDelegate:nil];
        [self.stream setClient:nil];
    }
    
    _streamName = nil;
    _isStreaming = NO;
    self.stream = nil;
    self.connection = nil;
    self.configuration = nil;
    [self removeObservers];
    
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

- (void)subscribe:(R5Configuration *)configuration andProps:(NSDictionary *)props {

    [self unpackProps:props];
    r5_set_log_level(_logLevel);
    
    dispatch_async(dispatch_get_main_queue(), ^{
        
        if (self.stream == nil) {
            [self establishConnection:configuration];
        }
        
        [self.stream setAudioController:[[R5AudioController alloc] initWithMode:self->_audioMode]];
        [self.stream play:self->_streamName withHardwareAcceleration:self->_hardwareAccelerated];
        
    });
    
}

- (void)unsubscribe {
    
    if (_isStreaming) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self.stream stop];
        });
    }
    else {
        [self emitEvent:@"onUnsubscribeNotification" withBody:@{}];
        [self tearDown];
    }
    
}

- (void)setPlaybackVolume:(int)value {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self->_isStreaming) {
            [[self.stream audioController] setVolume:(value/100)] ;
        }
    });
}

- (void)sendToBackground {
    
    if (!_enableBackgroundStreaming) {
        [self unsubscribe];
        return;
    }
    
}

- (void)bringToForeground {
    
    if (!_enableBackgroundStreaming) {
        return;
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
        if (self.stream != nil && _playbackVideo) {
            [view showDebugInfo:_showDebugInfo];
            [view attachStream:self.stream];
        }
//    });

}

- (void) removeVideoView:(R5VideoViewController *)view {
    
//    dispatch_async(dispatch_get_main_queue(), ^{
        if (self.stream != nil) {
            [view showDebugInfo:NO];
            //            [view removeStream]; // NOTE: Requires iOS SDK 5.3.0 or higher.
            [view attachStream:nil];
        }
//    });
    
}

- (void) updateLogLevel:(int)level {
    _logLevel = level;
    r5_set_log_level(_logLevel);
}

- (void)emitEvent:(NSString *)eventName withBody:(NSDictionary *)body {
    
    RCTLogInfo(@"R5StreamSubscriber:emitEvent(%@).", eventName);
    if (self.viewEmitter != nil) {
        RCTLogInfo(@"R5StreamSubscriber:send event on view...");
        if ([eventName isEqualToString:@"onMetaDataEvent"]) {
            self.viewEmitter.onMetaDataEvent(body);
        } else if([eventName isEqualToString:@"onSubscriberStreamStatus"]) {
            self.viewEmitter.onSubscriberStreamStatus(body);
        } else if([eventName isEqualToString:@"onUnsubscribeNotification"]) {
            self.viewEmitter.onUnsubscribeNotification(body);
        }
    }
    else if (_emitter != nil && hasListeners) {
        RCTLogInfo(@"R5StreamSubscriber:send event on module...");
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
        [self emitEvent:@"onSubscriberStreamStatus" withBody:@{@"status": status}] ;
        
        if (statusCode == r5_status_disconnected && self->_isStreaming) {
            [self emitEvent:@"onUnsubscribeNotification" withBody:@{}];
            self->_isStreaming = NO;
        }
        else if (statusCode == r5_status_connection_close) {
            [self tearDown];
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

