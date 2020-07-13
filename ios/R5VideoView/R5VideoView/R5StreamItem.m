//
//  R5StreamItem.m
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import "R5StreamItem.h"
#import "R5StreamInstance.h"

@interface R5StreamItem() {
    
    R5Configuration *_configuration;
    NSObject<R5StreamInstance> *_streamInstance;
    
}
@end


@implementation R5StreamItem

- (void)clear {
    _configuration = nil;
    _streamInstance = nil;
}

- (id)initWithConfiguration:(R5Configuration *)configuration {
    
    if (self = [super init]) {
        _configuration = configuration;
    }
    return self;
    
}

- (R5Configuration *)getConfiguration {
    return _configuration;
}

- (NSObject<R5StreamInstance> *)getStreamInstance {
    return _streamInstance;
}

- (void)setStreamInstance:(NSObject<R5StreamInstance> *)streamInstance {
    _streamInstance = streamInstance;
}

@end
