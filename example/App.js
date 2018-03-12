import React from 'react'
import { findNodeHandle, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import Permissions from 'react-native-permissions'
import { R5VideoView } from 'react-native-red5pro'
import { R5ScaleMode, R5LogLevel } from 'react-native-red5pro'
import { subscribe,
         unsubscribe,
         preview,
         publish,
         unpublish,
         swapCamera,
         updateScaleMode } from 'react-native-red5pro'

const isValidStatusMessage = (value) => {
  return value && typeof value !== 'undefined' && value !== 'undefined' && value !== 'null'
}

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
    this.onScaleMode = this.onScaleMode.bind(this)

    // UI Actions.
    this.onHostChange = this.onHostChange.bind(this)
    this.onLicenseChange = this.onLicenseChange.bind(this)
    this.onStreamNameChange = this.onStreamNameChange.bind(this)

    // Props.
    this.state = {
      hasPermissions: false,
      hasStarted: false,
      isPublisher: false,
      isInErrorState: false,
      buttonProps: {
        style: styles.buttonView
      },
      hostFieldProps: {
        placeholder: 'Host',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputField
      },
      licenseFieldProps: {
        placeholder: 'License Key',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputField
      },
      streamNameFieldProps: {
        placeholder: 'Stream Name',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputField
      },
      toastProps: {
        ref: 'toast',
        style: styles.toast,
        value: 'waiting...'
      },
      videoProps: {
        ref: 'video',
        key: 'video',
        style: styles.videoView,
        collapsable: false,
        configuration: {
          host: 'ipv6west.red5.org',
          licenseKey: 'ACGE-4UMR-UHM4-RVJR',
          streamName: 'todd',
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

    // stored for scale swapping. #see :onSwapScale
    this.scaleMode = this.state.videoProps.scaleMode
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
      if (this.state.isPublisher) {
        return (
          <View style={styles.container}>
            <R5VideoView {...this.state.videoProps} />
            <Text {...this.state.toastProps}>{this.state.toastProps.value}</Text>
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
            <R5VideoView {...this.state.videoProps} />
            <Text {...this.state.toastProps}>{this.state.toastProps.value}</Text>
            <Button
              {...this.state.buttonProps}
              onPress={this.onStop}
              title='Stop'
              accessibilityLabel='Stop'
              />
            <Button
              {...this.state.buttonProps}
              onPress={this.onScaleMode}
              title='Swap Scale'
              accessibilityLabel='Swap Scale'
              />
          </View>
        )
      }
    }
    else {
      return (
        <View style={styles.container}>
          <View style={styles.formField}>
            <TextInput ref="host"
              value='ipv6west.red5.org'
              {...this.state.hostFieldProps}
              onChangeText={this.onHostChange}
            />
          </View>
          <View style={styles.formField}>
            <TextInput ref="license"
              value='ACGE-4UMR-UHM4-RVJR'
              {...this.state.licenseFieldProps}
              onChangeText={this.onLicenseChange}
            />
          </View>
          <View style={styles.formField}>
            <TextInput ref="streamName"
              value='todd'
              {...this.state.streamNameFieldProps}
              onChangeText={this.onStreamNameChange}
            />
          </View>
          {!this.state.hasPermissions
            ? <Text style={{color: 'white', backgroundColor: 'blue'}}>Waiting on permissions...</Text>
            : <View><Button
                {...this.state.buttonProps}
                onPress={this.onSubscribe}
                title='Subscribe'
                accessibilityLabel='Subscribe'
                />
              <Text style={styles.text}>OR</Text>
              <Button
                {...this.state.buttonProps}
                style={{marginTop: 40}}
                onPress={this.onPublish}
                title='Publish'
                accessibilityLabel='Publish'
                /></View>}
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
      hostFieldProps: {...this.state.hostFieldProps, value: this.refs.host.props.value},
      licenseFieldProps: {...this.state.licenseFieldProps, value: this.refs.license.props.value},
      streamNameFieldProps: {...this.state.streamNameFieldProps, value: this.refs.streamName.props.value},
      videoProps: {...this.state.videoProps,
        configuration: {...this.state.videoProps.configuration,
          host: this.refs.host.props.value,
          licenseKey: this.refs.license.props.value,
          streamName: this.refs.streamName.props.value
        }
      },
      isPublisher: false,
      hasStarted: true
    })
  }

  onPublish (event) {
    this.setState({
      hostFieldProps: {...this.state.hostFieldProps, value: this.refs.host.props.value},
      licenseFieldProps: {...this.state.licenseFieldProps, value: this.refs.license.props.value},
      streamNameFieldProps: {...this.state.streamNameFieldProps, value: this.refs.streamName.props.value},
      videoProps: {...this.state.videoProps,
        configuration: {...this.state.videoProps.configuration,
          host: this.refs.host.props.value,
          licenseKey: this.refs.license.props.value,
          streamName: this.refs.streamName.props.value
        }
      },
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

  onScaleMode (event) {
    console.log('onScaleMode()')
    let scale = this.scaleMode + 1
    if (scale > 2) {
      scale = 0
    }
    this.scaleMode = scale
    updateScaleMode(findNodeHandle(this.refs.video), scale)
  }

  onHostChange (text) {
    this.setState({
      hostFieldProps: {...this.state.hostFieldProps, value: text},
      videoProps: {...this.state.videoProps,
        configuration: {...this.state.videoProps.configuration, host: text}
      }
    })
  }

  onLicenseChange (text) {
    this.setState({
      licenseFieldProps: {...this.state.licenseFieldProps, value: text},
      videoProps: {...this.state.videoProps,
        configuration: {...this.state.videoProps.configuration, licenseKey: text}
      }
    })
  }

  onStreamNameChange (text) {
    this.setState({
      streamNameFieldProps: {...this.state.streamNameFieldProps, value: text},
      videoProps: {...this.state.videoProps,
        configuration: {...this.state.videoProps.configuration, streamName: text}
      }
    })
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
      preview(findNodeHandle(this.refs.video))
      publish(findNodeHandle(this.refs.video), this.state.videoProps.configuration.streamName)
    }
    else {
      subscribe(findNodeHandle(this.refs.video), this.state.videoProps.configuration.streamName)
    }
  }

  onPublisherStreamStatus (event) {
    console.log(`onPublisherStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    const status = event.nativeEvent.status
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: {...this.state.toastProps, value: message},
        isInErrorState: (status.code === 2)
      })
    }
  }

  onSubscriberStreamStatus (event) {
    console.log(`onSubscriberStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    const status = event.nativeEvent.status
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: {...this.state.toastProps, value: message},
        isInErrorState: (status.code === 2)
      })
    }
  }

  onUnsubscribeNotification (event) {
    console.log(`onUnsubscribeNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    this.setState({
      hasStarted: false,
      isInErrorState: false,
      toastProps: {...this.state.toastProps, value: 'waiting...'}
    })
  }

  onUnpublishNotification (event) {
    console.log(`onUnpublishNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    this.setState({
      hasStarted: false,
      isInErrorState: false,
      toastProps: {...this.state.toastProps, value: 'waiting...'}
    })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  formField: {
    padding: 10
  },
  inputField: {
    paddingLeft: 10,
    height: 36,
    borderBottomColor: 'gray',
    borderBottomWidth: 1
  },
  text: {
    left: 0,
    right: 0,
    textAlign: 'center',
    padding: 20
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
  },
  toast: {
    color: 'white',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1.0)'
  }
})

