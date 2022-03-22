/* eslint-disable no-console */
import React, { useContext, useEffect, useRef, useState } from 'react'
import {
  AppState,
  NativeEventEmitter,
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
  },
  attachButton: {
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

const isValidStatusMessage = (value) => {
  return value && typeof value !== 'undefined' && value !== 'undefined' && value !== 'null'
}

const Publisher = ({ onStop }) => {
  const { stream } = useContext(StreamContext)

  const emitter = useRef(new NativeEventEmitter(R5StreamModule))
  const pubRef = useRef()

  const appState = useRef(AppState.currentState)
  const [appStateCurrent, setAppStateCurrent] = useState(appState.current)
  const [streamId, setStreamId] = useState(null)
  const [configuration, setConfiguration] = useState(null)
  const [toastMessage, setToastMessage] = useState('waiting...')
  const [isInErrorState, setIsInErrorState] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [videoMuted, setVideoMuted] = useState(false)
  const [audioIconStyle, setAudioIconStyle] = useState([styles.muteIcon, styles.muteIconRight])
  const [videoIconStyle, setVideoIconStyle] = useState([styles.muteIcon, styles.muteIconRight])
  const [attached, setAttached] = useState(true)
  const [swappedLayout, setSwappedLayout] = useState(false)

  useEffect(() => {
    const subscribe = AppState.addEventListener('change', onAppStateChange)
    const eventEmitter = emitter.current
    if (eventEmitter) {
      eventEmitter.addListener('onMetaDataEvent', onMetaData)
      eventEmitter.addListener('onConfigured', onConfigured)
      eventEmitter.addListener('onPublisherStreamStatus', onPublisherStreamStatus)
      eventEmitter.addListener('onUnpublishNotification', onUnpublishNotification)
    }
    return () => {
      subscribe.remove()
      if (eventEmitter) {
        eventEmitter.removeAllListeners('onMetaDataEvent')
        eventEmitter.removeAllListeners('onConfigured')
        eventEmitter.removeAllListeners('onPublisherStreamStatus')
        eventEmitter.removeAllListeners('onUnpublishNotification')
      }
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

  useEffect(() => {
    if (configuration) {
      console.log(`Publisher:init()`)
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
      doPublish()
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
      console.log('Publisher:Stream Setup Error - ' + e.message)
    }
  }

  const doPublish = async() => {
    try {
      await R5StreamModule.publish(streamId, R5PublishType.LIVE, stream)
      if (attached) {
        doAttach()
      }
      console.log(`R5StreamModule publisher with ${streamId}.`);
    } catch (e) {
      console.error(e)
    }
  }

  const doUnpublish = async () => {
    try {
      const id = await R5StreamModule.unpublish(streamId)
      console.log(`R5StreamModule unpublished with stream id: ${id}.`)
    } catch (e) {
      console.error(e)
    }
  }

  const doDetach = () => {
    const nodeHandle = findNodeHandle(pubRef.current)
    if (nodeHandle && streamId) {
      console.log(`[Publisher:doDetach]: found view, stream id: ${streamId}...`)
      detach(nodeHandle, streamId)
    }
  }

  const doAttach = () => {
    const nodeHandle = findNodeHandle(pubRef.current)
    if (nodeHandle && streamId) {
      console.log(`[Publisher:doAttach]: found view, stream id: ${streamId}...`)
      attach(nodeHandle, streamId)
    }
  }

  const onAppStateChange = nextAppState => {
    console.log(`Publisher:AppState - ${nextAppState}`)
    const { enableBackgroundStreaming } = stream
    if (appStateCurrent.match(/inactive|background/) && nextAppState === 'active') {
      console.log('Publisher:AppState - App has come to the foreground.')
    } else if (nextAppState === 'inactive') {
      console.log('Publisher:AppState - App has gone to the background.')
      if (!enableBackgroundStreaming) {
        console.log('Publisher:AppState - unpublish()')
        onStopPublish()
      }
    }
    setAppStateCurrent(nextAppState)
  }

  const onStopPublish = () => {
    try {
      doUnpublish()
    } catch (e) {
      console.error(e)
    }
    onStop()
  }
  const onMetaData = event => {
    const metadata = event.nativeEvent ? event.nativeEvent.metadata : event.metadata
    console.log(`Publisher:onMetadata :: ${metadata}`)
  }

  const onConfigured = event => {
    const key = event.nativeEvent ? event.nativeEvent.key : event.key
    console.log(`Publisher:onConfigured :: ${key}`)
  }

  const onPublisherStreamStatus = event => {
    const status = event.nativeEvent ? event.nativeEvent.status : event.status
    console.log(`Publisher:onPublisherStreamStatus :: ${JSON.stringify(status, null, 2)}`)
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (!isInErrorState) {
      setIsInErrorState(status.code === 2)
    }
    setToastMessage(message)
  }

  const onUnpublishNotification = event => {
    const status = event.nativeEvent ? event.nativeEvent.status : event.status
    console.log(`Publisher:onUnpublishNotification:: ${JSON.stringify(status, null, 2)}`)
    setIsInErrorState(false)
    setToastMessage('Unpublished.')
  }
  const onToggleAudioMute = () => {
    console.log('Publisher:onToggleAudioMute()')
    const style = [styles.muteIcon, styles.muteIconRight]
    if (audioMuted) {
      R5StreamModule.unmuteAudio(streamId)
    } else {
      R5StreamModule.muteAudio(streamId)
    }
    setAudioIconStyle(!audioMuted ? style.concat([styles.muteIconToggled]) : style)
    setAudioMuted(!audioMuted)
  }

  const onToggleVideoMute = () => {
    console.log('Publisher:onToggleVideoMute()')
    const style = [styles.muteIcon, styles.muteIconRightmost]
    if (videoMuted) {
      R5StreamModule.unmuteVideo(streamId)
    } else {
      R5StreamModule.muteVideo(streamId)
    }
    setVideoIconStyle(!videoMuted ? style.concat([styles.muteIconToggled]) : style)
    setVideoMuted(!videoMuted)
  }

  const onSwapCamera = () => {
    console.log('Publisher:onSwapCamera()')
    R5StreamModule.swapCamera(streamId)
  }

  const onToggleDetach = () => {
    console.log('Publisher:onToggleDetach()')
    const toAttach = !attached
    if (!toAttach) {
      doDetach()
    } else {
      doAttach()
    }
    setAttached(toAttach)
  }

  const onSwapLayout = () => {
    console.log('Publisher:onSwapLayout()')
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
            ref={pubRef}
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
            type='ionicon'
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
            accessibilityLabel="Stop">
            <Text style={styles.buttonLabel}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
            onPress={onSwapCamera}
            title='Swap Camera'
            accessibilityLabel='Swap Camera'>
            <Text style={styles.buttonLabel}>Swap Camera</Text>
          </TouchableOpacity>
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
              ref={pubRef}
              style={styles.videoView}
              onMetaData={onMetaData}
              onConfigured={onConfigured}
              onPublisherStreamStatus={onPublisherStreamStatus}
              onUnpublishNotification={onUnpublishNotification}
              />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Publisher
