/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  AppState,
  findNodeHandle,
  Image,
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
  R5ScaleMode,
  subscribe,
  unsubscribe,
  updateScaleMode,
  setPlaybackVolume
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
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
    flexDirection: 'column',
    height: 140
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'black'
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
    right: 10,
    width: 40,
    padding: 6,
    borderRadius: 40,
    backgroundColor: 'white'
  },
  muteIconToggled: {
    backgroundColor: '#2089dc'
  }
})

const Subscriber = ({ onStop }) => {

  const { stream } = useContext(StreamContext)

  const appState = useRef(AppState.currentState)
  const [appStateCurrent, setAppStateCurrent] = useState(appState.current)
  const [subscriberRef, setSubscriberRef] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [toastMessage, setToastMessage] = useState('waiting...')
  const [isInErrorState, setIsInErrorState] = useState(false)
  const [isDisconnected, setIsDisconnected] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [audioIconStyle, setAudioIconStyle] = useState([styles.muteIcon, styles.muteIconRight])
  const [scaleMode, setScaleMode] = useState(R5ScaleMode.SCALE_TO_FILL)

  useEffect(() => {
    const subscribe = AppState.addEventListener('change', onAppStateChange)
    return () => {
      subscribe.remove()
    }
  }, [])

  useEffect(() => {
    console.log('Subscriber:Stream')
    if (stream) {
      const { configuration } = stream
      console.log('Subscriber:Configuration - ' + JSON.stringify(configuration, null, 2))
      setConfiguration(configuration)
    }
  }, [stream])

  const doSubscribe = () => {
    const { streamName } = configuration
    subscribe(findNodeHandle(subscriberRef), streamName)
    setPlaybackVolume(findNodeHandle(subscriberRef), 100)
  }

  const doUnsubscribe = () => {
    try {
      unsubscribe(findNodeHandle(subscriberRef))
    } catch (e) {
      console.error(e)
    }
  }

  const onAppStateChange = nextAppState => {
    console.log(`Subscriber:AppState - ${nextAppState}`)
    const { enableBackgroundStreaming } = stream
    if (appStateCurrent.match(/inactive|background/) && nextAppState === 'active') {
      console.log('Subscriber:AppState - App has come to the foreground.')
    } else if (nextAppState === 'inactive') {
      console.log('Subscriber:AppState - App has gone to the background.')
      if (!enableBackgroundStreaming) {
        console.log('Subscriber:AppState - unsubscribe()')
        onStopSubscribe()
      }
    }
    setAppStateCurrent(nextAppState)
  }

  const onStopSubscribe = () => {
    try {
      doUnsubscribe()
    } catch (e) {
      console.error(e)
    }
    onStop()
  }

  const onMetaData = event => {
    const { nativeEvent: { metadata } } = event
    console.log(`Subscriber:onMetadata :: ${metadata}`)
  }

  const onConfigured = event => {
    const { nativeEvent: { key } } = event
    console.log(`Subscriber:onConfigured :: ${key}`)
    doSubscribe()
  }

  const onSubscriberStreamStatus = event => {
    const { nativeEvent: { status } } = event
    console.log(`Subscriber:onSubscriberStreamStatus :: ${JSON.stringify(status, null, 2)}`)
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (status.name.toLowerCase() === 'error' ||
      message.toLowerCase() === 'disconnected') {
      //doUnsubscribe()
      setIsDisconnected(true)
    } else if (message.toLowerCase() === 'connected') {
      setIsDisconnected(false)
    }
    if (!isInErrorState) {
      setIsInErrorState(status.code === 2)
    }
    setToastMessage(message)
  }

  const onUnsubscribeNotification = event => {
    const { nativeEvent: { status } } = event
    console.log(`Subscriber:onUnsubscribeNotification:: ${JSON.stringify(status, null, 2)}`)
    setIsInErrorState(false)
    setToastMessage('waiting...')
  }

  const onScaleMode = () => {
    console.log('Subscriber:onScaleMode()')
    let scale = scaleMode + 1
    if (scale > 2) {
      scale = 0
    }
    updateScaleMode(findNodeHandle(subscriberRef), scale)
    setScaleMode(scale)
  }

  const onToggleAudioMute = () => {
    console.log('Subscriber:onToggleAudioMute()')
    const style = [styles.muteIcon, styles.muteIconRight]
    if (audioMuted) {
      setPlaybackVolume(findNodeHandle(subscriberRef), 100)
    } else {
      setPlaybackVolume(findNodeHandle(subscriberRef), 0)
    }
    setAudioIconStyle(!audioMuted ? style.concat([styles.muteIconToggled]) : style)
    setAudioMuted(!audioMuted)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subcontainer}>
        {configuration && (
          <R5VideoView
            {...stream}
            ref={ref => setSubscriberRef(ref)}
            style={styles.videoView}
            onMetaData={onMetaData}
            onConfigured={onConfigured}
            onSubscriberStreamStatus={onSubscriberStreamStatus}
            onUnSubscribeNotification={onUnsubscribeNotification}
            />
        )}
        {!stream.subscribeVideo && (
          <View style={styles.imageContainer}>
            <Image 
              style={{ width: 69, height: 68 }}
              source={{uri: 'https://www.red5pro.com/docs/static/Red5Pro_logo_white_red.8a131521.svg'}} />
          </View>
        )}
        <View style={styles.iconContainer}>
          <Icon
            name={audioMuted ? 'volume-off' : 'volume-high'}
            type='ionicon'
            size={26}
            color={audioMuted ? '#fff' : '#000'}
            hitSlop={{ left: 10, top: 10, right: 10, bottom: 10 }}
            onPress={onToggleAudioMute}
            containerStyle={audioIconStyle}
            />
        </View>
        <View style={styles.buttonContainer}>
          <Text style={styles.toast}>{toastMessage}</Text>
          <TouchableOpacity style={styles.button}
            onPress={onStopSubscribe}
            accessibilityLabel="Stop">
            <Text style={styles.buttonLabel}>Stop</Text>
          </TouchableOpacity>
          {!isDisconnected && (
            <TouchableOpacity style={styles.button}
              onPress={onScaleMode}
              title='Swap Scale'
              accessibilityLabel='Swap Scale'>
              <Text style={styles.buttonLabel}>Swap Scale</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Subscriber
