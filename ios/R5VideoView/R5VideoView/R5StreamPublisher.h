//
//  R5StreamPublisher.h
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <React/RCTEventEmitter.h>
#import <R5Streaming/R5Streaming.h>
#import "R5StreamInstance.h"
#import "R5VideoView.h"

@interface R5StreamPublisher : NSObject<R5StreamDelegate>

@property R5VideoView *viewEmitter;

@property R5Stream *stream;
@property R5Connection *connection;
@property R5Configuration *configuration;
@property R5VideoViewController *controller;

- (id)initWithDeviceEmitter:(RCTEventEmitter *)emitter;
- (void)publish:(R5Configuration *)configuration withType:(int)type andProps:(NSDictionary *)props;
- (void)unpublish;

- (void)swapCamera;

@end
