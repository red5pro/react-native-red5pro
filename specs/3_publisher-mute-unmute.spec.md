# Tests 3: Publish Mute/Unmute

## Scenario 3.0: Publish Mute Audio (iOS and Android)

### Steps
1. Launch the react native app.
2. Enter the Host, License and Stream Name values
3. Click Publish
4. Subscribe to the broadcast on another device
5. After the Publish session has run for a few seconds minutes, click the upper-right Mic Icon.

### Expected Results

1. The Subscription session stops receiving audio from the broadcast
2. The Subscription session still receives video of broadcast

## Scenario 3.1: Publisher Unmute Audio (iOS and Android)

### Steps

1. Continue from above scenario
2. Click on the upper-right Mic Icon a second time (to unmute)

### Expected Result

The audio of the broadcast is heard again on the subscriber side.

## Scenario 3.2: Publisher Mute Video (iOS and Android)

### Steps

1. Continue from above scenario
2. Click on the upper-right Video Icon

### Expected Results
1. The Subscription session stops receiving video from the broadcast.
2. The Subscription session still receives audio of broadcast.

## Scenario 3.3: Publisher Unmute Video (iOS and Android)

### Steps

1. Continue from above scenario
2. Click on the upper-right Video Icon (to unmute video)

### Expected Result

The Subscription session starts receiving video from the broadcast again.
