import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";

import EmojiPickerModal from "./modals/emojiPickerModal";

const homeHeader = () => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [mood, setMood] = useState("");

  const handleMood = (mood: string) => {
    setMood(mood);
    setShowEmoji(false);
  };

  return (
    <View className="flex justify-start items-center p-8 min-h-15">
      <Text className="text-2xl text-blue-900 dark:text-blue-300">
        How are you feeling today?
      </Text>
      <View className="relative items-center mt-5">
        <TouchableOpacity
          onPress={() => setShowEmoji(true)}
          className="p-2 m-2 rounded-full items-center self-center bg-transparent"
        >
          <Text className="text-8xl text-white p-4">
            {mood || "Pick an emoji"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="absolute bottom-5 right-5 bg-purple-700 dark:bg-purple-500 rounded-full w-12 h-12 justify-center items-center"
          onPress={() => setShowEmoji(true)}
        >
          <Text className="text-white text-2xl">✏️</Text>
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
