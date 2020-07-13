//
//  R5LayoutEventEmitter.h
//  R5VideoView
//
//  Created by Todd Anderson on 04/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <React/RCTComponent.h>

@protocol R5LayoutEventEmitter <NSObject>

@property (nonatomic, copy) RCTBubblingEventBlock onConfigured;
@property (nonatomic, copy) RCTBubblingEventBlock onMetaDataEvent;
@property (nonatomic, copy) RCTBubblingEventBlock onPublisherStreamStatus;
@property (nonatomic, copy) RCTBubblingEventBlock onSubscriberStreamStatus;
@property (nonatomic, copy) RCTBubblingEventBlock onUnpublishNotification;
@property (nonatomic, copy) RCTBubblingEventBlock onUnsubscribeNotification;

@end
