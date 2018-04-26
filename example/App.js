import React from 'react'
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import Permissions from 'react-native-permissions'
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

    // Props.
    this.state = {
      hasPermissions: false,
      hasStarted: false,
      isPublisher: false,
      isInErrorState: false,
      hostFieldProps: {
        placeholder: 'Host',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputField,
        value: ''
      },
      licenseFieldProps: {
        placeholder: 'License Key',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputField,
        value: ''
      },
      streamNameFieldProps: {
        placeholder: 'Stream Name',
        autoCorrect: false,
        underlineColorAndroid: '#00000000',
        clearTextOnFocus: true,
        style: styles.inputField,
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
          key: Math.floor(Math.random() * 0x10000).toString(16)
        },
        showDebugView: true,
        logLevel: R5LogLevel.DEBUG,
        useBackfacingCamera: false
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
    const assignHostRef = (host) => { this.host_field = host }
    const assignLicenseRef = (license) => { this.license_field = license }
    const assignStreamNameRef = (streamName) => { this.stream_name_field = streamName }

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
    const hostValue = this.host_field.props.value
    const licenseValue = this.license_field.props.value
    const streamNameValue = this.stream_name_field.props.value
    this.setState({
      hostFieldProps: {...this.state.hostFieldProps, value: hostValue},
      licenseFieldProps: {...this.state.licenseFieldProps, value: licenseValue},
      streamNameFieldProps: {...this.state.streamNameFieldProps, value: streamNameValue},
      streamProps: {...this.state.streamProps,
        configuration: {...this.state.streamProps.configuration,
          host: hostValue,
          licenseKey: licenseValue,
          streamName: streamNameValue
        }
      },
      isPublisher: false,
      hasStarted: true
    })
  }

  onPublish (event) {
    const hostValue = this.host_field.props.value
    const licenseValue = this.license_field.props.value
    const streamNameValue = this.stream_name_field.props.value
    this.setState({
      hostFieldProps: {...this.state.hostFieldProps, value: hostValue},
      licenseFieldProps: {...this.state.licenseFieldProps, value: licenseValue},
      streamNameFieldProps: {...this.state.streamNameFieldProps, value: streamNameValue},
      streamProps: {...this.state.streamProps,
        configuration: {...this.state.streamProps.configuration,
          host: hostValue,
          licenseKey: licenseValue,
          streamName: streamNameValue
        }
      },
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
  text: {
    left: 0,
    right: 0,
    textAlign: 'center',
    padding: 20
  }
})
