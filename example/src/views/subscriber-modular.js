/* eslint-disable no-console */
import React from 'react'
import {
  AppState,
  DeviceEventEmitter,
  findNodeHandle,
  Button,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Icon } from 'react-native-elements'
import {
  R5StreamModule,
  R5VideoView,
  R5AudioMode,
  R5ScaleMode,
  updateScaleMode,
  setPlaybackVolume,
  attach, detach
} from 'react-native-red5pro'

const isValidStatusMessage = (value) => {
  return value && typeof value !== 'undefined' && value !== 'undefined' && value !== 'null'
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
    backgroundColor: 'black'
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  button: {
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
  },
  muteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 26,
    backgroundColor: 'white'
  },
  muteIconToggled: {
    backgroundColor: '#2089dc'
  }
})

export default class Subscriber extends React.Component {
  constructor (props) {
    super(props)

    const {
      streamProps: {
        configuration
      }
    } = this.props

    // Events.
    this.onMetaData = this.onMetaData.bind(this)
    this.onConfigured = this.onConfigured.bind(this)
    this.onSubscriberStreamStatus = this.onSubscriberStreamStatus.bind(this)
    this.onUnsubscribeNotification = this.onUnsubscribeNotification.bind(this)

    this.onScaleMode = this.onScaleMode.bind(this)
    this.onToggleDetach = this.onToggleDetach.bind(this)
    this.onSwapLayout = this.onSwapLayout.bind(this)
    this.onToggleAudioMute = this.onToggleAudioMute.bind(this)

    this.doAttach = this.doAttach.bind(this)
    this.doDetach = this.doDetach.bind(this)
    this.doSubscribe = this.doSubscribe.bind(this)
    this.doUnsubscribe = this.doUnsubscribe.bind(this)
    this.retry = this.retry.bind(this)
    this.startRetry = this.startRetry.bind(this)
    this.stopRetry = this.stopRetry.bind(this)

    this.state = {
      appState: AppState.currentState,
      scaleMode: R5ScaleMode.SCALE_TO_FILL,
      audioMuted: false,
      isInErrorState: false,
      isConnecting: false,
      isDisconnected: true,
      attached: false,
      swappedLayout: false,
      buttonProps: {
        style: styles.button
      },
      toastProps: {
        style: styles.toast,
        value: 'waiting...'
      },
      videoProps: {
        style: styles.videoView
      }
    }

    const streamIdToUse = [configuration.streamName, Math.floor(Math.random() * 0x10000).toString(16)].join('-')
    R5StreamModule.init(streamIdToUse, configuration)
      .then(streamId => {
        console.log('R5StreamModule configuration with ' + streamId)
        this.streamId = streamId
        this.doSubscribe()
      })
      .catch(error => {
        console.log('Subscriber:Stream Setup Error - ' + error)
      })
  }

  UNSAFE_componentWillMount () {
    console.log('Subscriber:componentWillMount()')
    AppState.addEventListener('change', this._handleAppStateChange)

    DeviceEventEmitter.addListener('onMetaData', this.onMetaData)
    DeviceEventEmitter.addListener('onConfigured', this.onConfigured)
    DeviceEventEmitter.addListener('onSubscriberStreamStatus', this.onSubscriberStreamStatus)
    DeviceEventEmitter.addListener('onUnSubscribeNotification', this.onUnSubscribeNotification)
  }

  componentWillUnmount () {
    console.log('Subscriber:componentWillUnmount()')
    this.stopRetry()
    AppState.removeEventListener('change', this._handleAppStateChange)
    this.doUnsubscribe()

    DeviceEventEmitter.removeListener('onMetaData', this.onMetaData)
    DeviceEventEmitter.removeListener('onConfigured', this.onConfigured)
    DeviceEventEmitter.removeListener('onSubscriberStreamStatus', this.onSubscriberStreamStatus)
    DeviceEventEmitter.removeListener('onUnSubscribeNotification', this.onUnSubscribeNotification)
  }

