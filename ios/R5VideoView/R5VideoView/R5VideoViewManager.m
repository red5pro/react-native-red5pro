//
//  R5VideoViewManager.m
//  React Native Red5Pro
//
//  Created by Todd Anderson on 10/27/17.
//  Copyright © 2017 Infrared5, Inc. All rights reserved.
//

#import <React/RCTViewManager.h>
#import <R5Streaming/R5Streaming.h>
#import <React/RCTUIManager.h>

#import "R5VideoView.h"
#import "R5StreamItem.h"
#import "R5StreamModule.h"
#import "R5StreamPublisher.h"
#import "R5StreamSubscriber.h"
#import "R5VideoViewManager.h"

static NSMutableDictionary *_streamMap;

@implementation R5VideoViewManager

RCT_EXPORT_MODULE()

// TODO:
//+ (BOOL)requiresMainQueueSetup
//{
//    return NO;
//}

# pragma RN Events
RCT_EXPORT_VIEW_PROPERTY(onConfigured, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMetaDataEvent, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPublisherStreamStatus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSubscriberStreamStatus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnpublishNotification, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnsubscribeNotification, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(subscribe:(nonnull NSNumber *)reactTag streamName:(nonnull NSString *)streamName) {
    
    RCTLogInfo(@"R5VideoViewManager:subscribe(%@)", streamName);
    NSMutableDictionary *map = [R5StreamModule streamMap];
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            R5StreamItem *item = [map objectForKey:streamName];
            if (item == nil || [item getStreamInstance] == nil) {
                RCTLog(@"Creating new subscriber instance for %@", streamName);
                R5StreamItem *newItem = [[R5StreamItem alloc] initWithConfiguration:[view configuration]];
                R5StreamSubscriber *subscriber = [[R5StreamSubscriber alloc] init];
                [newItem setStreamInstance:subscriber];
                [map setObject:newItem forKey:streamName];
                [view setStreamInstance:(NSObject<R5StreamInstance> *)subscriber];
                [view subscribe:streamName];
            } else {
                [view setStreamInstance:[item getStreamInstance]];
                if ([view getIsAttached]) {
                    [view attach];
                }
            }
        }
    }];
    
}

RCT_EXPORT_METHOD(unsubscribe:(nonnull NSNumber *)reactTag) {
    
    RCTLogInfo(@"R5VideoViewManager:unsubscribe()");
    NSMutableDictionary *map = [R5StreamModule streamMap];
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            NSString *streamName = [view.configuration streamName];
            R5StreamItem *item = [map objectForKey:streamName];
            if (item != nil) {
                [view unsubscribe];
                [item clear];
                [map removeObjectForKey:streamName];
            } else {
                [view unsubscribe];
            }
        }
    }];
    
}

RCT_EXPORT_METHOD(publish:(nonnull NSNumber *)reactTag streamName:(nonnull NSString *)streamName withMode:(int)publishMode) {
    
    RCTLogInfo(@"R5VideoViewManager:publish(%@)", streamName);
    NSMutableDictionary *map = [R5StreamModule streamMap];
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            R5StreamItem *item = [map objectForKey:streamName];
            if (item == nil || [item getStreamInstance] == nil) {
                RCTLog(@"Creating new publisher instance for %@", streamName);
                R5StreamItem *newItem = [[R5StreamItem alloc] initWithConfiguration:[view configuration]];
                R5StreamPublisher *publisher = [[R5StreamPublisher alloc] init];
                [item setStreamInstance:publisher];
                [map setObject:newItem forKey:streamName];
                [view setStreamInstance:(NSObject<R5StreamInstance> *)publisher];
                [view publish:streamName withMode:publishMode];
            } else {
                NSObject<R5StreamInstance> *stream = [item getStreamInstance];
                [view setStreamInstance:stream];
                if ([view getIsAttached]) {
                    [view attach];
                }
            }
        }
    }];
    
}

RCT_EXPORT_METHOD(unpublish:(nonnull NSNumber *)reactTag) {
    
    RCTLogInfo(@"R5VideoViewManager:unpublish()");
    NSMutableDictionary *map = [R5StreamModule streamMap];
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            R5Configuration *configuration = [view configuration];
            NSString *streamName = [configuration streamName];
            R5StreamItem *item = [map objectForKey:streamName];
            if (item != nil) {
//                NSObject<R5StreamInstance> *stream = [item getStreamInstance];
//                if (stream != nil) {
//                    [(R5StreamPublisher *)stream unpublish];
//                    [stream setEmitter:nil];
//                }
                [view unpublish];
                [item clear];
//                [item setStreamInstance:nil];
                [map removeObjectForKey:streamName];
            } else {
                [view unpublish];
            }
        }
    }];
    
}

RCT_EXPORT_METHOD(swapCamera:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view swapCamera];
        }
    }];
    
}

RCT_EXPORT_METHOD(updateScaleMode:(nonnull NSNumber *)reactTag mode:(int)mode) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view updateScaleMode:mode];
        }
    }];
    
}

RCT_EXPORT_METHOD(updateScaleSize:(nonnull NSNumber *)reactTag width:(int)width withHeight:(int)height withScreenWidth:(int)screenWidth withScreenHeight:(int)screenHeight) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view updateScaleSize:width withHeight:height withScreenWidth:screenWidth withScreenHeight:screenHeight];
        }
    }];
    
}

RCT_EXPORT_METHOD(muteAudio:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view muteAudio];
        }
    }];
    
}

RCT_EXPORT_METHOD(unmuteAudio:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view unmuteAudio];
        }
    }];
    
}

RCT_EXPORT_METHOD(muteVideo:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view muteVideo];
        }
    }];
    
}

RCT_EXPORT_METHOD(unmuteVideo:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view unmuteVideo];
        }
    }];
    
}

RCT_EXPORT_METHOD(setPlaybackVolume:(nonnull NSNumber *)reactTag value:(int)value) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view setPlaybackVolume:value];
        }
    }];
    
}

RCT_EXPORT_METHOD(attach:(nonnull NSNumber *)reactTag withId:(NSString* )streamId) {
    NSMutableDictionary *map = [R5StreamModule streamMap];
    if ([map objectForKey:streamId] != nil) {
        R5StreamItem *item = [map objectForKey:streamId];
        [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
            R5VideoView *view = viewRegistry[reactTag];
            if (![view isKindOfClass:[R5VideoView class]]) {
                RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
            } else {
                RCTLog(@"Found view for instance attach(%@).", streamId);
                [view setStreamInstance:[item getStreamInstance]];
                [view attach];
            }
        }];
    }
}

RCT_EXPORT_METHOD(detach:(nonnull NSNumber *)reactTag withId:(NSString* )streamId) {
    NSMutableDictionary *map = [R5StreamModule streamMap];
    if ([map objectForKey:streamId] != nil) {
        [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
            R5VideoView *view = viewRegistry[reactTag];
            if (![view isKindOfClass:[R5VideoView class]]) {
                RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
            } else {
                RCTLog(@"Found view for instance detach(%@).", streamId);
                [view detach];
            }
        }];
    }
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
RCT_EXPORT_VIEW_PROPERTY(enableBackgroundStreaming, BOOL);

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
  
    BOOL autoAttach = YES;
    if (json[@"autoAttachView"] != nil) {
        autoAttach = [json[@"autoAttachView"] boolValue];
    }
    [view loadConfiguration:configuration forKey:json[@"key"] andAttach:autoAttach];

}

- (UIView *)view {
  R5VideoView *r5View = [[R5VideoView alloc] init];
  return r5View;
}

@end
