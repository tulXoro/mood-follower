import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';

import AddFriendModal from './modals/addFriendModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, deleteDoc, writeBatch, arrayRemove } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';

import FriendItem from './basic/friendItem';

const FriendsList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  interface Friend {
    uid: string;

  }

  const [friends, setFriends] = useState<Friend[]>([]);

  const fetchFriends = async () => {
    try {
      const storedFriends = JSON.parse((await AsyncStorage.getItem('friendUIDs')) || '[]');
      setFriends(storedFriends.map((uid: string) => ({ uid })));

      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
      const firestoreFriends = userDoc.data()?.friends || [];
      const friendsToAdd = firestoreFriends.filter((uid: string) => !storedFriends.includes(uid));
      const friendsToRemove = storedFriends.filter((uid: string) => !firestoreFriends.includes(uid));

      const batch = writeBatch(FIREBASE_DB);
      friendsToAdd.forEach((uid: string) => {
        batch.update(doc(FIREBASE_DB, 'users', userId), {
          friends: arrayRemove(uid)
        });
      });

      friendsToRemove.forEach((uid: string) => {
        batch.update(doc(FIREBASE_DB, 'users', userId), {
          friends: arrayRemove(uid)
        });
      });

      await batch.commit();
      await AsyncStorage.setItem('friendUIDs', JSON.stringify(firestoreFriends));


    } catch (e) {
      console.error('Error fetching friaaends: ', e);
    }
  };

  const removeFriend = async (friendUID: string) => {
    console.log('Removing friend with UID: ', friendUID);
  const userId = FIREBASE_AUTH.currentUser?.uid;
  if (!userId) {
    console.error('User ID is undefined');
    return;
  }

  try {
    // Update AsyncStorage
    const storedFriends = JSON.parse((await AsyncStorage.getItem('friends')) || '[]');
    const updatedFriends = storedFriends.filter((uid: string) => uid !== friendUID);
    await AsyncStorage.setItem('friends', JSON.stringify(updatedFriends));
    setFriends(friends.filter(friend => friend.uid !== friendUID));

    // Update Firestore
    const batch = writeBatch(FIREBASE_DB);
    const userRef = doc(FIREBASE_DB, 'users', userId);
    const friendRef = doc(FIREBASE_DB, 'users', friendUID);

    batch.update(userRef, {
      friends: arrayRemove(friendUID)
    });
    batch.update(friendRef, {
      friends: arrayRemove(userId)
    });

    await batch.commit();
    console.log('Friend removed successfully');
  } catch (e: any) {
    console.error('Error removing friend: ', e);
  }
  }

  useEffect(() => {
    fetchFriends();
    console.log('FriendsList mounted');
  }, []);

  const renderItem = ({ item }: { item: Friend }) => (
    <FriendItem uid={item.uid} removeFriend={removeFriend} />
  );

  return (
    <View className='w-full p-3 bg-sky-400 dark:bg-gray-800'>
      <Text className='bg-white'>Contacts</Text>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
      />

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
  );
};

export default FriendsList;