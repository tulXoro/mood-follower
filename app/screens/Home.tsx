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
  const [friends, setFriends] = React.useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = React.useState(true);

  const syncData = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      throw new Error("User ID is undefined");
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
