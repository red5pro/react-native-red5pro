//
//  R5VideoView.h
//  React Native Red5 Pro
//
//  Created by Todd Anderson on 10/27/17.
//  Copyright © 2017 Infrared5, Inc. All rights reserved.
//

#ifndef R5VideoView_h
#define R5VideoView_h

#import <UIKit/UIKit.h>
#import <React/RCTView.h>
#import <React/RCTComponent.h>
#import <React/RCTBridgeModule.h>
#import <R5Streaming/R5Streaming.h>
#import "R5StreamInstance.h"
#import "R5LayoutEventEmitter.h"

@interface R5VideoView : RCTView<R5LayoutEventEmitter>

@property R5Stream *stream;
@property R5Connection *connection;
@property R5Configuration *configuration;
@property R5VideoViewController *controller;

- (void)loadConfiguration:(R5Configuration *)configuration forKey:(NSString *)key andAttach:(BOOL)autoAttach;

# pragma RN Events
@property (nonatomic, copy) RCTBubblingEventBlock onConfigured;
@property (nonatomic, copy) RCTBubblingEventBlock onMetaDataEvent;
@property (nonatomic, copy) RCTBubblingEventBlock onPublisherStreamStatus;
@property (nonatomic, copy) RCTBubblingEventBlock onSubscriberStreamStatus;
@property (nonatomic, copy) RCTBubblingEventBlock onUnpublishNotification;
@property (nonatomic, copy) RCTBubblingEventBlock onUnsubscribeNotification;

# pragma RN Methods
- (void)subscribe:(NSString *)streamName;
- (void)publish:(NSString *)streamName withMode:(int)publishMode;
- (void)unsubscribe;
- (void)unpublish;
- (void)swapCamera;
- (void)updateScaleMode:(int)mode;
- (void)updateScaleSize:(int)width withHeight:(int)height withScreenWidth:(int)screenWidth withScreenHeight:(int)screenHeight;
- (void)muteAudio;
- (void)unmuteAudio;
- (void)muteVideo;
- (void)unmuteVideo;
- (void)setPlaybackVolume:(int)value;

# pragma RN Properties
- (BOOL)getShowDebugInfo;
- (void)setShowDebugInfo:(BOOL)show;

- (int)getScaleMode;
- (void)setScaleMode:(int)mode;
@property (nonatomic, setter=setScaleMode:, getter=getScaleMode) int scaleMode;

- (int)getLogLevel;
- (void)setLogLevel:(int)level;
@property (setter=setLogLevel:, getter=getLogLevel) int logLevel;

- (BOOL)getPublishVideo;
- (void)setPublishVideo:(BOOL)value;
@property (nonatomic, setter=setPublishVideo:, getter=getPublishVideo) BOOL publishVideo;

- (BOOL)getPublishAudio;
- (void)setPublishAudio:(BOOL)value;
@property (nonatomic, setter=setPublishAudio:, getter=getPublishAudio) BOOL publishAudio;

- (BOOL)getSubscribeVideo;
- (void)setSubscribeVideo:(BOOL)value;
@property (nonatomic, setter=setSubscribeVideo:, getter=getSubscribeVideo) BOOL subscribeVideo;

- (void)setStreamInstance:(NSObject<R5StreamInstance> *)streamInstance;
- (void)attach;
- (void)detach;
- (BOOL)getIsAttached;

@end

#endif /* R5VideoView_h */
