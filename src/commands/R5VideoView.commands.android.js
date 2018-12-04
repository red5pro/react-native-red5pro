import { NativeModules } from 'react-native'
import R5PublishType from '../enum/R5VideoView.publishtype'

const { UIManager } = NativeModules
const { R5VideoView } = UIManager
const { Commands } = R5VideoView

export const subscribe = (handle, streamName) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.subscribe, [streamName])
}

export const unsubscribe = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.unsubscribe, [])
}

export const publish = (handle, streamName, streamType = R5PublishType.LIVE) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.publish, [streamName, streamType])
}

export const unpublish = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.unpublish, [])
}

export const swapCamera = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.swapCamera, [])
}

export const updateScaleMode = (handle, mode) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.updateScaleMode, [mode])
}

export const updateScaleSize = (handle, width, height, screenWidth, screenHeight) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.updateScaleSize, [width, height, screenWidth, screenHeight])
}

export const muteAudio = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.muteAudio, [])
}

export const unmuteAudio = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.unmuteAudio, [])
}

export const muteVideo = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.muteVideo, [])
}

export const unmuteVideo = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.unmuteVideo, [])
}

export const setPlaybackVolume = (handle, value) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.setPlaybackVolume, [value])
}

export const attach = (handle, streamName) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.attach, [streamName])
}

export const detach = (handle, streamName) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.detach, [streamName])
}
