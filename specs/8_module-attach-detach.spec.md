# Tests 8: Attach/Detach

The `R5StreamModule` library provides the ability to establish and maintain a streaming session (for both publisher and subscribers) that is decoupled from a view (`R5VideoView`).

For these tests, you will need to utilize the `modular` examples from [examples](..examples).

## Scenario 8.0: Publisher Detach (Android & iOS)

### Steps

1. Launch the react native app pointing to the `modular` index
2. Enter the Host, License and Stream Name values
3. Click on Publisher
6. After the broadcast session has published for a few seconds/minutes, start a subscriber on another device
5. Back on the publisher device, click on the `Detach` button

### Expected Result

1. The publish preview UI is removed from the publisher device
2. The audio is still broadcast
3. The subscriber is still connected and receiving audio playback

## Scenario 8.1 Publisher Re-Attach (Android & iOS)

### Steps

1. Continue from the above scenario
3. Click on the `Attach` button to reattach the publisher preview

### Expected Result

1. The publisher preview UI is displayed again
2. The video is broadcasted again
3. The subscriber is still connected and receiving audio and video playback

## Scenario 8.2 Publisher Swap Layout (Android & iOS)

### Steps

1. Continue from the scenario above
2. Click on the `Swap Layout` button

### Expected Result

1. The audio broadcast is not interrupted
2. The video preview is removed from the current UI view in the layout
3. The video preview is added and resumed in the updated layout

## Scenario 8.3 Subscriber Detach (Android & iOS)

### Steps

1. Start a Broadcast session with another device on the target sever with a given stream name
2. Launch the react native app
3. Enter the Host, License and Stream Name values
4. Click Subscribe
6. After the subscription session has played back for a few seconds/minutes, click the `Detach` button

### Expected Result

1. The video playback view is removed
2. The audio playback can still be heard (if not muted)

## Scenario 8.4 Subscriber Re-Attach (Android & iOS)

### Steps

1. Continue from the scenario above
2. Click on the `Attach` button

### Expected Result

1. The audio playback is not interrupted
2. The video playback is resumed and added to a UI view

## Scenario 8.5 Subscriber Swap Layout (Android & iOS)

### Steps

1. Continue from the scenario above
2. Click on the `Swap Layout` button

### Expected Result

1. The audio playback is not interrupted
2. The video playback is removed from the current UI view in the layout
3. The video playback is added and resumed in the updated layout
