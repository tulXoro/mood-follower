import { View, Text, TouchableOpacity, FlatList, NativeModules } from "react-native";
import React, { useEffect, useRef, useState } from "react";


import AsyncStorage from "@react-native-async-storage/async-storage";
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import {
  doc,
  writeBatch,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../lib/firebaseConfig";

import FriendItem from "./basic/friendItem";

const group = 'group.com.mfollower';
const SharedStorage = NativeModules.SharedStorage;


const FriendsList = () => {

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
    // dark:bg-gray-800
    <View className="w-full p-3 h-full bg-white dark:bg-gray-800">
      <Text className="text-black dark:text-white pt-2 font-bold text-lg">Contacts</Text>

      {
        friendUIDList.length > 0 ? (
          <FlatList
            data={friendUIDList.map((uid) => ({ uid }))}
            renderItem={renderItem}
            keyExtractor={(item) => item.uid}
          />
        ) : (
          <Text className="text-gray-600 justify-center text-center p-10">No friends yet! Add a friend to see them here!</Text>
        )

        
      }


    </View>
  );
};

export default FriendsList;
