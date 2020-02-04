# Red5ProVideoViewExample

Examples in using the `react-native-red5pro` React Native component library.

> You will need a Red5 Pro SDK License and a Red5 Pro Server in order to use this component.  
[Sign up for a free trial!](https://account.red5pro.com/register)

# Menu

* [Installing](#installing)
* [Running](#running)
  * [iOS](#ios)
  * [Android](#android)
* [Notes](#notes)

## Examples

The following examples are deployed to an iPhone using the [suggested running operations](#running).

Additionally, a [Red5 Pro Server](https://red5pro.com) has been deployed locally and is accessible at the IP address of `10.0.0.10` and the Red5 Pro Mobile SDK license is `YOU-RLIC-ENSE-1234`. You will ned to change both of these to where you Red5 Pro Server is deployed and your personal Red5 Pro Mobile SDK License, respectively.

> Note: Because of React Native's debugger defaulting to `8081` and the default unsecure websocket port of Red5 Pro being `8081`, you may need to re-define one or the other ports if developing locally.

### As a Publisher
![http://g.recordit.co/D22pc3XGzc.gif](http://g.recordit.co/D22pc3XGzc.gif)

### As a Subscriber
![http://g.recordit.co/G2SuYP6Znl.gif](http://g.recordit.co/G2SuYP6Znl.gif)

# Installing

You will need to install the required dependencies prior to running the examples. To do so, issue the following command in a terminal within this directory:

```sh
$ npm install
```

# Running

You can launch these examples onto your target device(s) doing the following:

## iOS

```sh
$ cd ios
$ pod install
```

1. Download the latest **Red5 Pro iOS SDK** and add it to a directory you know where to find (such as `example/Red5ProVideoViewExample/Frameworks`).
2. Open the `xcworkspace` in **Xcode** - it is generate from `pod install`.
3. Click on the `Pods` project in left-side navigator.
4. Select the `R5VideoView` target listed.
5. Select `Build Settings`.
6. In the `Search` filter, enter `Frameworks`.
7. Under `Search Paths > Framework Search Paths`, enter in the relative or absolute path to the directory containing the Red5 Pro SDK download (hint: it is easier to drag the directory and drop it on the callout).
8. Click on `Red5ProVideoViewExample` project in navigator.
9. Click on `Red5ProVideoViewExample` target listed.
10. Select `Build Settings`.
11. In the `Search` filter, enter `Frameworks`.
12. If not pointing to the SDK correctly, under `Search Paths > Framework Search Paths`, enter in the relative or absolute path to the directory containing the Red5 Pro SDK download (e.g., Step #6).
13. Tether an iPhone to your computer.
14. Make sure it is selected in **Xcode** as the target for the scheme build.
15. Build and deploy the React Native app to the iPhone.
15. Several terminal windows and alerts will pop up. Accept them and let them do their thing.
16. Once the app launches, fill in the `host`, `license` and `stream name` fields and test the `Subscribe` and `Publish` examples. 

## Android

Be sure you have a device tethered, then issue the following:

```sh
$ cd android
```

1. Download and unzip the **Red5 Pro Android SDK**.
2. Create a `libs` directory in `example/Red5ProVideoViewExample/android/app`.
3. Drop the `red5streaming.jar` file in the libs directory created in **Step #2**.
4. Drag the `jniLibs` folder from the SDK into `example/Red5ProVideoViewExample/android/app/src/main`.
5. Open **Android Studio**.
6. Select `File > New > Import Project`.
7. In the file navigator, navigate to `example/Red5ProVideoViewExample` and select the `android` directory.
8. Click `Open`.
9. Allow Gradle to Sync.
10. Tether an Android device to your computer.
11. Open a Terminal window and `cd` into `example/Red5ProVideoViewExample`.
12. Issue the following command: `npx react-native run-android`.
13. Once the app launches, fill in the `host`, `license` and `stream name` fields and test the `Subscribe` and `Publish` examples. 

# Notes

> This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

