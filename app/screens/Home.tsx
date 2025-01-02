import { View, Text, Button, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";

import { NavigationProp } from "@react-navigation/native";

import FriendsList from "../../components/friendsList";
import HomeHeader from "../../components/homeHeader";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";

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

      <View className="flex-row gap-10 justify-center dark:bg-gray-900">
      <TouchableOpacity
        className="p-2 bg-gray-200 w-1/3 dark:bg-gray-800"
        onPress={() => setFriendModalVisible(true)}
      >
        <Text className=" text-black dark:text-white">Add Friend</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="p-2 bg-gray-200 w-1/3 dark:bg-gray-800"
        onPress={() => navigation.navigate("Settings")}
      >
        <Text className=" text-black dark:text-white">Settings</Text>

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
