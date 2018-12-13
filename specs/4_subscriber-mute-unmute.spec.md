# Tests 4: Subscriber Mute/Unmute

## Scenario 4.0: Subscriber Mute (iOS and Android)

###Steps

1. Start a Broadcast session with another device on the target sever with a given stream name
2. Launch the react native app
3. Enter the Host, License and Stream Name values
4. Click on Subscribe
5. After the subscription session is played back for a few seconds/minutes, click on the upper-right Volume Icon

### Expected Result

You cannot hear audio from the broadcast.

## Scenario 4.1: Subscriber Unmute (iOS and Android)

### Steps

1. Continue from above scenario
4. Click on the upper-right Volume Icon (to unmute audio)

### Expected Result

The audio is heard again from the broadcast.
