import R5StreamModule from './src/stream/R5StreamModule'
import R5VideoView from './src/view/R5VideoView'
import R5AudioMode from './src/enum/R5VideoView.audiomode'
import R5LogLevel from './src/enum/R5VideoView.loglevel'
import R5PublishType from './src/enum/R5VideoView.publishtype'
import R5ScaleMode from './src/enum/R5VideoView.scalemode'

import {
  subscribe,
  unsubscribe,
  preview,
  publish,
  unpublish,
  swapCamera,
  updateScaleMode,
  updateScaleSize,
  setPlaybackVolume,
  muteAudio, unmuteAudio,
  muteVideo, unmuteVideo,
  attach, detach
} from './src/commands/R5VideoView.commands'

module.exports = {
  R5StreamModule, R5VideoView,
  subscribe, unsubscribe, preview, publish, unpublish, swapCamera,
  updateScaleMode, updateScaleSize, setPlaybackVolume,
  muteAudio, unmuteAudio, muteVideo, unmuteVideo,
  attach, detach,
  R5AudioMode, R5LogLevel, R5PublishType, R5ScaleMode
}

