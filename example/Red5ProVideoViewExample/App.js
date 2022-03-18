import React from 'react'
import { Platform } from 'react-native'
import { 
  check, 
  request, 
  PERMISSIONS 
} from 'react-native-permissions'
import { 
  R5LogLevel,
} from 'react-native-red5pro'
import { StreamProvider } from './src/components/StreamProvider'

import Publisher from './src/views/publisher'
import Subscriber from './src/views/subscriber'
import Settings from './src/views/Settings'

export default class App extends React.Component {

  constructor (props) {
    super(props)

    // Actions.
    this.onPublish = this.onPublish.bind(this)
    this.onSubscribe = this.onSubscribe.bind(this)
    this.onStop = this.onStop.bind(this)

    // Props.
    this.state = {
      hasPermissions: false,
      hasStarted: false,
      isPublisher: false,
      useAuthentication: false,
      isInErrorState: false,
      streamProps: {
        collapsable: false,
        configuration: {
          host: '',
          licenseKey: '',
          streamName: '',
          port: 8554,
          contextName: 'live',
          bufferTime: 0.5,
          streamBufferTime: 2.0,
          bundleID: 'com.red5pro.reactnative',
          parameters: '',
          key: Math.floor(Math.random() * 0x10000).toString(16)
        },
        subscribeVideo: true,
        showDebugView: true,
        logLevel: R5LogLevel.DEBUG,
        useBackfacingCamera: false,
        enableBackgroundStreaming: false
      }
    }

  }

  componentDidMount () {
    Promise.all(
        check(Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          ios: PERMISSIONS.IOS.CAMERA,
        })),
        check(Platform.select({
          android: PERMISSIONS.ANDROID.RECORD_AUDIO,
          ios: PERMISSIONS.IOS.MICROPHONE,
        })))
      .then((response) => {
        const isAuthorized = /granted/
        const hasCamera = isAuthorized.test(response.camera)
        const hasMic = isAuthorized.test(response.microphone)

        if (!hasCamera || !hasMic) {
          this.requestPermissions()
          this.setState({
            hasPermissions: false
          })
        } else {
          this.setState({
            hasPermissions: true
          })
        }
      })
  }

  render () {

    if (this.state.hasPermissions && this.state.hasStarted) {
      if (this.state.isPublisher) {
        return (
          <StreamProvider>
            <Publisher onStop={this.onStop} />
          </StreamProvider>
        )
      }
      else {
        return (
          <StreamProvider>
            <Subscriber onStop={this.onStop} />
          </StreamProvider>
        )
      }
    }
    else {
      return (
        <StreamProvider>
          <Settings onPublish={this.onPublish} onSubscribe={this.onSubscribe} hasPermissions={this.state.hasPermissions} />
        </StreamProvider>
      )
    }
  }

  requestPermissions () {
    const isAuthorized = /granted/
    let camPermission = false
    let micPermission = false

    request(Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      }))
      .then((camResponse) => {
        camPermission = isAuthorized.test(camResponse)
        request(Platform.select({
            android: PERMISSIONS.ANDROID.RECORD_AUDIO,
            ios: PERMISSIONS.IOS.MICROPHONE,
          }))
          .then((micResponse) => {
            micPermission = isAuthorized.test(micResponse)

            this.setState({
              hasPermissions: camPermission && micPermission
            })
          })
      })
  }

  getStateFromProps () {
    return this.state
  }

  onSubscribe (event) {
    const stateUpdate = this.getStateFromProps()
    this.setState({
      ...stateUpdate,
      isPublisher: false,
      hasStarted: true
    })
  }

  onPublish (event) {
    const stateUpdate = this.getStateFromProps()
    this.setState({
      ...stateUpdate,
      isPublisher: true,
      hasStarted: true
    })
  }

  onStop (event) {
    console.log('App:onStop()')
    this.setState({
      hasStarted: false,
      isInErrorState: false
    })
  }
}
