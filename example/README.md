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

You will need to install the required dependencies prior to running the examples. To do so, issue the following command in a terminal:

```sh
$ npm install
```

# Running

You can launch these examples onto your target device(s) doing the following:

## iOS

It is recommended to launch the [ios/Red5ProVideoViewExample.xcoeproj](ios/Red5ProVideoViewExample.xcoeproj) in Xcode, and deploying to a connected device.

## Android

Be sure you have a device tethered, then issue the following:

```sh
$ npm run android
```

# Notes

> This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

