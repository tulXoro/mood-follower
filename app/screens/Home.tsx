import { View, Text, Button } from 'react-native'
import React from 'react'

interface HomeProps {
    navigation: any
    }


const Home = ( {navigation}: HomeProps ) => {
  return (
    <View>
      <Text>Home</Text>
      <Button onPress={() => navigation.navigate('Settings')} title="Go to Settings" />
    </View>
  )
}

export default Home