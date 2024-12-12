import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import AddFriendModal from "./modals/addFriendModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  writeBatch,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseConfig";

import FriendItem from "./basic/friendItem";


const FriendsList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [friendUIDList, setFriendsList] = useState([] as string[]);
  const unsubscribeRef = useRef<() => void>(() => {});

  const removeFriend = async (friendUID: string) => {
    console.log("Removing friend with UID: ", friendUID);
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      return;
    }

    try {
      // Update AsyncStorage
      const storedFriends = JSON.parse(
        (await AsyncStorage.getItem("friendUIDs")) || "[]"
      );
      const updatedFriends = storedFriends.filter(
        (uid: string) => uid !== friendUID
      );
      await AsyncStorage.setItem("friendUIDs", JSON.stringify(updatedFriends));
      setFriendsList(friendUIDList.filter((uid: string) => uid !== friendUID));

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
    unsubscribeRef.current = onSnapshot(doc(FIREBASE_DB, "users", userId), (doc) => {
      const friends = doc.data()?.friends || [];
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
      <Text className="bg-white">Contacts</Text>

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
