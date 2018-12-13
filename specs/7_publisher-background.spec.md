# Test 7: Publisher Background

## Scenario 7.0: Publisher Sent To Background (iOS)

### Steps

1. Launch the react native app
2. Enter the Host, License and Stream Name values
3. Tick On the Allow Background Streaming option
4. Click Publisher
5. After the broadcast session has published for a few seconds/minutes, start a subscriber on another device
6. Back on the publisher device, click on the Home Button of the device

### Expected Result

1. The react native app should be put into the background
2. You should still broadcast audio, heard on the subscriber side

## Scenario 7.1: Publisher Returned to Foreground (iOS)

### Steps

1. Continue from the scenario above.
2. Double-click on Home button to bring of active app card view (or you can navigate to the Home screen that has the react native app icon)
3. Select the react native app to bring it to the foreground

### Expected Result

1. The app should resume.
2. Video broadcast should begin again after a few moments, viewable in playback of subscriber on other device.

## Scenario 7.2: Publisher Sent To Background (Android, Home Button)

### Steps

1. Launch the react native app
2. Enter the Host, License and Stream Name values
3. Tick On the Allow Background Streaming option
4. Click Publisher
5. After the broadcast session has published for a few seconds/minutes, start a subscriber on another device
6. Back on the publisher device, click on the Software Home Button

### Expected Result

1. The react native app should be put into the background
2. You should still broadcast audio, heard on the subscriber side

## Scenario 7.4: Publisher Returned to Foreground (Android Overview Button)

### Steps

1. Continue from the scenario above.
2. Click on the Software Overview button ([]) to bring up the active app card view (or you can navigate to the Home/App screen that has the react native app icon)
3. Select the react native app to bring it to the foreground

### Expected Result

1. The app should resume.
2. Video broadcast should begin again after a few moments, viewable in playback of subscriber on other device.
