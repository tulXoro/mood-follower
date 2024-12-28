import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { generate } from "random-words";
import { NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RegisterProps {
  route: { params: { pemail: string; ppassword: string } };
  navigation: NavigationProp<any, any>;
}

const Register = ({ route, navigation }: RegisterProps) => {
  const { pemail, ppassword } = route.params || { pemail: "", ppassword: "" };
  const [email, setEmail] = useState(pemail);
  const [password, setPassword] = useState(ppassword);
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const AUTH = FIREBASE_AUTH;
  const DB = FIREBASE_DB;

  const signUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        AUTH,
        email,
        password
      );
      console.log(`User created with UID: ${response.user.uid}`);

      const friendPhrase = await generateUniqueFriendPhrase();
      const userRef = doc(DB, "users", response.user.uid); // Reference to the document with the user UID
      await setDoc(userRef, {
        uid: response.user.uid,
        displayName: displayName,
        friendPhrase: friendPhrase,
        emoji: "👋",
        status: "I am trying out this new app!",
        friends: [],
      });

      await AsyncStorage.setItem("displayName", displayName);
      await AsyncStorage.setItem("friendPhrase", JSON.stringify(friendPhrase));

      alert(
        "Success! Here is your friend phrase: " +
          friendPhrase +
          "Don't worry, you can view it later."
      );
    } catch (e) {
      setError((e as any).message);
      alert("Error: " + (e as any).message);
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueFriendPhrase = async () => {
    let friendPhrase;
    let isUnique = false;

    while (!isUnique) {
      friendPhrase = generate({ exactly: 3, join: "-" });
      const q = query(
        collection(DB, "users"),
        where("friendPhrase", "==", friendPhrase)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        isUnique = true;
      }
    }

    return friendPhrase;
  };

  return (
    <View>
      <KeyboardAvoidingView behavior="padding">
        <Text>Register</Text>

        <Text>Email</Text>
        <TextInput
          className="h-12 w-72 p-2 m-2 items-center self-center bg-white dark:bg-gray-800"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Text>Password</Text>
        <TextInput
          className="h-12 w-72 p-2 m-2 items-center self-center bg-white dark:bg-gray-800"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry={true}
        />
        <Text>Confirm Password</Text>
        <TextInput
          className="h-12 w-72 p-2 m-2 items-center self-center bg-white dark:bg-gray-800"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry={true}
        />

        <Text>Display Name</Text>
        <TextInput
          className="h-12 w-72 p-2 m-2 items-center self-center bg-white dark:bg-gray-800"
          placeholder="Enter a display name!"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="none"
        />
      </KeyboardAvoidingView>

      <TouchableOpacity onPress={signUp}>
        <Text>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Login", { pemail: email, ppassword: password });
        }}
      >
        <Text>Already have an account? Go back!</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;
