import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";
import { NavigationProp } from "@react-navigation/native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

interface SettingsProps {
  navigation: NavigationProp<any, any>;
}

const Settings = ({ navigation }: SettingsProps) => {
  const [displayName, setDisplayName] = React.useState<string | null>(null);
  const [friendPhrase, setFriendPhrase] = React.useState<string | null>(null);

  const signOut = async () => {
    try {
      await FIREBASE_AUTH.signOut();
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Error signing out: ", e);
    }
  }

  const deleteAccount = async () => {
    try {
      await FIREBASE_AUTH.currentUser?.delete();
      // get the user's friends
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (userId) {
        const friends = await getDoc(doc(FIREBASE_DB, "users", userId));
        // go through each friend and delete the user from their friends list
        friends.data()?.friends.forEach(async (friend: string) => {
          const friendDoc = await getDoc(doc(FIREBASE_DB, "users", friend));
          const newFriends = friendDoc.data()?.friends.filter((f: string) => f !== userId);
          await updateDoc(doc(FIREBASE_DB, "users", friend), { friends: newFriends });
        });
        // delete the user from the database
        await deleteDoc(doc(FIREBASE_DB, "users", userId));
        await AsyncStorage.clear();

        try {
        // delete the user's authentification
        await FIREBASE_AUTH.currentUser?.delete();
        } catch (e) {
          console.log("Error deleting user: ", e);
          
        }

        // remove friend requests containing the user

        alert("Account deleted successfully");
        navigation.navigate("Login");

      } else {
        console.error("User ID is undefined");
      }
      
    } catch (e) {
      console.error("Error deleting account: ", e);
    }
  }


  useEffect(() => {
    AsyncStorage.getItem("displayName").then((value) => setDisplayName(value));
    AsyncStorage.getItem("friendPhrase").then((value) =>
      setFriendPhrase(value)
    );
  }, []);

  return (
    <View className="bg-emerald-200 dark:bg-slate-800 h-screen p-6" >
      <View className="flex flex-col items-center gap-2 p-2 mt-10">
        <Text className="text-lg text-black dark:text-white">Display Name:</Text>
        <Text className="border p-2 text-black dark:text-white mb-10">{displayName}</Text>
        <Text className="text-lg text-black dark:text-white">Friend Phrase:</Text>
        <Text className="text-orange-600 text-3xl">{friendPhrase}</Text>
      </View>
      <View className="p-20 gap-6">
      <Button onPress={() => navigation.navigate("Home")} title="Go Home" />
      <Button onPress={signOut} title="Logout" /></View>
      <Button onPress={deleteAccount} title="Delete Account" />

    </View>
  );
};

export default Settings;
