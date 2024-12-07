import { View, Text,Image } from 'react-native'
import React from 'react'

interface friendItemProps {
    pname: string | null
    pemoji: string | null
    pstatus: string | null
    }

const friendItem = ( {pname, pemoji, pstatus}:friendItemProps ) => {
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
    </View>
  )
}

export default friendItem