import React, { useState } from 'react'
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import {
  CheckBox
} from 'react-native-elements'
import { 
  check, 
  request, 
  PERMISSIONS 
} from 'react-native-permissions'
import { 
  R5LogLevel,
} from 'react-native-red5pro'

import Publisher from './src/views/publisher'
import Subscriber from './src/views/subscriber'

export default class App extends React.Component {

  constructor (props) {
    super(props)

    // Actions.
    this.onPublish = this.onPublish.bind(this)
    this.onSubscribe = this.onSubscribe.bind(this)
    this.onStop = this.onStop.bind(this)

    // UI Actions.
    this.onHostChange = this.onHostChange.bind(this)
    this.onLicenseChange = this.onLicenseChange.bind(this)
    this.onStreamNameChange = this.onStreamNameChange.bind(this)
    this.onEnableBackgroundStreamingChange = this.onEnableBackgroundStreamingChange.bind(this)
    this.onUseAuthenticationChange = this.onUseAuthenticationChange.bind(this)
    this.onUsernameChange = this.onUsernameChange.bind(this)
    this.onPasswordChange = this.onPasswordChange.bind(this)

    // Props.
    this.state = {
      hasPermissions: false,
      hasStarted: false,
      isPublisher: false,
      useAuthentication: false,
      isInErrorState: false,
      hostFieldProps: {
        placeholder: 'Host',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: false,
        style: styles.inputField,
        value: ''
      },
      licenseFieldProps: {
        placeholder: 'License Key',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: false,
        style: styles.inputField,
        value: ''
      },
      streamNameFieldProps: {
        placeholder: 'Stream Name',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: false,
        style: styles.inputField,
        value: ''
      },
      usernameFieldProps: {
        placeholder: 'Username',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputFieldAuth,
        value: ''
      },
      passwordFieldProps: {
        placeholder: 'Password',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: [styles.inputFieldAuth, {marginBottom: 20}],
        value: ''
      },
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
    const {
      useAuthentication,
      streamProps: {
        enableBackgroundStreaming
      }
    } = this.state

    const assignHostRef = (host) => { this.host_field = host }
    const assignLicenseRef = (license) => { this.license_field = license }
    const assignStreamNameRef = (streamName) => { this.stream_name_field = streamName }
    const assignUsernameRef = (username) => { this.username_field = username }
    const assignPasswordRef = (password) => { this.password_field = password }

    if (this.state.hasPermissions && this.state.hasStarted) {
      if (this.state.isPublisher) {
        return (
          <Publisher
            streamProps={this.state.streamProps}
            style={styles.container}
            onStop={this.onStop}
          />
        )
      }
      else {
        return (
          <Subscriber
            streamProps={this.state.streamProps}
            style={styles.container}
            onStop={this.onStop}
          />
        )
      }
    }
    else {
      return (
        <View style={styles.container}>
          <View style={styles.formField}>
            <TextInput
              ref={assignHostRef.bind(this)}
              {...this.state.hostFieldProps}
              onChangeText={this.onHostChange}
            />
          </View>
          <View style={styles.formField}>
            <TextInput
              ref={assignLicenseRef.bind(this)}
              {...this.state.licenseFieldProps}
              onChangeText={this.onLicenseChange}
            />
          </View>
          <View style={styles.formField}>
            <TextInput
              ref={assignStreamNameRef.bind(this)}
              {...this.state.streamNameFieldProps}
              onChangeText={this.onStreamNameChange}
            />
          </View>
          <View style={styles.formField}>
            <CheckBox title='Allow Background Streaming'
              checked={enableBackgroundStreaming}
              onPress={this.onEnableBackgroundStreamingChange}
            />
          </View>
          <View style={styles.formField}>
            <CheckBox title='Use Authentication'
              checked={useAuthentication}
              onPress={this.onUseAuthenticationChange}
            />
          </View>
          { useAuthentication && <View>
              <TextInput
                ref={assignUsernameRef.bind(this)}
                {...this.state.usernameFieldProps}
                onChangeText={this.onUsernameChange}
              />
              <TextInput
                ref={assignPasswordRef.bind(this)}
                {...this.state.passwordFieldProps}
                onChangeText={this.onPasswordChange}
              />
            </View>
          }
          {!this.state.hasPermissions && <Text style={{color: 'white', backgroundColor: 'blue'}}>Waiting on permissions...</Text>}
          {this.state.hasPermissions && <View>
            <Button
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
            />
          </View>
          }
        </View>
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
    const { useAuthentication } = this.state
    const hostValue = this.state.hostFieldProps.value
    const licenseValue = this.state.licenseFieldProps.value
    const streamNameValue = this.state.streamNameFieldProps.value
    const usernameValue = useAuthentication ? this.usernameFieldProps.value : undefined
    const passwordValue = useAuthentication ? this.passwordFieldProps.value : undefined
    return {
      hostFieldProps: this.state.hostFieldProps,
      licenseFieldProps: this.state.licenseFieldProps,
      streamNameFieldProps: this.state.streamNameFieldProps,
      streamProps: {...this.state.streamProps,
        configuration: {...this.state.streamProps.configuration,
          host: hostValue,
          licenseKey: licenseValue,
          streamName: streamNameValue,
          parameters: !useAuthentication ? '' : [
            ['username', usernameValue].join('='),
            ['password', passwordValue].join('=')
          ].join(';') + ';'
        }
      }  
    }
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

  onHostChange (text) {
    this.setState({
      hostFieldProps: {...this.state.hostFieldProps, value: text},
      streamProps: {...this.state.streamProps,
        configuration: {...this.state.streamProps.configuration, host: text}
      }
    })
  }

  onLicenseChange (text) {
    this.setState({
      licenseFieldProps: {...this.state.licenseFieldProps, value: text},
      streamProps: {...this.state.streamProps,
        configuration: {...this.state.streamProps.configuration, licenseKey: text}
      }
    })
  }

  onStreamNameChange (text) {
    this.setState({
      streamNameFieldProps: {...this.state.streamNameFieldProps, value: text},
      streamProps: {...this.state.streamProps,
        configuration: {...this.state.streamProps.configuration, streamName: text}
      }
    })
  }

  onUsernameChange (text) {
    this.setState({
      usernameFieldProps: {...this.state.usernameFieldProps, value: text}
    })
  }

  onPasswordChange (text) {
    this.setState({
      passwordFieldProps: {...this.state.passwordFieldProps, value: text}
    })
  }

  onEnableBackgroundStreamingChange () {
    const { streamProps: { enableBackgroundStreaming } } = this.state
    this.setState({
      streamProps: {
        ...this.state.streamProps,
        enableBackgroundStreaming: !enableBackgroundStreaming
      }
    })
  }

  onUseAuthenticationChange () {
    const { useAuthentication } = this.state
    this.setState({
      useAuthentication: !useAuthentication
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
  inputFieldAuth: {
    padding: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    height: 36,
    borderBottomColor: 'gray',
    borderBottomWidth: 1
  },
  text: {
    left: 0,
    right: 0,
    textAlign: 'center',
    padding: 20
  }
})
