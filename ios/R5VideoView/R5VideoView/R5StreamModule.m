//
//  R5StreamModule.m
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import "R5StreamModule.h"
#import "R5StreamItem.h"
#import "R5StreamPublisher.h"
#import "R5StreamSubscriber.h"
#import <R5Streaming/R5Streaming.h>
#import <React/RCTLog.h>

static NSMutableDictionary *_streamMap;

@implementation R5StreamModule
{
    bool hasListeners;
}

// TODO:
//+ (BOOL)requiresMainQueueSetup
//{
//    return NO;
//}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onConfigured",
             @"onMetaDataEvent",
             @"onSubscriberStreamStatus",
             @"onUnsubscribeNotification",
             @"onPublisherStreamStatus",
             @"onUnpublishNotification"];
}

-(void)startObserving {
    hasListeners = YES;
}

-(void)stopObserving {
    hasListeners = NO;
}

RCT_REMAP_METHOD(init,
                 streamId:(NSString *)streamId
                 configuration:(NSDictionary *)config
                 resolve:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:init() %@", streamId);
    R5Configuration *configuration = [[R5Configuration alloc] init];
    configuration.protocol = 1;
    configuration.host = [config objectForKey:@"host"];
    configuration.port = [[config objectForKey:@"port"] intValue];
    configuration.contextName = [config objectForKey:@"contextName"];
    configuration.streamName = [config objectForKey:@"streamName"];
    configuration.bundleID = [config objectForKey:@"bundleID"];
    configuration.licenseKey = [config objectForKey:@"licenseKey"];
    configuration.buffer_time = [[config objectForKey:@"bufferTime"] floatValue];
    configuration.stream_buffer_time = [[config objectForKey:@"streamBufferTime"] floatValue];
    configuration.parameters = [config objectForKey:@"parameters"];
    
    R5StreamItem *item = [[R5StreamItem alloc] initWithConfiguration:configuration];
    [[R5StreamModule streamMap] setObject:item forKey:streamId];
    resolve(streamId);
    
}

RCT_REMAP_METHOD(subscribe,
                 streamId:(NSString *)streamId
                 streamProps:(NSDictionary *)streamProps
                 resolve:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:subscribe() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        R5StreamSubscriber *streamInstance = [[R5StreamSubscriber alloc] initWithDeviceEmitter:self];
        if (streamInstance != nil) {
            [item setStreamInstance:(NSObject<R5StreamInstance> *)streamInstance];
            R5Configuration *config = [item getConfiguration];
            [(R5StreamSubscriber *)streamInstance subscribe:config andProps:streamProps];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(unsubscribe,
                 streamId:(NSString *)streamId
                 resolve:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:unsubscribe() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamSubscriber *)streamInstance unsubscribe];
            [[R5StreamModule streamMap] removeObjectForKey:streamId];
            [item clear];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(publish,
                 streamId:(NSString *)streamId
                 streamType:(int) type
                 streamProps:(NSDictionary *)streamProps
                 resolve:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:publish() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        R5StreamPublisher *streamInstance = [[R5StreamPublisher alloc] initWithDeviceEmitter:self];
        if (streamInstance != nil) {
            [item setStreamInstance:(NSObject<R5StreamInstance> *)streamInstance];
            R5Configuration *config = [item getConfiguration];
            [(R5StreamPublisher *)streamInstance publish:config withType:type andProps:streamProps];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(unpublish,
                 streamId:(NSString *)streamId
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:unpublish() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamPublisher *)streamInstance unpublish];
            [[R5StreamModule streamMap] removeObjectForKey:streamId];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(swapCamera,
                 streamId:(NSString *)streamId
                 withSwapCameraResolver:(RCTPromiseResolveBlock)resolve
                 withSwapCameraRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:swapCamera() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamPublisher *)streamInstance swapCamera];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(muteAudio,
                 streamId:(NSString *)streamId
                 withMuteAudioResolver:(RCTPromiseResolveBlock)resolve
                 withMuteAudioRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:muteAudio() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamPublisher *)streamInstance muteAudio];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(unmuteAudio,
                 streamId:(NSString *)streamId
                 withUnmuteAudioResolver:(RCTPromiseResolveBlock)resolve
                 withUnmuteAudioRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:unmuteAudio() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamPublisher *)streamInstance unmuteAudio];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(muteVideo,
                 streamId:(NSString *)streamId
                 withMuteVideoResolver:(RCTPromiseResolveBlock)resolve
                 withMuteVideoRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:muteVideo() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamPublisher *)streamInstance muteVideo];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(unmuteVideo,
                 streamId:(NSString *)streamId
                 withUnmuteVideoResolver:(RCTPromiseResolveBlock)resolve
                 withUnuteVideoRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:unmuteVideo() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamPublisher *)streamInstance unmuteVideo];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

RCT_REMAP_METHOD(setPlaybackVolume,
                 streamId:(NSString *)streamId
                 withVolume:(int)value
                 withVolumeResolver:(RCTPromiseResolveBlock)resolve
                 withVolumeRejector:(RCTPromiseRejectBlock)reject) {
    
    RCTLogInfo(@"R5StreamModule:setPlaybackVolume() %@", streamId);
    R5StreamItem *item = [[R5StreamModule streamMap] objectForKey:streamId];
    if (item != nil) {
        NSObject<R5StreamInstance> *streamInstance = [item getStreamInstance];
        if (streamInstance != nil) {
            [(R5StreamSubscriber *)streamInstance setPlaybackVolume:value];
            resolve(streamId);
            return;
        }
    }
    
    NSString *errorStr = [NSString stringWithFormat:@"Stream Configuration with id(%@) does not exist.", streamId];
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorStr };
    NSError *error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:NSURLErrorCannotFindHost userInfo:userInfo];
    reject(@"E_CONFIGURATION_ERROR", errorStr, error);
    
}

+(NSMutableDictionary *)streamMap {
    if (_streamMap == nil) {
        _streamMap = [[NSMutableDictionary alloc] init];
    }
    return _streamMap;
}

@end
