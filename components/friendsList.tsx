import { View, Text, TouchableOpacity, FlatList, NativeModules } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import AddFriendModal from "./modals/addFriendModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import {
  doc,
  writeBatch,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseConfig";

import FriendItem from "./basic/friendItem";

const group = 'group.com.mfollower';
const SharedStorage = NativeModules.SharedStorage;


const FriendsList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [friendUIDList, setFriendsList] = useState([] as string[]);
  const widgetData = {
    friends: friendUIDList,
  };
  const unsubscribeRef = useRef<() => void>(() => {});

  // NOTE:
  // Because we are listening on a snapshot, there is no need to update the friends list
  const removeFriend = async (friendUID: string) => {
    console.log("Removing friend with UID: ", friendUID);
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      return;
    }

    try {
      // Update Firestore
      const batch = writeBatch(FIREBASE_DB);
      const userRef = doc(FIREBASE_DB, "users", userId);
      const friendRef = doc(FIREBASE_DB, "users", friendUID);

      batch.update(userRef, {
        friends: arrayRemove(friendUID),
      });
      batch.update(friendRef, {
        friends: arrayRemove(userId),
      });

      await batch.commit();
    } catch (e: any) {
      console.error("Error removing friend: ", e);
    }
  };

  const fetchFriends = async () => {
    // get a snapshot of the user's friends
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      return;
    }
    unsubscribeRef.current = onSnapshot(doc(FIREBASE_DB, "users", userId), async (doc) => {
      const friends = doc.data()?.friends || [];
      try {
        await SharedGroupPreferences.setItem('widgetKey', widgetData, group);
      } catch (error) {
        console.log({error});
      }
      SharedStorage.set(JSON.stringify(friends));
      setFriendsList(friends);
    });
  }

  useEffect(() => {
    fetchFriends();
    return () => {
      unsubscribeRef.current();
    };

  }, []);

  const renderItem = ({ item }: { item: { uid: string } }) => (
    <FriendItem uid={item.uid} removeFriend={removeFriend} />
  );

  return (
    <View className="w-full p-3 bg-sky-400 dark:bg-gray-800">
      <Text className="text-black dark:text-white">Contacts</Text>

      <FlatList
        data={friendUIDList.map(uid => ({ uid }))}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
      />

      <TouchableOpacity
        className="bg-blue-500 p-2 m-2 rounded-md"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white">Add Contact</Text>
      </TouchableOpacity>

      <AddFriendModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default FriendsList;
