import { View, Text, Button } from "react-native";
import React, { useEffect } from "react";

import { NavigationProp } from "@react-navigation/native";

import FriendsList from "../../components/friendsList";
import HomeHeader from "../../components/homeHeader";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface HomeProps {
  navigation: NavigationProp<any, any>;
}

const Home = ({ navigation }: HomeProps) => {

  return (
    <View>
      <HomeHeader />
      <Button
        onPress={() => navigation.navigate("Settings")}
        title="Go to Settings"
      />
        <FriendsList />
    </View>
  );
};

export default Home;