  _handleAppStateChange = (nextAppState) => {
    console.log(`Subscriber:AppState - ${nextAppState}`)
    const { streamProps: { enableBackgroundStreaming } } = this.props
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('Subscriber:AppState - App has come to the foreground.')
    } else if (nextAppState === 'inactive') {
      console.log('Subscriber:AppState - App has gone to the background.')
      if (!enableBackgroundStreaming) {
        console.log('Subscriber:AppState - unpublish()')
        this.doUnsubscribe()
      }
    }
    this.setState({
      appState: nextAppState
    })
  }

  render () {
    const {
      videoProps,
      toastProps,
      buttonProps,
      audioMuted,
      swappedLayout
    } = this.state

    const {
      onStop,
      streamProps
    } = this.props

    const setup = Object.assign({}, streamProps, videoProps)

    const displayVideo = setup.subscribeVideo

    const audioIconColor = audioMuted ? '#fff' : '#000'
    const audioIconStyle = audioMuted ? [styles.muteIcon, styles.muteIconToggled] : styles.muteIcon

    const assignVideoRef = (video) => { this.red5pro_video_subscriber = video }
    const assignToastRef = (toast) => { this.toast_field = toast }

    return (
      <View style={styles.container}>
        { !swappedLayout &&
          <R5VideoView
            style={styles.videoView}
            ref={assignVideoRef.bind(this)}
          />
        }
        { !displayVideo && <View style={styles.imageContainer}>
            <Image 
              style={{ width: 69, height: 68 }}
              source={{uri: 'https://www.red5pro.com/images/red5pro_icon1.png'}} />
          </View>
        }
        <Icon
          name={audioMuted ? 'md-volume-off' : 'md-volume-high'}
          type='ionicon'
          size={26}
          color={audioIconColor}
          hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
          onPress={this.onToggleAudioMute}
          containerStyle={audioIconStyle}
        />
        <Text
          ref={assignToastRef.bind(this)}
          {...toastProps}>{toastProps.value}</Text>
        <Button
          {...buttonProps}
          onPress={onStop}
          title="Stop"
          accessibilityLabel="Stop"
        />
        <Button
          {...buttonProps}
          onPress={this.onScaleMode}
          title='Swap Scale'
          accessibilityLabel='Swap Scale'
        />
        <Button
          {...buttonProps}
          onPress={this.onToggleDetach}
          title='Toggle Detach'
        />
        <Button
          {...buttonProps}
          onPress={this.onSwapLayout}
          title='Swap Layout'
        />
        { swappedLayout &&
          <R5VideoView
            style={styles.videoView}
            ref={assignVideoRef.bind(this)}
          />
        }
      </View>
    )
  }

  onMetaData (event) {
    const metadata = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.metadata : event.metadata
    console.log(`Subscriber:onMetadata :: ${metadata}`)
  }

  onConfigured (event) {
    const key = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.key : event.key
    console.log(`Subscriber:onConfigured :: ${key}`)
  }

  onSubscriberStreamStatus (event) {
    const status = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.status : event.status
    console.log(`Subscriber:onSubscriberStreamStatus :: ${JSON.stringify(status, null, 2)}`)
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (status.name.toLowerCase() === 'error' ||
        message.toLowerCase() === 'disconnected') {
      this.doUnsubscribe()
      this.setState({
        isDisconnected: true,
        isConnecting: false
      })
    } else if (message.toLowerCase() === 'connected') {
      this.setState({
        isDisconnected: false,
        isConnecting: false
      })
    }
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: {...this.state.toastProps, value: message},
        isInErrorState: (status.code === 2)
      })
    }
  }

  onUnsubscribeNotification (event) {
    const status = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.status : event.status
    console.log(`Subscriber:onUnsubscribeNotification:: ${JSON.stringify(status, null, 2)}`)
    this.setState({
      isInErrorState: false,
      toastProps: {...this.state.toastProps, value: 'waiting...'}
    })
  }

  onToggleDetach () {
    console.log('Subscriber:onToggleDetach()')
    const {
      attached
    } = this.state
    if (attached) {
      this.doDetach()
    } else {
      this.doAttach()
    }
  }

  onSwapLayout () {
    console.log('Subscriber:onSwapLayout()')
    const {
      swappedLayout
    } = this.state
    this.setState({
      attached: false,
      swappedLayout: !swappedLayout
    })
  }

  onScaleMode () {
    console.log('Subscriber:onScaleMode()')
    const {
      scaleMode
    } = this.state
    let scale = scaleMode + 1
    if (scale > 2) {
      scale = 0
    }
    updateScaleMode(findNodeHandle(this.red5pro_video_subscriber), scale)
    this.setState({
      scaleMode: scale
    })
  }

  onToggleAudioMute () {
    console.log('Subscriber:onToggleAudioMute()')
    const { audioMuted } = this.state
    if (audioMuted) {
      setPlaybackVolume(findNodeHandle(this.red5pro_video_subscriber), 100)
    } else {
      setPlaybackVolume(findNodeHandle(this.red5pro_video_subscriber), 0)
    }
    this.setState({
      audioMuted: !audioMuted
    })
  }

  doDetach () {
    const nodeHandle = findNodeHandle(this.red5pro_video_subscriber)
    if (nodeHandle) {
      console.log(`[R5StreamModule:doSubscribe]: found view...`)
      detach(nodeHandle, this.streamId)
      this.setState({
        attached: false
      })
    }
  }


  doAttach () {
    const nodeHandle = findNodeHandle(this.red5pro_video_subscriber)
    if (nodeHandle) {
      attach(nodeHandle, this.streamId)
      this.setState({
        attached: true
      })
    }
  }

  doSubscribe () {
    const {
      streamProps: {
        subscribeVideo,
        showDebugView,
        logLevel,
        useBackfacingCamera,
        enableBackgroundStreaming
      }
    } = this.props
    const { scaleMode } = this.state

    R5StreamModule.subscribe(this.streamId, {
        audioMode: R5AudioMode.STANDARD,
        scaleMode: scaleMode,
        subscribeVideo: subscribeVideo,
        showDebugView: showDebugView,
        logLevel: logLevel,
        useBackfacingCamera: useBackfacingCamera,
        enableBackgroundStreaming: enableBackgroundStreaming
      })
      .then(streamId => {
        console.log('R5StreamModule subscriber with ' + streamId);
      })
      .catch(error => {
        console.log('Subscriber:Stream Subscribe Error - ' + error)
      })
  }

  doUnsubscribe () {
    R5StreamModule.unsubscribe(this.streamId)
      .then(streamId => {
        console.log('R5StreamModule unsubscribed with ' + streamId);
      })
      .catch(error => {
        console.log('Subscriber:Stream Subscribe Error - ' + error)
      })
  }

  startRetry () {
    this.stopRetry()
    this.retryTimer = setTimeout(() => {
      this.retry()
    }, 1000)
  }

  stopRetry () {
    clearTimeout(this.retryTimer)
  }

  retry () {
    const {
      streamProps: {
        configuration: {
          streamName
        }
      }
    } = this.props

    console.log(`attempting retry for stream name :: ${streamName}`)
    this.doSubscribe()
  }
}