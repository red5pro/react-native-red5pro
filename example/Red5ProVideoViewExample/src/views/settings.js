import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch
} from 'react-native'
import { Icon } from 'react-native-elements'
import AsyncStorage from '@react-native-community/async-storage'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
    marginTop: 15
  },
  subcontainer: {
    paddingHorizontal: 50,
    paddingVertical: 20
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },
  switchLabel: {
    fontSize: 15
  }
})

export default function Settings(props) {
  const [state, setState] = useState({
    autoFocusEnabled: false,
    autoReconnectEnabled: false,
    adaptiveBitrateEnabled: false,
    doubleBitrateEnabled: false
  })

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    storeData()
  }, [state])

  const storeData = async () => {
    try {
      const json = JSON.stringify(state)
      await AsyncStorage.setItem('@settings', json)

    } catch (error) {
      console.log(error)
    }
  }
  
  const getData = async () => {
    try {
      const jsonData = await AsyncStorage.getItem('@settings')

      if (jsonData != null) {
        const parsedData = JSON.parse(jsonData)
        setState(parsedData)
      }

    } catch (error) {
      console.log(error)
    }
  }

  const toggleAutoFocus = () => {
    const newValue = !state.autoFocusEnabled

    setState({
      ...state,
      autoFocusEnabled: newValue
    })
  }

  const toggleAutoReconnect = () => {
    const newValue = !state.autoReconnectEnabled

    setState({
      ...state,
      autoReconnectEnabled: newValue
    })
  }

  const toggleAdaptiveBitrate = () => {
    const newValue = !state.adaptiveBitrateEnabled

    setState({
      ...state,
      adaptiveBitrateEnabled: newValue
    })
  }

  const toggledoubleBitrate = () => {
    const newValue = !state.doubleBitrateEnabled

    setState({
      ...state,
      doubleBitrateEnabled: newValue
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={props.onClose}
        >
          <Icon
            name='arrow-back'
            color='#2196F3'
            size={24}
          />
        </TouchableOpacity>
        <Text
          style={{color: '#2196F3', fontSize: 20, marginLeft: 15}}
        >
          Settings
        </Text>
        <View style={{width: 24}} />
      </View>
      <View style={styles.subcontainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable auto-focus</Text>
          <Switch
            colo
            value={state.autoFocusEnabled}
            onValueChange={toggleAutoFocus}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable auto-reconnect</Text>
          <Switch
            disabled
            value={state.autoReconnectEnabled}
            onValueChange={toggleAutoReconnect}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable adaptive bitrate</Text>
          <Switch
            colo
            value={state.adaptiveBitrateEnabled}
            onValueChange={toggleAdaptiveBitrate}
          />
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable double bitrate (1500)</Text>
          <Switch
            colo
            value={state.doubleBitrateEnabled}
            onValueChange={toggledoubleBitrate}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
