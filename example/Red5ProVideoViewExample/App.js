import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { 
  check, 
  request, 
  PERMISSIONS 
} from 'react-native-permissions'
import { StreamProvider } from './src/components/StreamProvider'
import Publisher from './src/views/Publisher'
import Subscriber from './src/views/Subscriber'
import Settings from './src/views/Settings'

const App = () => {

  const [hasPermissions, setHasPermissions] = useState(false)
  const [isPublisher, setIsPublisher] = useState(false)
  const [isSubscriber, setIsSubscriber] = useState(false)

  const requestPermissions = async () => {
    const isAuthorized = /granted/
    let camPermission = false
    let micPermission = false

    const camResponse = await request(Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
    }))
    const micResponse = await request(Platform.select({
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      ios: PERMISSIONS.IOS.MICROPHONE,
    }))
    camPermission = isAuthorized.test(camResponse)
    micPermission = isAuthorized.test(micResponse)
    setHasPermissions(camPermission && micPermission)
  }

  const runPermissions = async () => {
    Promise.all(
        check(Platform.select({
          android: PERMISSIONS.ANDROID.CAMERA,
          ios: PERMISSIONS.IOS.CAMERA,
        })),
        check(Platform.select({
          android: PERMISSIONS.ANDROID.RECORD_AUDIO,
          ios: PERMISSIONS.IOS.MICROPHONE,
        })))
      .then((response) => {
        const isAuthorized = /granted/
        const hasCamera = isAuthorized.test(response.camera)
        const hasMic = isAuthorized.test(response.microphone)

        if (!hasCamera || !hasMic) {
          requestPermissions()
          setHasPermissions(false)
        } else {
          setHasPermissions(true)
        }
      })
  }

  useEffect(() => {
    if (!hasPermissions) {
      runPermissions()
    }
  }, [])

  const onStop = () => {
    setIsSubscriber(false)
    setIsPublisher(false)
  }

  const onPublish = () => {
    setIsSubscriber(false)
    setIsPublisher(true)
  }

  const onSubscribe = () => {
    setIsPublisher(false)
    setIsSubscriber(true)
  }

  return (
    <StreamProvider>
      {(hasPermissions && isPublisher) && (
        <Publisher onStop={onStop} />
      )}
      {(hasPermissions && isSubscriber) && (
        <Subscriber onStop={onStop} />
      )}
      {(!isPublisher && !isSubscriber) && (
        <Settings onPublish={onPublish} onSubscribe={onSubscribe} hasPermissions={hasPermissions} />
      )}
    </StreamProvider>
  )

}

export default App
