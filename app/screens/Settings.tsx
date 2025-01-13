import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";
import { NavigationProp } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    </View>
  );
};

export default Settings;
