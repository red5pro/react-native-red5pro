import React from 'react'
import {
  findNodeHandle,
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { 
  R5VideoView,
  R5ScaleMode,
  subscribe,
  unsubscribe,
  updateScaleMode
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
  }
})

export default class Subscriber extends React.Component {
  constructor (props) {
    super(props)

    // Events.
    this.onMetaData = this.onMetaData.bind(this)
    this.onConfigured = this.onConfigured.bind(this)
    this.onSubscriberStreamStatus = this.onSubscriberStreamStatus.bind(this)
    this.onUnsubscribeNotification = this.onUnsubscribeNotification.bind(this)

    this.onScaleMode = this.onScaleMode.bind(this)

    this.state = {
      scaleMode: R5ScaleMode.SCALE_TO_FILL,
            isInErrorState: false,
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
        onSubscriberStreamStatus: this.onSubscriberStreamStatus,
        onUnSubscribeNotification: this.onUnsubscribeNotification
      }
    }
  }

  componentWillUnmount () {
    const nodeHandle = findNodeHandle(this.red5pro_video_subscriber)
    const {
      streamProps: {
        configuration: {
          streamName
        }
      }
    } = this.props
    if (nodeHandle) {
      unsubscribe(nodeHandle, streamName)
    }
  }
  render () {
    const {
      videoProps,
      toastProps,
      buttonProps
    } = this.state

    const {
      onStop,
      streamProps
    } = this.props

    const setup = Object.assign({}, streamProps, videoProps)

    const assignVideoRef = (video) => { this.red5pro_video_subscriber = video }
    const assignToastRef = (toast) => { this.toast_field = toast }

    return (
      <View style={styles.container}>
        <R5VideoView
          {...setup}
          ref={assignVideoRef.bind(this)}
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
          {...buttonProps}
          onPress={this.onScaleMode}
          title='Swap Scale'
          accessibilityLabel='Swap Scale'
        />
      </View>
    )
  }

  onMetaData (event) {
    console.log(`Subscriber:onMetadata :: ${event.nativeEvent.metadata}`)
  }

  onConfigured (event) {
    const {
      streamProps: {
        configuration: {
          streamName
        }
      }
    } = this.props

    console.log(`Subscriber:onConfigured :: ${event.nativeEvent.key}`)
    subscribe(findNodeHandle(this.red5pro_video_subscriber), streamName)
  }

  onSubscriberStreamStatus (event) {
    console.log(`Subscriber:onSubscriberStreamStatus :: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    const status = event.nativeEvent.status
    let message = isValidStatusMessage(status.message) ? status.message : status.name
    if (!this.state.inErrorState) {
      this.setState({
        toastProps: {...this.state.toastProps, value: message},
        isInErrorState: (status.code === 2)
      })
    }
  }

  onUnsubscribeNotification (event) {
    console.log(`Subscriber:onUnsubscribeNotification:: ${JSON.stringify(event.nativeEvent.status, null, 2)}`)
    this.setState({
      isInErrorState: false,
      toastProps: {...this.state.toastProps, value: 'waiting...'}
    })
  }

  onScaleMode (event) {
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
}
