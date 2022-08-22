import React, { createContext, useState } from 'react'
import { 
  R5LogLevel,
  R5ScaleMode
} from 'react-native-red5pro'

const StreamContext = createContext()
const StreamProvider = ({ children }) => {

  const setStream = value => {
    const stream = {...contextValue.stream, ...value}
    setContextValue({...contextValue, stream })
  }

  const initialState = {
    setStream: setStream,
    stream: {
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
      enableBackgroundStreaming: false,
      useAuthentication: false,
      hardwareAccelerated: true,
      scaleMode: R5ScaleMode.SCALE_TO_FILL,
    }
  }

  const [contextValue, setContextValue] = useState(initialState)

  return (
    <StreamContext.Provider value={contextValue}>
      {children}
    </StreamContext.Provider>
  )
}

export { StreamContext, StreamProvider }
