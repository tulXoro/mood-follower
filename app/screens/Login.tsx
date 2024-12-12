import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { NavigationProp } from "@react-navigation/native";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
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
      const storedDisplayName = await AsyncStorage.getItem("displayName");
      const storedFriendPhrase = await AsyncStorage.getItem("friendPhrase");
      const storedEmoji = await AsyncStorage.getItem("emoji");
      const storedStatus = await AsyncStorage.getItem("status");




      const userDoc = await getDoc(doc(FIREBASE_DB, "users", userId));
      await AsyncStorage.setItem("displayName", userDoc.data()?.displayName);
      await AsyncStorage.setItem("friendPhrase", userDoc.data()?.friendPhrase);
      await AsyncStorage.setItem("emoji", userDoc.data()?.emoji);
      await AsyncStorage.setItem("status", userDoc.data()?.status);


    } catch (e: any) {
      alert("Error: " + e.message);
    }}

  return (
    <View>
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry={true}
        />

        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <Button title="Login" onPress={signIn} />
            <Button
              title="Sign Up"
              onPress={() =>
                navigation.navigate("Register", {
                  pemail: email,
                  ppassword: password,
                })
              }
            />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;
