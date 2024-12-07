import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

import AddFriendModal from './modals/addFriendModal'

import FriendItem from './basic/friendItem'

const friendsList = () => {
    const [modalVisible, setModalVisible] = React.useState(false)
  return (
    <View className='w-full p-3 bg-sky-400 dark:bg-gray-800'>
      <Text className='bg-white'>Contacts</Text>

      <FriendItem pname={null} pemoji={null} pstatus={null} />

      <TouchableOpacity
        className='bg-blue-500 p-2 m-2 rounded-md'
        onPress={() => setModalVisible(true)}
      >
        <Text className='text-white'>Add Contact</Text>
      </TouchableOpacity>

      <AddFriendModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  )
}

export default friendsList