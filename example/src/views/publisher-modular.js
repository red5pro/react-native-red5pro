/* eslint-disable no-console */
import React from 'react'
import {
  AppState,
  NativeEventEmitter,
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
  R5PublishType,
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
  },
  attachButton: {
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

const isValidStatusMessage = (value) => {
  return value && typeof value !== 'undefined' && value !== 'undefined' && value !== 'null'
}

export default class Publisher extends React.Component {
  constructor (props) {
    super(props)

    this.emitter = new NativeEventEmitter(R5StreamModule)

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
      attached: true,
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

  }

  componentDidMount () {
    console.log('Publisher:componentWillMount()')
    AppState.addEventListener('change', this._handleAppStateChange)

    const {
      streamProps: {
        configuration
      }
    } = this.props
    const streamIdToUse = [configuration.streamName, Math.floor(Math.random() * 0x10000).toString(16)].join('-')
    this.streamId = streamIdToUse
    R5StreamModule.init(streamIdToUse, configuration)
      .then(streamId => {
        console.log('Publisher configuration with ' + streamId)
        this.streamId = streamId
        if (this.state.attached) {
          this.doAttach()
        }
        this.doPublish()
      })
      .catch(error => {
        console.log('Subscriber:Stream Setup Error - ' + error)
      })

    this.emitter.addListener('onMetaDataEvent', this.onMetaData)
    this.emitter.addListener('onConfigured', this.onConfigured)
    this.emitter.addListener('onPublisherStreamStatus', this.onPublisherStreamStatus)
    this.emitter.addListener('onUnpublishNotification', this.onUnpublishNotification)
  }

  componentWillUnmount () {
    console.log('Publisher:componentWillUnmount()')
    AppState.removeEventListener('change', this._handleAppStateChange)
    this.doUnpublish()
    this.emitter.removeAllListeners('onMetaDataEvent')
    this.emitter.removeAllListeners('onConfigured')
    this.emitter.removeAllListeners('onPublisherStreamStatus')
    this.emitter.removeAllListeners('onUnpublishNotification')
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.attached !== this.state.attached) {
      if (this.state.attached) {
        this.doAttach()
      } else {
        // this.doDetach()
        // Not detaching here, as we need a view reference to do detachment.
        // As such, the act of detaching is in the original method that changed state.
      }
    }
    if (prevState.swappedLayout !== this.state.swappedLayout) {
      if (this.state.attached) {
        this.doAttach()
      }
    }
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
      videoProps,
      audioMuted,
      videoMuted,
      attached,
      swappedLayout
    } = this.state

    const {
      onStop,
      streamProps
    } = this.props

    const setup = Object.assign({}, streamProps, videoProps)
    // Remove the configuration from the setup for views. We just want props.
    delete setup.configuration

    const audioIconColor = audioMuted ? '#fff' : '#000'
    const videoIconColor = videoMuted ? '#fff' : '#000'
    const audioIconStyle = audioMuted ? [styles.muteIcon, styles.muteIconRight, styles.muteIconToggled] : [styles.muteIcon, styles.muteIconRight]
    const videoIconStyle = videoMuted ? [styles.muteIcon, styles.muteIconRightmost, styles.muteIconToggled] : [styles.muteIcon, styles.muteIconRightmost]

    const assignVideoRef = (video) => { this.red5pro_video_publisher = video }
    const assignToastRef = (toast) => { this.toast_field = toast }
    return (
      <View style={styles.container}>
        { !attached &&
          <View style={styles.container}>
            <Button
              styles={[styles.button, styles.attachButton]}
              onPress={this.onToggleDetach}
              title='Attach'
            />
          </View>
        }
        { attached && !swappedLayout &&
          <R5VideoView
            {...setup}
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
        { attached &&
          <Button
            {...buttonProps}
            onPress={this.onToggleDetach}
            title='Detach'
          />
        }
        <Button
          {...buttonProps}
          onPress={this.onSwapLayout}
          title='Swap Layout'
        />
        { attached && swappedLayout &&
          <R5VideoView
            {...setup}
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
    const toAttach = !attached
    if (!toAttach) {
      this.doDetach()
    }
    this.setState({
      attached: !attached
    })
  }

  onSwapLayout () {
    console.log('Subscriber:onSwapLayout()')
    const {
      attached,
      swappedLayout
    } = this.state
    if (attached) {
      this.doDetach()
    }
    this.setState({
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
      console.log(`[Publisher:doDetach]: found view...`)
      detach(nodeHandle, this.streamId)
    }
  }

  doAttach () {
    const nodeHandle = findNodeHandle(this.red5pro_video_publisher)
    if (nodeHandle) {
      console.log(`[Publisher:doAttach]: found view...`)
     attach(nodeHandle, this.streamId)
    }
  }

  doPublish () {
    const {
      streamProps
    } = this.props

    R5StreamModule.publish(this.streamId, R5PublishType.LIVE, streamProps)
      .then(streamId => {
        console.log('R5StreamModule publish with ' + streamId);
      })
      .catch(error => {
        console.log('Publisher:Stream Publish Error - ' + error)
      })
  }

  doUnpublish () {
    R5StreamModule.unpublish(this.streamId)
      .then(streamId => {
        console.log('R5StreamModule unpublished with ' + streamId);
      })
      .catch(error => {
        console.log('Publisher:Stream Unpublished Error - ' + error)
      })
  }

}
