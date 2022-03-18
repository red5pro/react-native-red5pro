import React, { useContext, useState } from 'react'
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  Switch,
  View
} from 'react-native'
import { StreamContext } from '../components/StreamProvider'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  formField: {
    padding: 10
  },
  switchFormField: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  switchLabel: {
    marginLeft: 10
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

const inputFieldProps = {
  autoCorrect: false,
  underlineColorAndroid: '#00000000',
  clearTextOnFocus: false,
  style: styles.inputField
}

const wrapProps = props => { return {...inputFieldProps, ...props} }

const props = {
  hostField: wrapProps({ placeholder: 'Host' }),
  licenseField: wrapProps({ placeholder: 'License Key' }),
  streamNameField: wrapProps({ placeholder: 'Stream Name' }),
  usernameField: wrapProps({ placeholder: 'Username' }),
  passwordField: wrapProps({ placeholder: 'Password' , style: {
    ...inputFieldProps.style, ...{ marginBottom: 20 }
  }}),
  button: {}
}

const Settings = ({ hasPermissions, onPublish, onSubscribe }) => {

  const { stream, setStream } = useContext(StreamContext)

  const [host, setHost] = useState(stream.configuration.host)
  const [licenseKey, setLicenseKey] = useState(stream.configuration.licenseKey)
  const [streamName, setStreamName] = useState(stream.configuration.streamName)
  const [username, setUsername] = useState(stream.configuration.username)
  const [password, setPassword] = useState(stream.configuration.password)
  const [enableBackgroundStreaming, setEnableBackgroundStreaming] = useState(stream.enableBackgroundStreaming)
  const [useAuthentication, setUseAuthentication] = useState(stream.useAuthentication)

  const updateContext = () => {
    const { configuration } = stream
    const update = {
      enableBackgroundStreaming,
      useAuthentication,
      configuration: {...configuration, ...{
        host,
        licenseKey,
        streamName,
        parameters: !useAuthentication ? '' : [
            ['username', username].join('='),
            ['password', password].join('=')
          ].join(';') + ';'
      }}
    }
    setStream(update)
  }

  const onHostChange = value => {
    setHost(value)
  }

  const onLicenseKeyChange = value => {
    setLicenseKey(value)
  }

  const onStreamNameChange = value => {
    setStreamName(value)
  }

  const onUsernameChange = value => {
    setUsername(value)
  }

  const onPasswordChange = value => {
    setPassword(value)
  }

  const onEnableBackgroundStreamingChange = () => {
    setEnableBackgroundStreaming(!enableBackgroundStreaming)
  }

  const onUseAuthenticationChange = () => {
    setUseAuthentication(!useAuthentication)
  }

  const onPublishRequest = () => {
    updateContext()
    onPublish()
  }

  const onSubscribeRequest = () => {
    updateContext()
    onSubscribe()
  }

  return (
    <View style={styles.container}>
      <View style={styles.formField}>
        <TextInput
          {...props.hostField}
          onChangeText={onHostChange}
          value={host}
          />
      </View>
      <View style={styles.formField}>
        <TextInput
          {...props.licenseField}
          onChangeText={onLicenseKeyChange}
          value={licenseKey}
          />
      </View>
      <View style={styles.formField}>
        <TextInput
          {...props.streamNameField}
          onChangeText={onStreamNameChange}
          value={streamName}
          />
      </View>
      <View style={styles.switchFormField}>
        <Switch
          onValueChange={onEnableBackgroundStreamingChange}
          value={enableBackgroundStreaming}
          />
          <Text style={styles.switchLabel}>Allow Background Streaming</Text>
      </View>
      <View style={styles.switchFormField}>
        <Switch
          onValueChange={onUseAuthenticationChange}
          value={useAuthentication}
          />
        <Text style={styles.switchLabel}>Use Authentication</Text>
      </View>
      {useAuthentication && (
        <View>
          <TextInput
            {...props.usernameField}
            onChangeText={onUsernameChange}
            value={username}
          />
          <TextInput
            {...props.passwordField}
            onChangeText={onPasswordChange}
            value={password}
            />
        </View>
      )}
        {!hasPermissions && <Text style={{color: 'white', backgroundColor: 'blue'}}>Waiting on permissions...</Text>}
      {hasPermissions && (
        <View>
          <Button
            {...props.button}
            onPress={onSubscribeRequest}
            title='Subscribe'
            accessibilityLabel='Subscribe'
            />
          <Text style={styles.text}>OR</Text>
          <Button
            {...props.button}
            style={{marginTop: 40}}
            onPress={onPublishRequest}
            title='Publish'
            accessibilityLabel='Publish'
            />
        </View>
      )}
    </View>
  )

}

export default Settings
