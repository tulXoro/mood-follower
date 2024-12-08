import { View, Text,Image, TouchableOpacity } from 'react-native'
import React from 'react'

interface friendItemProps {
  uid: string
    pname: string | null
    pemoji: string | null
    pstatus: string | null
    removeFriend: (uid: string) => void
    }

const friendItem = ( {uid, pname, pemoji, pstatus, removeFriend}:friendItemProps ) => {
    const [name, setName] = React.useState(pname);
    const [emoji, setEmoji] = React.useState(pemoji);
    const [status, setStatus] = React.useState(pstatus);
  return (
    <View>
    <Image />
      <Text>{name}</Text>
      <Text>{emoji}</Text>
      <Text>{status}</Text>
      <Text></Text>
      <TouchableOpacity onPress={() => {removeFriend(uid)}}>
        <Text>Remove</Text>
      </TouchableOpacity>
    </View>
  )
}

export default friendItem