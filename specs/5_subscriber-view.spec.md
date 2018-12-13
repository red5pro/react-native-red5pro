# Tests 5: Subscriber View

## Scenario 5.0: Subscriber With View (iOS and Android)

### Steps

1. Start a Broadcast session with another device on the target sever with a given stream name
2. Launch the react native app
3. Enter the Host, License and Stream Name values
4. Keep the Show Video On Subscribe option selected
5. Click on Subscribe

### Expected Result

1. The subscription session has video and audio (assuming the broadcasting is broadcasting both video and audio).

## Scenario 5.1: Subscriber No View (iOS and Android)

### Steps

1. Start a Broadcast session with another device on the target sever with a given stream name
2. Launch the react native app
3. Enter the Host, License and Stream Name values
4. Tick Off the Show Video On Subscribe option selection (to turn off video subscription)
5. Click on Subscribe

### Expected Results

1. The subscription session has no video
2. The subscription session has audio (assuming the broadcasting is - at least - audio).
