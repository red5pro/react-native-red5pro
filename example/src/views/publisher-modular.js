/* eslint-disable no-console */
import React from 'react'
import {
  AppState,
  DeviceEventEmitter,
  findNodeHandle,
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Icon } from 'react-native-elements'
import {
  R5StreamModule,
  R5VideoView,
  attach, detach
} from 'react-native-red5pro'

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
    padding: 6,
    borderRadius: 40,
    backgroundColor: 'white'
  },
  muteIconRightmost: {
    right: 10
  },
  muteIconRight: {
    right: 70
  },
  muteIconToggled: {
    backgroundColor: '#2089dc'
  }
})

const isValidStatusMessage = (value) => {
  return value && typeof value !== 'undefined' && value !== 'undefined' && value !== 'null'
}

export default class Publisher extends React.Component {
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
    this.onPublisherStreamStatus = this.onPublisherStreamStatus.bind(this)
    this.onUnpublishNotification = this.onUnpublishNotification.bind(this)

    this.onSwapCamera = this.onSwapCamera.bind(this)
    this.onToggleDetach = this.onToggleDetach.bind(this)
    this.onToggleAudioMute = this.onToggleAudioMute.bind(this)
    this.onToggleVideoMute = this.onToggleVideoMute.bind(this)
    this.onSwapLayout = this.onSwapLayout.bind(this)

    this.doAttach = this.doAttach.bind(this)
    this.doDetach = this.doDetach.bind(this)
    this.doPublish = this.doPublish.bind(this)
    this.doUnpublish = this.doUnpublish.bind(this)

    this.state = {
      appState: AppState.currentState,
      audioMuted: false,
      isInErrorState: false,
      videoMuted: false,
      swappedLayout: false,
      buttonProps: {
        style: styles.button
      },
      toastProps: {
        style: styles.toast,
        value: 'waiting...'
      },
      videoProps: {
        style: styles.videoView,
        onMetaData: this.onMetaData,
        onConfigured: this.onConfigured,
        onPublisherStreamStatus: this.onPublisherStreamStatus,
        onUnpublishNotification: this.onUnpublishNotification
      }
    }

