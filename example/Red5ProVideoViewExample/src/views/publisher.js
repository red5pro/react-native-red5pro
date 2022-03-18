/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  AppState,
  findNodeHandle,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Icon } from 'react-native-elements'
import { StreamContext } from '../components/StreamProvider'
import {
  R5VideoView,
  publish,
  unpublish,
  swapCamera,
  muteAudio, unmuteAudio,
  muteVideo, unmuteVideo
} from 'react-native-red5pro'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  subcontainer: {
    flex: 1,
  },
  videoView: {
    position: 'absolute',
    backgroundColor: 'black',
    top: 0,
    right: 0,
    bottom: 140,
    left: 0
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 0,
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    position: 'absolute',
    backgroundColor: 'black',
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'column',
    height: 140
  },
  button: {
    backgroundColor: '#2089dc',
    height: 46,
    marginTop: 2,
    alignContent: 'center'
  },
  buttonLabel: {
    color: 'white',
    fontSize: 20,
    padding: 8,
    textAlign: 'center'
  },
  toast: {
    flex: 1,
    color: 'white',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1.0)'
  },
  muteIcon: {
    padding: 6,
    borderRadius: 40,
    backgroundColor: 'white'
  },
  muteIconRightmost: {
    right: 10
  },
  muteIconRight: {
    right: 30
  },
  muteIconToggled: {
    backgroundColor: '#2089dc'
  }
})

const isValidStatusMessage = (value) => {
  return value && typeof value !== 'undefined' && value !== 'undefined' && value !== 'null'
}

const Publisher = ({ streamProps, style, onStop }) => {

  const { stream } = useContext(StreamContext)

  const appState = useRef(AppState.currentState)
  const [publisherRef, setPublisherRef] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [toastMessage, setToastMessage] = useState('waiting...')
  const [isInErrorState, setIsInErrorState] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [audioIconStyle, setAudioIconStyle] = useState([styles.muteIcon, styles.muteIconRight])
  const [videoIconStyle, setVideoIconStyle] = useState([styles.muteIcon, styles.muteIconRight])

  useEffect(() => {
    console.log('Add App State Change.')
    const subscribe = AppState.addEventListener('change', onAppStateChange)
    return () => {
      subscribe.remove()
    }
  }, [])

  useEffect(() => {
    console.log('Publisher:Stream')
    if (stream) {
      const { configuration } = stream
      console.log('Publisher:Configuration - ' + JSON.stringify(configuration, null, 2))
      setConfiguration(configuration)
    }
  }, [stream])

  const onAppStateChange = nextAppState => {
    console.log(`Publisher:AppState - ${nextAppState}`)
    const { enableBackgroundStreaming } = stream
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('Publisher:AppState - App has come to the foreground.')
      if (enableBackgroundStreaming) {
        console.log('Background Streaming enabled: unmuteVideo')
        unmuteVideo(findNodeHandle(publisherRef))
      }
    } else if (nextAppState.match(/inactive|background/) && appState === 'active') {
      console.log('Publisher:AppState - App has gone to the background.')
      if (!enableBackgroundStreaming) {
        console.log('Publisher:AppState - unpublish()')
        onStopPublish()
      } else {
        console.log('Background Streaming enabled: muteVideo')
        muteVideo(findNodeHandle(publisherRef))
      }
    }
  }

  const onStopPublish = () => {
    if (configuration) {
      try {
        const { streamName } = configuration
        console.log(`Unpublish: ${streamName}`)
        unpublish(findNodeHandle(publisherRef), streamName)
      } catch (e) {
        console.error(e)
      }
    }
    onStop()
  }

  const onSwapCamera = () => {
    console.log('Publisher:onSwapCamera()')
    swapCamera(findNodeHandle(publisherRef))
  }

  const onToggleAudioMute = () => {
    const style = [styles.muteIcon, styles.muteIconRight]
    if (audioMuted) {
      unmuteAudio(findNodeHandle(publisherRef))
    } else {
      muteAudio(findNodeHandle(publisherRef))
    }
    setAudioIconStyle(!audioMuted ? style.concat([styles.muteIconToggled]) : style)
    setAudioMuted(!audioMuted)
  }

  const onToggleVideoMute = () => {
    const style = [styles.muteIcon, styles.muteIconRightmost]
    if (videoMuted) {
      unmuteVideo(findNodeHandle(publisherRef))
    } else {
      muteVideo(findNodeHandle(publisherRef))
    }
    setVideoIconStyle(!videoMuted ? style.concat([styles.muteIconToggled]) : style)
    setVideoMuted(!videoMuted)
  }

  const onMetaData = event => {
    const { nativeEvent: { metadata } } = event
    console.log(`Publisher:onMetadata :: ${metadata}`)
  }

  const onConfigured = event => {
    const { streamName } = configuration
    const { nativeEvent: { key } } = event
    console.log(`Publisher:onConfigured :: ${key}`)
    publish(findNodeHandle(publisherRef), streamName)
  }

  const onPublisherStreamStatus = event => {
    const { nativeEvent: { status } } = event
    console.log(`Publisher:onPublisherStreamStatus :: ${JSON.stringify(status, null, 2)}`)
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (!isInErrorState) {
      setIsInErrorState(status.code === 2)
    }
    setToastMessage(message)
  }

  const onUnpublishNotification = event => {
    const { nativeEvent: { status } } = event
    console.log(`Publisher:onUnpublishNotification:: ${JSON.stringify(status, null, 2)}`)
    setIsInErrorState(false)
    setToastMessage('Unpublished')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subcontainer}>
        {configuration && (
          <R5VideoView
            {...stream}
            ref={ref => setPublisherRef(ref)}
            style={styles.videoView}
            onMetaData={onMetaData}
            onConfigured={onConfigured}
            onPublisherStreamStatus={onPublisherStreamStatus}
            onUnpublishNotification={onUnpublishNotification}
            />
        )}
        <View style={styles.iconContainer}>
          <Icon
            name={audioMuted ? 'mic-off' : 'mic'}
            type='feathericon'
            size={36}
            color={audioMuted ? '#fff' : '#000'}
            hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
            onPress={onToggleAudioMute}
            containerStyle={audioIconStyle}
            />
          <Icon
            name={videoMuted ? 'videocam-off' : 'videocam'}
            type='feathericon'
            size={36}
            color={videoMuted ? '#fff' : '#000'}
            hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
            onPress={onToggleVideoMute}
            containerStyle={videoIconStyle}
            />
        </View>
        <View style={styles.buttonContainer}>
          <Text style={styles.toast}>{toastMessage}</Text>
          <TouchableOpacity style={styles.button}
            onPress={onStopPublish}
            accessibilityLabel='Stop'>
            <Text style={styles.buttonLabel}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
            onPress={onSwapCamera}
            accessibilityLabel='Swap Camera'>
            <Text style={styles.buttonLabel}>Swap Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )

}

export default Publisher
