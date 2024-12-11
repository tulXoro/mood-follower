import {
  View,
  Text,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState } from "react";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { NavigationProp } from "@react-navigation/native";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";

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
        const response = await signInWithEmailAndPassword(AUTH, email, password);

      console.log(response);
      alert("Check your email.");
    } catch (e) {
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
