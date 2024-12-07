import { View, Text, Button } from 'react-native'
import React from 'react'
import { NavigationProp } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../../firebaseConfig'

interface SettingsProps {
    navigation: NavigationProp<any, any>
}

const Settings = ({ navigation }: SettingsProps) => {
  return (
    <View>
      <Text>Settings</Text>
        <Button onPress={() => navigation.navigate('Home')} title="Go Home" />
            <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
    </View>
  )
}

export default Settings