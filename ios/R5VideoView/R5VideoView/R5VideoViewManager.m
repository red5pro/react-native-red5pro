//
//  R5VideoViewManager.m
//  React Native Red5Pro
//
//  Created by Todd Anderson on 10/27/17.
//  Copyright © 2017 Infrared5, Inc. All rights reserved.
//

#import <React/RCTViewManager.h>
#import <R5Streaming/R5Streaming.h>

#import "R5VideoView.h"
#import "R5VideoViewManager.h"

@interface R5VideoViewManager() {

  R5VideoView *r5View;

}
@end

@implementation R5VideoViewManager

# pragma RN Events
RCT_EXPORT_VIEW_PROPERTY(onConfigured, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMetaDataEvent, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPublisherStreamStatus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSubscriberStreamStatus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnpublishNotification, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnsubscribeNotification, RCTBubblingEventBlock)


# pragma RN Methods
RCT_EXPORT_METHOD(subscribe:(nonnull NSString *)streamName) {
  [r5View subscribe:streamName];
}

RCT_EXPORT_METHOD(unsubscribe) {
  [r5View unsubscribe];
}

RCT_EXPORT_METHOD(publish:(nonnull NSString *)streamName withMode:(int)publishMode) {
  [r5View publish:streamName withMode:publishMode];
}

RCT_EXPORT_METHOD(unpublish) {
  [r5View unpublish];
}

RCT_EXPORT_METHOD(swapCamera) {
  [r5View swapCamera];
}

RCT_EXPORT_METHOD(updateScaleMode:(int)mode) {
    [r5View updateScaleMode:mode];
}

RCT_EXPORT_METHOD(updateScaleSize:(int)width withHeight:(int)height withScreenWidth:(int)screenWidth withScreenHeight:(int)screenHeight) {
    [r5View updateScaleSize:width withHeight:height withScreenWidth:screenWidth withScreenHeight:screenHeight];
}

# pragma RN Properties
RCT_EXPORT_VIEW_PROPERTY(logLevel, int);
RCT_EXPORT_VIEW_PROPERTY(scaleMode, int);
RCT_EXPORT_VIEW_PROPERTY(publishVideo, BOOL);
RCT_EXPORT_VIEW_PROPERTY(publishAudio, BOOL);
RCT_EXPORT_VIEW_PROPERTY(subscribeVideo, BOOL);
RCT_EXPORT_VIEW_PROPERTY(cameraWidth, int);
RCT_EXPORT_VIEW_PROPERTY(cameraHeight, int);
RCT_EXPORT_VIEW_PROPERTY(bitrate, int);
RCT_EXPORT_VIEW_PROPERTY(framerate, int);
RCT_EXPORT_VIEW_PROPERTY(audioMode, int);
RCT_EXPORT_VIEW_PROPERTY(audioBitrate, int);
RCT_EXPORT_VIEW_PROPERTY(audioSampleRate, int);
RCT_EXPORT_VIEW_PROPERTY(useBackfacingCamera, BOOL);
RCT_EXPORT_VIEW_PROPERTY(useAdaptiveBitrateController, BOOL);

RCT_CUSTOM_VIEW_PROPERTY(showDebugView, BOOL, R5VideoView) {
  [view setShowDebugInfo:[json boolValue]];
}

RCT_CUSTOM_VIEW_PROPERTY(configuration, R5Configuration, R5VideoView) {
  
  R5Configuration *configuration = [[R5Configuration alloc] init];
  configuration.protocol = 1;
  configuration.host = json[@"host"];
  configuration.port = [json[@"port"] intValue];
  configuration.contextName = json[@"contextName"];
  configuration.streamName = json[@"streamName"];
  configuration.bundleID = json[@"bundleID"];
  configuration.licenseKey = json[@"licenseKey"];
  configuration.buffer_time = [json[@"bufferTime"] floatValue];
  configuration.stream_buffer_time = [json[@"streamBufferTime"] floatValue];
  configuration.parameters = json[@"parameters"];
  
  [view loadConfiguration:configuration forKey:json[@"key"]];

}

RCT_EXPORT_MODULE()

- (void)onDeviceOrientation:(NSNotification *)notification {
  [r5View onDeviceOrientation:notification];
}

- (void)addObservers {
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onDeviceOrientation:) name:UIDeviceOrientationDidChangeNotification object:nil];
}

- (void)removeObservers {
  [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceOrientationDidChangeNotification object:nil];
}

- (UIView *)view {
  r5View = [[R5VideoView alloc] init];
  
  [self addObservers];
  
  return r5View;
}

@end
