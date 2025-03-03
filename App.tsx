import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useColorScheme } from "nativewind";
import { onAuthStateChanged, User } from "firebase/auth";

import { FIREBASE_AUTH } from "./lib/firebaseConfig";

import "./global.css";

import Login from "./app/screens/Login";
import Register from "./app/screens/Register";
import Home from "./app/screens/Home";
import Settings from "./app/screens/Settings";
import React from "react";


const Stack = createNativeStackNavigator();

const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          {user ? (
            <Stack.Screen
              name="HomeScreen"
              component={HomeStackScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
