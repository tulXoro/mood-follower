import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { NavigationProp } from "@react-navigation/native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginProps {
  route: { params: { pemail: string; ppassword: string } };
  navigation: NavigationProp<any, any>;
}

const Login = ({ route, navigation }: LoginProps) => {
  const { pemail, ppassword } = route.params || { pemail: "", ppassword: "" };
  const [email, setEmail] = useState(pemail);
  const [password, setPassword] = useState(ppassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const AUTH = FIREBASE_AUTH;
    const DB = FIREBASE_DB;

  const signIn = async () => {
    setLoading(true);
    try {
        const response = await signInWithEmailAndPassword(AUTH, email, password);
      const userDoc = await getDoc(doc(getFirestore(), "users", response.user.uid));
      const displayName = userDoc.data()?.displayName;
      const friendPhrase = userDoc.data()?.friendPhrase;

      await AsyncStorage.setItem("displayName", JSON.stringify(displayName));
      await AsyncStorage.setItem("friendPhrase", JSON.stringify(friendPhrase));

      console.log(response);
      alert("Check your email.");
    } catch (e) {
      setError((e as any).message);
      alert("Error: " + (e as any).message);
    } finally {
      setLoading(false);
    }
  };

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
