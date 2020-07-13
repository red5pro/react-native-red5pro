//
//  R5StreamModule.h
//  R5VideoView
//
//  Created by Todd Anderson on 03/12/2018.
//  Copyright © 2018 Red5Pro. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface R5StreamModule : RCTEventEmitter <RCTBridgeModule> {
    
}

+(NSMutableDictionary *)streamMap;

@end
