import React from 'react'
import { findNodeHandle, Button, StyleSheet, Text, View } from 'react-native'
import Permissions from 'react-native-permissions'
import { R5VideoView } from 'react-native-red5pro'
import { R5ScaleMode, R5LogLevel } from 'react-native-red5pro'
import { subscribe,
         unsubscribe,
         publish,
         unpublish,
         swapCamera } from 'react-native-red5pro'

export default class App extends React.Component {
  constructor (props) {
    super(props)

    // Events.
    this.onMetaData = this.onMetaData.bind(this)
    this.onConfigured = this.onConfigured.bind(this)
    this.onPublisherStreamStatus = this.onPublisherStreamStatus.bind(this)
    this.onSubscriberStreamStatus = this.onSubscriberStreamStatus.bind(this)
    this.onUnsubscribeNotification = this.onUnsubscribeNotification.bind(this)
    this.onUnpublishNotification = this.onUnpublishNotification.bind(this)

    // Actions.
    this.onPublish = this.onPublish.bind(this)
    this.onSubscribe = this.onSubscribe.bind(this)
    this.onStop = this.onStop.bind(this)
    this.onSwapCamera = this.onSwapCamera.bind(this)

    // Props.
    this.state = {
      isSubscribing: false,
      hasPermissions: false,
      hasStarted: false,
      isPublisher: false,
      buttonProps: {
        style: styles.buttonView
      },
      videoProps: {
        ref: 'video',
        key: 'video',
        style: styles.videoView,
        collapsable: false,
        configuration: {
          streamName: 'reactnative',
          host: '50.56.81.179', // 'ir5rtc.red5.org',
          // host: '52.15.97.198', // 'webrtc.red5.org',
          // licenseKey: 'ACGE-4UMR-UHM4-RVJR', // valid license if using PROD SDK
          licenseKey: 'BWAP-WF5E-JZU2-6I5G', // valid license if using QA SDK
          port: 8554,
          contextName: 'live',
          bufferTime: 0.5,
          streamBufferTime: 2.0,
          bundleID: 'com.red5pro.reactnative',
          key: Math.floor(Math.random() * 0x10000).toString(16)
        },
        showDebugView: true,
        logLevel: R5LogLevel.DEBUG,
        scaleMode: R5ScaleMode.SCALE_TO_FILL,
        useBackfacingCamera: false,
        onMetaData: this.onMetaData,
        onConfigured: this.onConfigured,
        onPublisherStreamStatus: this.onPublisherStreamStatus,
        onSubscriberStreamStatus: this.onSubscriberStreamStatus,
        onUnsubscribeNotification: this.onUnsubscribeNotification,
        onUnpublishNotification: this.onUnpublishNotification
      }
    }
  }

  componentDidMount () {
    Permissions.checkMultiple(['camera', 'microphone'])
      .then((response) => {
        const isAuthorized = /authorized/
        const hasCamera = isAuthorized.test(response.camera)
        const hasMic = isAuthorized.test(response.microphone)

        if (!hasCamera || !hasMic) {
          this.requestPermissions()
          this.setState({hasPermissions: false})
        } else {
          this.setState({hasPermissions: true})
        }
      })
  }

  render () {
    if (this.state.hasPermissions && this.state.hasStarted) {
      return (
        <View style={styles.container}>
          <R5VideoView {...this.state.videoProps} />
          <Button
            {...this.state.buttonProps}
            onPress={this.onStop}
            title='Stop'
            accessibilityLabel='Stop'
            />
          <Button
            {...this.state.buttonProps}
            onPress={this.onSwapCamera}
            title='Swap Camera'
            accessibilityLabel='Swap Camera'
            />
          </View>
      )
    }
    else {
      return (
        <View style={styles.container}>
          {!this.state.hasPermissions
            ? <Text style={{color: 'white', backgroundColor: 'blue'}}>Waiting on permissions...</Text>
            : <View><Button
                {...this.state.buttonProps}
                onPress={this.onSubscribe}
                title='Subscribe'
                accessibilityLabel='Subscribe'
                ></Button>
              <Button
                {...this.state.buttonProps}
                style={{marginTop: 40}}
                onPress={this.onPublish}
                title='Publish'
                accessibilityLabel='Publish'
                ></Button></View>}
        </View>
      )
    }
  }

  requestPermissions () {
    const isAuthorized = /authorized/
    let camPermission = false
    let micPermission = false

    Permissions.request('camera')
      .then((camResponse) => {
        camPermission = isAuthorized.test(camResponse)

        Permissions.request('microphone')
          .then((micResponse) => {
            micPermission = isAuthorized.test(micResponse)

            this.setState({hasPermissions: camPermission && micPermission})
          })
      })
  }

  onSubscribe (event) {
    this.setState({
      isPublisher: false,
      hasStarted: true
    })
  }

  onPublish (event) {
    this.setState({
      isPublisher: true,
      hasStarted: true
    })
  }

  onStop (event) {
    console.log('onStop()')
    if (this.state.isPublisher) {
      unpublish(findNodeHandle(this.refs.video))
    }
    else {
      unsubscribe(findNodeHandle(this.refs.video))
    }
  }

  onSwapCamera (event) {
    console.log('onSwapCamera()')
    if (this.state.isPublisher) {
      swapCamera(findNodeHandle(this.refs.video))
    }
  }

  onMetaData (event) {
    console.log(`onMetadata :: ${event.nativeEvent.metadata}`)
  }

  onConfigured (event) {
    console.log(`onConfigured :: ${event.nativeEvent.key}`)
    this.refs.video.setState({
      configured: true
    })
    if (this.state.isPublisher) {
      publish(findNodeHandle(this.refs.video), this.state.videoProps.configuration.streamName)
    }
    else {
      subscribe(findNodeHandle(this.refs.video), this.state.videoProps.configuration.streamName)
    }
  }

  onPublisherStreamStatus (event) {
    console.log(`onPublisherStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
  }

  onSubscriberStreamStatus (event) {
    console.log(`onSubscriberStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
  }

  onUnsubscribeNotification (event) {
    console.log(`onUnsubscribeNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    this.setState({
      hasStarted: false
    })
  }

  onUnpublishNotification (event) {
    console.log(`onUnpublishNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    this.setState({
      hasStarted: false
    })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  videoView: {
    flex: 1,
    flexDirection: 'row',
    // justifyContent: 'center',
    backgroundColor: 'black'
  },
  buttonView: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
    backgroundColor: 'blue',
    color: 'white'
  }
})

