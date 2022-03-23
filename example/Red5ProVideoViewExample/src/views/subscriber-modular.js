/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  AppState,
  NativeEventEmitter,
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
  R5StreamModule,
  R5VideoView,
  R5AudioMode,
  R5ScaleMode,
  updateScaleMode,
  setPlaybackVolume,
  attach, detach
} from 'react-native-red5pro'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center'
  },
  subcontainer: {
    flex: 1
  },
  swappedSubcontainer: {
    flexDirection: 'column-reverse'
  },
  unswappedSubcontainer: {
    flexDirection: 'column'
  },
  videoView: {
    flex: 2,
    backgroundColor: 'black'
  },
  imageContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'black'
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  swappedIconContainer: {
    top: 232
  },
  unswappedIconContainer: {
    top: 12
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
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
    color: 'white',
    padding: 4,
    height: 26,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 1.0)'
  },
  muteIcon: {
    padding: 6,
    borderRadius: 40,
    right: 10,
    width: 40,
    backgroundColor: 'white'
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

const Subscriber = ({ onStop }) => {
  const { stream } = useContext(StreamContext)

  const emitter = useRef(new NativeEventEmitter(R5StreamModule))
  const subRef = useRef()

  const appState = useRef(AppState.currentState)
  const [appStateCurrent, setAppStateCurrent] = useState(appState.current)
  const [streamId, setStreamId] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [toastMessage, setToastMessage] = useState('waiting...')
  const [isInErrorState, setIsInErrorState] = useState(false)
  const [isDisconnected, setIsDisconnected] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [audioIconStyle, setAudioIconStyle] = useState([styles.muteIcon, styles.muteIconRight])
  const [scaleMode, setScaleMode] = useState(R5ScaleMode.SCALE_TO_FILL)
  const [attached, setAttached] = useState(true)
  const [swappedLayout, setSwappedLayout] = useState(false)

  useEffect(() => {
    const subscribe = AppState.addEventListener('change', onAppStateChange)
    const eventEmitter = emitter.current
    if (eventEmitter) {
      eventEmitter.addListener('onMetaDataEvent', onMetaData)
      eventEmitter.addListener('onConfigured', onConfigured)
      eventEmitter.addListener('onSubscriberStreamStatus', onSubscriberStreamStatus)
      eventEmitter.addListener('onUnsubscribeNotification', onUnsubscribeNotification)
    }
    return () => {
      subscribe.remove()
      if (eventEmitter) {
        eventEmitter.removeAllListeners('onMetaDataEvent')
        eventEmitter.removeAllListeners('onConfigured')
        eventEmitter.removeAllListeners('onSubscriberStreamStatus')
        eventEmitter.removeAllListeners('onUnsubscribeNotification')
      }
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

  useEffect(() => {
    if (configuration) {
      console.log(`Subscriber:init()`)
      init()
    }
  }, [configuration])

  useEffect(() => {
    if (attached) {
      doAttach()
    }
  }, [attached, swappedLayout])

  useEffect(() => {
    if (streamId) {
      console.log(`Stream Id is set: ${streamId}`)
      doSubscribe()
      if (attached) {
        doAttach()
      }
    }
  }, [streamId])

  const init = async () => {
    const streamIdToUse = [configuration.streamName, Math.floor(Math.random() * 0x10000).toString(16)].join('-')
    try {
      console.log(`Stream Id to use: ${streamIdToUse}`)
      const id = await R5StreamModule.init(streamIdToUse, configuration)
      setStreamId(id)
    } catch (e) {
      console.error(e)
      console.log('Subscriber:Stream Setup Error - ' + e.message)
    }
  }

  const doSubscribe = async () => {
    const {
      subscribeVideo,
      showDebugView,
      logLevel,
      useBackfacingCamera,
      enableBackgroundStreaming
    } = stream
    try {
      await R5StreamModule.subscribe(streamId, {
        audioMode: R5AudioMode.STANDARD,
        scaleMode,
        subscribeVideo,
        showDebugView,
        logLevel,
        useBackfacingCamera,
        enableBackgroundStreaming
      })
      if (attached) {
        doAttach()
      }
      console.log(`R5StreamModule subscriber with ${streamId}.`)
    } catch (e) {
      console.error(e)
    }
  }

  const doUnsubscribe = async () => {
    try {
      const id = await R5StreamModule.unsubscribe(streamId)
      console.log(`R5StreamModule unsubscribed with stream id: ${id}.`)
    } catch (e) {
      console.error(e)
    }
  }

  const doDetach = () => {
    const nodeHandle = findNodeHandle(subRef.current)
    if (nodeHandle && streamId) {
      console.log(`[Subscriber:doDetach]: found view, stream id: ${streamId}...`)
      detach(nodeHandle, streamId)
    }
  }

  const doAttach = () => {
    const nodeHandle = findNodeHandle(subRef.current)
    console.log('Attach')
    console.log(nodeHandle)
    if (nodeHandle && streamId) {
      console.log(`[Subscriber:doAttach]: found view, stream id: ${streamId}...`)
      attach(nodeHandle, streamId)
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
    const metadata = event.nativeEvent ? event.nativeEvent.metadata : event.metadata
    console.log(`Subscriber:onMetadata :: ${metadata}`)
  }

  const onConfigured = event => {
    const key = event.nativeEvent ? event.nativeEvent.key : event.key
    console.log(`Subscriber:onConfigured :: ${key}`)
  }

  const onSubscriberStreamStatus = event => {
    const status = event.nativeEvent ? event.nativeEvent.status : event.status
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
    const status = event.nativeEvent ? event.nativeEvent.status : event.status
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
    updateScaleMode(findNodeHandle(subRef.current), scale)
    setScaleMode(scale)
  }

  const onToggleAudioMute = () => {
    console.log('Subscriber:onToggleAudioMute()')
    const style = [styles.muteIcon, styles.muteIconRight]
    if (audioMuted) {
      //      R5StreamModule.unmuteAudio(streamId)
      setPlaybackVolume(findNodeHandle(subRef.current), 100)
    } else {
      //      R5StreamModule.muteAudio(streamId)
      setPlaybackVolume(findNodeHandle(subRef.current), 0)
    }
    setAudioIconStyle(!audioMuted ? style.concat([styles.muteIconToggled]) : style)
    setAudioMuted(!audioMuted)
  }

  const onToggleDetach = () => {
    console.log('Subscriber:onToggleDetach()')
    const toAttach = !attached
    if (!toAttach) {
      doDetach()
    } else {
      doAttach()
    }
    setAttached(toAttach)
  }

  const onSwapLayout = () => {
    console.log('Subscriber:onSwapLayout()')
    if (attached) {
      doDetach()
    }
    setSwappedLayout(!swappedLayout)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.subcontainer}>
        {!attached && (
          <View style={styles.container}>
            <TouchableOpacity
              style={[styles.button, styles.attachButton]}
              onPress={onToggleDetach}
              title='Attach'>
              <Text style={styles.buttonLabel}>Attach</Text>
            </TouchableOpacity>
          </View>
        )}
        {attached && !swappedLayout && (
          <R5VideoView
            {...stream}
            ref={subRef}
            style={styles.videoView}
            onMetaData={onMetaData}
            onConfigured={onConfigured}
            onSubscriberStreamStatus={onSubscriberStreamStatus}
          onUnsubscribeNotification={onUnsubscribeNotification}
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
            name={audioMuted ? 'md-volume-off' : 'md-volume-high'}
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
          {attached && (
            <TouchableOpacity style={styles.button}
              onPress={onToggleDetach}
              title='Detach'>
              <Text style={styles.buttonLabel}>Detach</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button}
            onPress={onSwapLayout}
            title='Swap Layout'>
            <Text style={styles.buttonLabel}>Swap Layout</Text>
          </TouchableOpacity>
          {attached && swappedLayout && (
            <R5VideoView
              {...stream}
              ref={subRef}
              style={styles.videoView}
              onMetaData={onMetaData}
              onConfigured={onConfigured}
              onSubscriberStreamStatus={onSubscriberStreamStatus}
              onUnsubscribeNotification={onUnsubscribeNotification}
              />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Subscriber
