import { NativeModules } from 'react-native'
import R5PublishType from '../enum/R5VideoView.publishtype'
const { R5VideoViewManager } = NativeModules
const { UIManager } = NativeModules

export const subscribe = (handle, streamName) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.subscribe, [streamName])
}

export const unsubscribe = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.unsubscribe, null)
}

export const publish = (handle, streamName, streamType = R5PublishType.LIVE) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.publish, [streamName, streamType])
}

export const unpublish = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.unpublish, null)
}

export const swapCamera = (handle) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.swapCamera, null)
}

export const updateScaleMode = (handle, scale) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.updateScaleMode, [scale])
}

export const updateScaleSize = (handle, width, height, screenWidth, screenHeight) => {
  UIManager.dispatchViewManagerCommand(handle, UIManager.R5VideoView.Commands.updateScaleSize, [width, height, screenWidth, screenHeight])
}

