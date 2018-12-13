# Test 6: Subscriber Background

## Scenario 6.0: Subscriber Sent To Background (iOS)

### Steps

1. Start a Broadcast session with another device on the target sever with a given stream name
2. Launch the react native app
3. Enter the Host, License and Stream Name values
4. Tick On the Allow Background Streaming option
5. Click Subscribe
6. After the subscription session has played back for a few seconds/minutes, click on the Home Button of the device

### Expected Result
1. The react native app should be put into the background
2. You should still hear audio from the broadcast

## Scenario 6.1: Subscriber Returned to Foreground (iOS)

### Steps

1. Continue from the scenario above.
2. Double-click on Home button to bring of active app card view (or you can navigate to the Home screen that has the react native app icon)
3. Select the react native app to bring it to the foreground

### Expected Result
1. The app should resume.
2. Audio should be heard from the broadcast.
3. Video playback should begin again after a few moments.

## Scenario 6.2: Subscriber Sent To Background (Android, Home Button)

### Steps

1. Start a Broadcast session with another device on the target sever with a given stream name
2. Launch the react native app
3. Enter the Host, License and Stream Name values
4. Tick On the Allow Background Streaming option
5. Click Subscribe
5. After the subscription session has played back for a few seconds/minutes, click on the Software Home Button

### Expected Result

1. The react native app should be put into the background
2. You should still hear audio from the broadcast

## Scenario 6.4: Subscriber Returned to Foreground (Android Overview Button)

### Steps

1. Continue from the scenario above.
2. Click on the Software Overview button ([]) to bring up the active app card view (or you can navigate to the Home/App screen that has the react native app icon)
3. Select the react native app to bring it to the foreground

### Expected Result

1. The app should resume.
2. Audio should be heard from the broadcast.
3. Video playback should begin again after a few moments.
