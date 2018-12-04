//
//  R5StreamInstance.h
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <R5Streaming/R5Streaming.h>

@protocol R5StreamInstance <NSObject>

- (int) getEmitter;
- (void) setEmitter:(int)emitter;
- (void) setVideoView:(R5VideoViewController *)view;
- (void) removeVideoView:(R5VideoViewController *)view;
- (void) updateLogLevel:(int)level;


@end
