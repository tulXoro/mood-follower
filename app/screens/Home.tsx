import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";

import { NavigationProp } from "@react-navigation/native";

import FriendsList from "../../components/friendsList";
import HomeHeader from "../../components/homeHeader";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";

import TestWidget from "../../components/testWidget";

interface HomeProps {
  navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: HomeProps) => {

  const syncData = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      throw new Error("User ID is undefined");
    }
    try {
      // Read data from AsyncStorage
      const storedFriends = JSON.parse((await AsyncStorage.getItem('friends')) || '[]');
      const storedDisplayName = await AsyncStorage.getItem('displayName');
      const storedFriendPhrase = await AsyncStorage.getItem('friendPhrase');
      const storedEmoji = await AsyncStorage.getItem('emoji');
      const storedStatus = await AsyncStorage.getItem('status');

      // Fetch data from Firestore
      const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
      const firestoreFriends = userDoc.data()?.friends || [];
      const firestoreDisplayName = userDoc.data()?.displayName;
      const firestoreFriendPhrase = userDoc.data()?.friendPhrase;
      const firestoreEmoji = userDoc.data()?.emoji;
      const firestoreStatus = userDoc.data()?.status;

      // Compare AsyncStorage data with Firestore data
      const isFriendsDifferent = JSON.stringify(storedFriends) !== JSON.stringify(firestoreFriends);
      const isDisplayNameDifferent = storedDisplayName !== firestoreDisplayName;
      const isFriendPhraseDifferent = storedFriendPhrase !== firestoreFriendPhrase;
      const isEmojiDifferent = storedEmoji !== firestoreEmoji;
      const isStatusDifferent = storedStatus !== firestoreStatus;

      // Update AsyncStorage if there is a difference
      if (isFriendsDifferent || isDisplayNameDifferent || isFriendPhraseDifferent || isEmojiDifferent  || isStatusDifferent) {
        await AsyncStorage.setItem('friends', JSON.stringify(firestoreFriends));
        await AsyncStorage.setItem('displayName', firestoreDisplayName);
        await AsyncStorage.setItem('friendPhrase', firestoreFriendPhrase);
        await AsyncStorage.setItem('emoji', firestoreEmoji);
        await AsyncStorage.setItem('status', firestoreStatus);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  return (
    <View>
      <HomeHeader />
      <Button
        onPress={() => navigation.navigate("Settings")}
        title="Go to Settings"
      />
        <FriendsList />

        <TestWidget />
    </View>
  );
};

export default Home;
