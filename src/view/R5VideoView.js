import React from 'react'
import PropTypes from 'prop-types'
import R5LogLevel from '../enum/R5VideoView.loglevel'
import R5ScaleMode from '../enum/R5VideoView.scalemode'
import R5AudioMode from '../enum/R5VideoView.audiomode'
import R5PublishType from '../enum/R5VideoView.publishtype'
import { requireNativeComponent, ViewPropTypes } from 'react-native'

class R5VideoView extends React.Component {

  constructor (props) {
    super(props)
    this._onMetaData = this._onMetaData.bind(this)
    this._onConfigured = this._onConfigured.bind(this)
    this._onPublisherStreamStatus = this._onPublisherStreamStatus.bind(this)
    this._onSubscriberStreamStatus = this._onSubscriberStreamStatus.bind(this)
    this._onUnpublishNotification = this._onUnpublishNotification.bind(this)
    this._onUnsubscribeNotification = this._onUnsubscribeNotification.bind(this)

    this.state = {
      configured: false
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    console.log(`R5VideoView: update ${JSON.stringify(nextState, null, 2)}`)
    if (this.state.configured !== nextState.configured) {
      console.log('needs update.')
      return true
    }
    return false
  }

  _onMetaData = (event) => {
    if (!this.props.onMetaData) {
      return
    }
    this.props.onMetaData(event)
  }

  _onConfigured = (event) => {
    console.log('R5VideoView:: _onConfigured')
    if (!this.props.onConfigured) {
      return
    }
    this.props.onConfigured(event)
  }

  _onPublisherStreamStatus = (event) => {
    if (!this.props.onPublisherStreamStatus) {
      return
    }
    this.props.onPublisherStreamStatus(event)
  }

  _onSubscriberStreamStatus = (event) => {
    if (!this.props.onSubscriberStreamStatus) {
      return
    }
    this.props.onSubscriberStreamStatus(event)
  }

  _onUnsubscribeNotification = (event) => {
    console.log('R5VideoView:: _onUnsubscribe')
    if (!this.props.onUnsubscribeNotification) {
      return
    }
    this.props.onUnsubscribeNotification(event)
  }

  _onUnpublishNotification = (event) => {
    console.log('R5VideoView:: _onUnpublish')
    if (!this.props.onUnpublishNotification) {
      return
    }
    this.props.onUnpublishNotification(event)
  }

  _onLayout = (event) => {
    // const layout = event.nativeEvent.layout
    // console.log(`R5Video:onLayout: ${event.nativeEvent.layout.x}, ${event.nativeEvent.layout.y}, ${event.nativeEvent.layout.width}x${event.nativeEvent.layout.height}`);
  }

  render() {
    return <R5Video
            ref={(video) => { this.red5provideo = video }}
            {...this.props}
            onLayout={this._onLayout}
            onMetaDataEvent={this._onMetaData}
            onConfigured={this._onConfigured}
            onPublisherStreamStatus={this._onPublisherStreamStatus}
            onSubscriberStreamStatus={this._onSubscriberStreamStatus}
            onUnsubscribeNotification={this._onUnsubscribeNotification}
            onUnpublishNotification={this._onUnpublishNotification}
          />
  }

}

R5VideoView.propTypes = {
    showDebugView: PropTypes.bool,
    scaleMode: PropTypes.number,
    logLevel: PropTypes.oneOf([R5LogLevel.ERROR, R5LogLevel.WARN, R5LogLevel.INFO, R5LogLevel.DEBUG]),
    streamType: PropTypes.oneOf([R5PublishType.LIVE, R5PublishType.RECORD, R5PublishType.APPEND]), // publisher only
    publishVideo: PropTypes.bool,                   // publisher only
    publishAudio: PropTypes.bool,                   // publisher only
    cameraWidth: PropTypes.number,                  // publisher only
    cameraHeight: PropTypes.number,                 // publisher only
    bitrate: PropTypes.number,                      // publisher only, kb/s
    framerate: PropTypes.number,                    // publisher only, fps
    useAdaptiveBitrateController: PropTypes.bool,   // publisher only
    useBackfacingCamera: PropTypes.bool,            // publisher only
    audioBitrate: PropTypes.bool,                   // publisher only, kb/s
    audioSampleRate: PropTypes.bool,                // publisher only, hz, default iOS is 16000, default Android is 44100
    audioMode: PropTypes.number, // mainly subscribers, especially with 2 subscribers.
    configuration: PropTypes.shape({
      host: PropTypes.string.isRequired,
      port: PropTypes.number.isRequired,
      streamName: PropTypes.string,
      bufferTime: PropTypes.number,
      contextName: PropTypes.string.isRequired,
      licenseKey: PropTypes.string.isRequired,
      bundleID: PropTypes.string.isRequired,
      streamBufferTime: PropTypes.number,
      parameters: PropTypes.object,
      key: PropTypes.string.isRequired
    }).isRequired,
    onConfigured: PropTypes.func,
    onMetaDataEvent: PropTypes.func,
    onPublisherStreamStatus: PropTypes.func,
    onSubscriberStreamStatus: PropTypes.func,
    onUnsubscribeNotification: PropTypes.func,
    onUnpublishNotification: PropTypes.func,
    ...ViewPropTypes
}
R5VideoView.defaultProps = {
    showDebugView: false,
    streamType: R5PublishType.LIVE,
    scaleMode: R5ScaleMode.SCALE_TO_FILL,
    logLevel: R5LogLevel.ERROR,
    publishVideo: true,
    publishAudio: true,
    cameraWidth: 640,
    cameraHeight: 360,
    bitrate: 750,
    framerate: 15,
    audioBitrate: 32, // for HQ Audio: set to 128 + audioSampleRate: 44100
    useAdaptiveBitrateController: false,
    useBackfacingCamera: false,
    audioMode: R5AudioMode.STANDARD
}

let R5Video = requireNativeComponent('R5VideoView', R5VideoView)

export default R5VideoView

