import { View, Text, Button, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";

import { NavigationProp } from "@react-navigation/native";

import FriendsList from "../../components/friendsList";
import HomeHeader from "../../components/homeHeader";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../lib/firebaseConfig";

import TestWidget from "../../components/testWidget";

import AddFriendModal from "../../components/modals/addFriendModal";

interface HomeProps {
  navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: HomeProps) => {
  const [friends, setFriends] = React.useState<string[]>([]);
  const [loadingFriends, setLoadingFriends] = React.useState(true);
  const [friendModalVisible, setFriendModalVisible] = React.useState(false);

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

      <View className="flex-row justify-center dark:bg-gray-900 bg-slate-200 w-screen">
        <TouchableOpacity
          className="p-2 w-1/2 rounded-tl-lg rounded-bl-lg border-2 border-r-0"
          onPress={() => setFriendModalVisible(true)}
        >
          <Text className=" text-black dark:text-white text-center">
            Add Friend
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="p-2 w-1/2 rounded-tr-lg rounded-br-lg border-2"
          onPress={() => navigation.navigate("Settings")}
        >
          <Text className=" text-black dark:text-white text-center ">
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <FriendsList />

      {/* <TestWidget /> */}

      <AddFriendModal
        visible={friendModalVisible}
        onClose={() => setFriendModalVisible(false)}
      />
    </View>
  );
};

export default Home;
