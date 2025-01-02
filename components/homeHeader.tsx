import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Path } from "react-native-svg";

import { FIREBASE_AUTH, FIREBASE_DB } from "../firebaseConfig";
import EmojiPickerModal from "./modals/emojiPickerModal";

const homeHeader = () => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [status, setStatus] = useState("I am new here!");
  const [mood, setMood] = useState("👋");
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // TODO: reset reactions when user sets mood or status
  const handleMood = async (mood: string) => {
    setMood(mood);
    setShowEmoji(false);
    if (userId) {
      const userRef = doc(FIREBASE_DB, "users", userId);
      await updateDoc(userRef, { emoji: mood });
      await AsyncStorage.setItem(`emoji`, mood);
    }
  };

  const fetchSelfData = async () => {
    if (userId) {
      let emoji = await AsyncStorage.getItem(`emoji`);
      let stat = await AsyncStorage.getItem(`status`);
      if (!emoji || !stat) {
        const userRef = doc(FIREBASE_DB, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          emoji = userDoc.data().emoji || "👋";
          stat = userDoc.data().status || "";
          await AsyncStorage.setItem(`emoji`, emoji || "👋");
          await AsyncStorage.setItem(`status`, stat || "I am new here!");
        }
      }
      setMood(emoji || "👋");
      setStatus(stat || "");
    }
  };

  const handleSetStatus = async (status: string) => {
    if (userId) {
      try {
        const userRef = doc(FIREBASE_DB, "users", userId);
        await updateDoc(userRef, { status: status });
        await AsyncStorage.setItem("status", status); // Cache the status
      } catch (e: any) {
        console.error("Error updating status: ", e.message);
        alert("Error updating status: " + e.message);
      }
    }
  };

  useEffect(() => {
    fetchSelfData();
  }, []);

  return (
    <View className="flex justify-start items-center p-8 min-h-15 bg-sky-400 dark:bg-zinc-800">
      {/* dark:text-blue-900 */}
      <Text className="text-2xl text-sky-900 mt-10 dark:text-white">
        How are you
      </Text>
      <View className="relative items-center mt-3">
        <TouchableOpacity
          onPress={() => setShowEmoji(true)}
          className="p-2 pt-6 m-2 rounded-full items-center self-center bg-orange-50 border-2 border-dashed dark:bg-gray-700"
        >
          <Text className="text-8xl text-black p-4">
            {mood || "Pick a mood!"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="absolute bottom-3 right-3 bg-sky-500 dark:bg-sky-900 rounded-full w-12 h-12 justify-center items-center border-2 border-blue-900"
          onPress={() => setShowEmoji(true)}
        >
          <Text className="text-2xl">✏️</Text>
        </TouchableOpacity>
      </View>

      <View className="flex flex-row items-center justify-center">
        <TextInput
        // dark:bg-gray-700 dark:text-white
          className="w-3/4 p-2 m-2 border-2 rounded-lg bg-white text-black  dark:bg-gray-700 dark:text-white"
          placeholder="What's on your mind?"
          placeholderTextColor={"#808080"}
          value={status}
          returnKeyType="send"
          onChangeText={setStatus}
        />

        <TouchableOpacity onPress={() => handleSetStatus(status)}>
          <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            transform={[{ scaleX: -1 }]}
                   className="outline-dashed"
          >
            <Path  stroke="#000000" strokeWidth={2} d="M2 12L22 2L16 12L22 22L2 12Z" fill="#808080" />
          </Svg>
        </TouchableOpacity>
      </View>

      <EmojiPickerModal
        onSelectEmoji={handleMood}
        onClose={() => setShowEmoji(false)}
        visible={showEmoji}
      />
    </View>
  );
};

export default homeHeader;
