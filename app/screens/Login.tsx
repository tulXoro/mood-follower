import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../lib/firebaseConfig";
import { NavigationProp } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";

interface LoginProps {
  route: { params: { pemail: string; ppassword: string } };
  navigation: NavigationProp<any, any>;
}

const Login = ({ route, navigation }: LoginProps) => {
  const { pemail, ppassword } = route.params || { pemail: "", ppassword: "" };
  const [email, setEmail] = useState(pemail);
  const [password, setPassword] = useState(ppassword);
  const [loading, setLoading] = useState(false);
  const AUTH = FIREBASE_AUTH;

  const signIn = async () => {

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(AUTH, email, password);
      await syncData();

      alert("Check your email.");
    } catch (e) {
      alert("Error: " + (e as any).message);
    } finally {
      setLoading(false);
    }
  };

  const syncData = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      throw new Error("User ID is undefined");
    }
    try {
      // const storedDisplayName = await AsyncStorage.getItem("displayName");
      // const storedFriendPhrase = await AsyncStorage.getItem("friendPhrase");
      // const storedEmoji = await AsyncStorage.getItem("emoji");
      // const storedStatus = await AsyncStorage.getItem("status");

      const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
      await AsyncStorage.setItem("displayName", userDoc.data()?.displayName);
      await AsyncStorage.setItem("friendPhrase", userDoc.data()?.friendPhrase);
      await AsyncStorage.setItem("emoji", userDoc.data()?.emoji);
      await AsyncStorage.setItem("status", userDoc.data()?.status);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <View className="flex flex-col h-full pt-32 bg-white dark:bg-black">
      <KeyboardAvoidingView
        className="grid col-1 items-center align-middle justify-center gap-5"
        behavior="padding"
      >

        <View>
        <Text className="text-black dark:text-white" >Email</Text>
        <TextInput
          className="h-12 w-72 p-2 my-2 rounded-sm items-center self-center bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Email"
          placeholderTextColor={"#808080"}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        </View>

        <View>


        <Text className="text-black dark:text-white" >Password</Text>
        <TextInput
          className="h-12 w-72 p-2 my-2 rounded-sm items-center self-center bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Password"
          placeholderTextColor={"#808080"}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry={true}
        />
        </View>

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <TouchableOpacity onPress={signIn}>
              <Text className="text-black dark:text-white" >Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Register", {
                  pemail: email,
                  ppassword: password,
                })
              }
            >
              <Text className="text-black dark:text-white">Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
