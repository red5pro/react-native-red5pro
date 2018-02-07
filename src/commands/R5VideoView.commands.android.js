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

export const preview = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, Commands.preview, [])
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