    const streamIdToUse = [configuration.streamName, Math.floor(Math.random() * 0x10000).toString(16)].join('-')
    R5StreamModule.init(streamIdToUse, configuration)
      .then(streamId => {
        console.log('R5StreamModule configuration with ' + streamId)
        this.streamId = streamId
        this.doPublish()
      })
      .catch(error => {
        console.log('Subscriber:Stream Setup Error - ' + error)
      })
  }

  UNSAFE_componentWillMount () {
    console.log('Publisher:componentWillMount()')
    AppState.addEventListener('change', this._handleAppStateChange)

    DeviceEventEmitter.addListener('onMetaData', this.onMetaData)
    DeviceEventEmitter.addListener('onConfigured', this.onConfigured)
    DeviceEventEmitter.addListener('onPublisherStreamStatus', this.onPublisherStreamStatus)
    DeviceEventEmitter.addListener('onUnpublishNotification', this.onUnpublishNotification)
  }

  componentWillUnmount () {
    console.log('Publisher:componentWillUnmount()')
    AppState.removeEventListener('change', this._handleAppStateChange)
    this.doUnpublish()

    DeviceEventEmitter.removeListener('onMetaData', this.onMetaData)
    DeviceEventEmitter.removeListener('onConfigured', this.onConfigured)
    DeviceEventEmitter.removeListener('onPublisherStreamStatus', this.onPublisherStreamStatus)
    DeviceEventEmitter.removeListener('onUnpublishNotification', this.onUnpublishNotification)  
  }

  _handleAppStateChange = (nextAppState) => {
    console.log(`Publisher:AppState - ${nextAppState}`)
    const { streamProps: { enableBackgroundStreaming } } = this.props
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('Publisher:AppState - App has come to the foreground.')
    } else if (nextAppState.match(/inactive|background/) && this.state.appState === 'active') {
      console.log('Publisher:AppState - App has gone to the background.')
      if (!enableBackgroundStreaming) {
        console.log('Publisher:AppState - unpublish()')
        this.doUnpublish()
      }
    }
    this.setState({
      appState: nextAppState
    })
  }

  render () {
    const {
      toastProps,
      buttonProps,
      audioMuted,
      videoMuted,
      swappedLayout
    } = this.state

    const {
      onStop,
    } = this.props

    const audioIconColor = audioMuted ? '#fff' : '#000'
    const videoIconColor = videoMuted ? '#fff' : '#000'
    const audioIconStyle = audioMuted ? [styles.muteIcon, styles.muteIconRight, styles.muteIconToggled] : [styles.muteIcon, styles.muteIconRight]
    const videoIconStyle = videoMuted ? [styles.muteIcon, styles.muteIconRightmost, styles.muteIconToggled] : [styles.muteIcon, styles.muteIconRightmost]

    const assignVideoRef = (video) => { this.red5pro_video_publisher = video }
    const assignToastRef = (toast) => { this.toast_field = toast }
    return (
      <View style={styles.container}>
        { !swappedLayout &&
          <R5VideoView
            style={styles.videoView}
            ref={assignVideoRef.bind(this)}
          />
        }
        <Icon
          name={audioMuted ? 'mic-off' : 'mic'}
          type='feathericon'
          size={36}
          color={audioIconColor}
          hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
          onPress={this.onToggleAudioMute}
          containerStyle={audioIconStyle}
        />
        <Icon
          name={videoMuted ? 'videocam-off' : 'videocam'}
          type='feathericon'
          size={36}
          color={videoIconColor}
          hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
          onPress={this.onToggleVideoMute}
          containerStyle={videoIconStyle}
        />
        <Text
          ref={assignToastRef.bind(this)}
          {...toastProps}>{toastProps.value}</Text>
        <Button
          {...buttonProps}
          onPress={onStop}
          title='Stop'
          accessibilityLabel='Stop'
        />
        <Button
          {...this.state.buttonProps}
          onPress={this.onSwapCamera}
          title='Swap Camera'
          accessibilityLabel='Swap Camera'
        />
        <Button
          {...buttonProps}
          onPress={this.onToggleDetach}
          title='Toggle Detach'
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
    console.log(`Publisher:onMetadata :: ${event.nativeEvent.metadata}`)
  }

  onConfigured (event) {
    const key = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.key : event.key
    console.log(`Publisher:onConfigured :: ${key}`)
  }

  onPublisherStreamStatus (event) {
    const status = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.status : event.status
    console.log(`Publisher:onPublisherStreamStatus :: ${JSON.stringify(status, null, 2)}`)
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: {...this.state.toastProps, value: message},
        isInErrorState: (status.code === 2)
      })
    }
  }

  onUnpublishNotification (event) {
    const status = event.hasOwnProperty('nativeEvent') ? event.nativeEvent.status : event.status
    console.log(`Publisher:onUnpublishNotification:: ${JSON.stringify(status, null, 2)}`)
    this.setState({
      isInErrorState: false,
      toastProps: {...this.state.toastProps, value: 'Unpublished'}
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

  onSwapCamera () {
    console.log('Publisher:onSwapCamera()')
    R5StreamModule.swapCamera(this.streamId)
  }

  onToggleAudioMute () {
    console.log('Publisher:onToggleAudioMute()')
    const { audioMuted } = this.state
    if (audioMuted) {
      R5StreamModule.unmuteAudio(this.streamId)
    } else {
      R5StreamModule.muteAudio(this.streamId)
    }
    this.setState({
      audioMuted: !audioMuted
    })
  }

  onToggleVideoMute () {
    console.log('Publisher:onToggleVideoMute()')
    const { videoMuted } = this.state
    if (videoMuted) {
      R5StreamModule.unmuteVideo(this.streamId)
    } else {
      R5StreamModule.muteVideo(this.streamId)
    }
    this.setState({
      videoMuted: !videoMuted
    })
  }

  doDetach () {
    const nodeHandle = findNodeHandle(this.red5pro_video_publisher)
    if (nodeHandle) {
      console.log(`[R5StreamModule:doDetach]: found view...`)
      detach(nodeHandle, this.streamId)
      this.setState({
        attached: false
      })
    }
  }

  doAttach () {
    const nodeHandle = findNodeHandle(this.red5pro_video_publisher)
    if (nodeHandle) {
      console.log(`[R5StreamModule:doAttach]: found view...`)
     attach(nodeHandle, this.streamId)
      this.setState({
        attached: true
      })
    }
  }

  doPublish () {
    const {
      streamProps
    } = this.props

    R5StreamModule.publish(this.streamId, streamProps)
      .then(streamId => {
        console.log('R5StreamModule publisher with ' + streamId);
      })
      .catch(error => {
        console.log('Publisher:Stream Subscribe Error - ' + error)
      })
  }

  doUnpublish () {
    R5StreamModule.unpublish(this.streamId)
      .then(streamId => {
        console.log('R5StreamModule publisher with ' + streamId);
      })
      .catch(error => {
        console.log('Publisher:Stream Unpublisher Error - ' + error)
      })
  }

}
