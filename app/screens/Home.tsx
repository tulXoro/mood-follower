import { View, Text, Button } from "react-native";
import React from "react";
import HomeHeader from "../../components/homeHeader";
import { NavigationProp } from "@react-navigation/native";

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
    </View>
  );
};

export default Home;
