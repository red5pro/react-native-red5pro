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
#import "R5VideoViewManager.h"

@implementation R5VideoViewManager

RCT_EXPORT_MODULE()

# pragma RN Events
RCT_EXPORT_VIEW_PROPERTY(onConfigured, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onMetaDataEvent, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onPublisherStreamStatus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onSubscriberStreamStatus, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnpublishNotification, RCTBubblingEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onUnsubscribeNotification, RCTBubblingEventBlock)

RCT_EXPORT_METHOD(subscribe:(nonnull NSNumber *)reactTag streamName:(nonnull NSString *)streamName) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view subscribe:streamName];
        }
    }];
    
}

RCT_EXPORT_METHOD(unsubscribe:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view unsubscribe];
        }
    }];
}

RCT_EXPORT_METHOD(publish:(nonnull NSNumber *)reactTag streamName:(nonnull NSString *)streamName withMode:(int)publishMode) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view publish:streamName withMode:publishMode];
        }
    }];
    
}

RCT_EXPORT_METHOD(unpublish:(nonnull NSNumber *)reactTag) {
    
    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
        R5VideoView *view = viewRegistry[reactTag];
        if (![view isKindOfClass:[R5VideoView class]]) {
            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
        } else {
            [view unpublish];
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

//RCT_EXPORT_METHOD(sendToBackground:(nonnull NSNumber *)reactTag) {
//    
//    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
//        R5VideoView *view = viewRegistry[reactTag];
//        if (![view isKindOfClass:[R5VideoView class]]) {
//            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
//        } else {
//            [view sendToBackground];
//        }
//    }];
//    
//}
//
//RCT_EXPORT_METHOD(bringToForeground:(nonnull NSNumber *)reactTag) {
//    
//    [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, R5VideoView *> *viewRegistry) {
//        R5VideoView *view = viewRegistry[reactTag];
//        if (![view isKindOfClass:[R5VideoView class]]) {
//            RCTLogError(@"Invalid view returned from registry, expecting R5VideoView, got: %@", view);
//        } else {
//            [view bringToForeground];
//        }
//    }];
//    
//}

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
  
  [view loadConfiguration:configuration forKey:json[@"key"]];

}

//- (void)onDeviceOrientation:(NSNotification *)notification {
//  [r5View onDeviceOrientation:notification];
//}
//
//- (void)addObservers {
//  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onDeviceOrientation:) name:UIDeviceOrientationDidChangeNotification object:nil];
//}
//
//- (void)removeObservers {
//  [[NSNotificationCenter defaultCenter] removeObserver:self name:UIDeviceOrientationDidChangeNotification object:nil];
//}

- (UIView *)view {
  R5VideoView *r5View = [[R5VideoView alloc] init];
//  [self addObservers];
  return r5View;
}

@end
