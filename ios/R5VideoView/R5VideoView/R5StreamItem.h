//
//  R5StreamItem.h
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <R5Streaming/R5Streaming.h>
#import "R5StreamInstance.h"

@interface R5StreamItem : NSObject

- (void)clear;
- (id)initWithConfiguration:(R5Configuration *)configuration;

- (R5Configuration *)getConfiguration;
- (NSObject<R5StreamInstance> *)getStreamInstance;
- (void)setStreamInstance:(NSObject<R5StreamInstance> *)streamIn;

@end
