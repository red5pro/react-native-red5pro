//
//  R5StreamSubscriber.h
//  R5VideoView
//
//  Created by Todd Anderson on 04/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <React/RCTEventEmitter.h>
#import <R5Streaming/R5Streaming.h>
#import "R5StreamInstance.h"
#import "R5VideoView.h"

@interface R5StreamSubscriber : NSObject<R5StreamInstance, R5StreamDelegate>

@property NSObject<R5LayoutEventEmitter> *viewEmitter;

@property R5Stream *stream;
@property R5Connection *connection;
@property R5Configuration *configuration;

- (id)initWithDeviceEmitter:(RCTEventEmitter *)emitter;
- (void)subscribe:(R5Configuration *)configuration andProps:(NSDictionary *)props;
- (void)unsubscribe;
- (void)setPlaybackVolume:(int)value;

@end
