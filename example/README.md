# Red5ProVideoViewExample

Examples in using the `react-native-red5pro` React Native component library.

> You will need a Red5 Pro SDK License and a Red5 Pro Server in order to use this component.  
[Sign up for a free trial!](https://account.red5pro.com/register)

# Menu

* [Installing](#installing)
* [Running Module Examples](#running-module-examples)
  * [iOS](#ios-module-example)
  * [Android](#android-module-example)
* [Running Component Examples](#running-component-examples)
  * [iOS](#ios-compoent-example)
  * [Android](#android-component-example)
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

## Two Examples

After installation, there are two examples that can be run, and utilize the provided React Native libraries for this project:

* `R5StreamModule`
* `R5VideoView`

> To read more about the React Native libraries provided in this parent project and their APIs and Usage, please refer to the parent [README](../README.md)

# Running Module Examples

You can launch these Red5 Pro Native Module examples onto your target device(s) doing the following:

## iOS Module Example

It is recommended to launch the [ios/Red5ProVideoViewExample.xcoeproj](ios/Red5ProVideoViewExample.xcoeproj) in Xcode, and deploying to a connected device.

To target the Native Module example, you will also need to update the [./ios/Red5ProVideoViewExample/AppDelegate.m](./ios/Red5ProVideoViewExample/AppDelegate.m) file and be sure the target bundle is specified as `index-modular.ios`

> See the `preios:module` npm script in [package.json](package.json)

## Android Module Example

Be sure you have a device tethered, then issue the following:

```sh
$ npm run android:module
```

# Running Component Examples

You can launch these Red5 Pro Native Component examples onto your target device(s) doing the following:

## iOS Component Example

It is recommended to launch the [ios/Red5ProVideoViewExample.xcoeproj](ios/Red5ProVideoViewExample.xcoeproj) in Xcode, and deploying to a connected device.

To target the Native Module example, you will also need to update the [./ios/Red5ProVideoViewExample/AppDelegate.m](./ios/Red5ProVideoViewExample/AppDelegate.m) file and be sure the target bundle is specified as `index.ios`

> See the `preios:component` npm script in [package.json](package.json)

## Android Component Example

Be sure you have a device tethered, then issue the following:

```sh
$ npm run android:component
```

# Notes

> This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).
