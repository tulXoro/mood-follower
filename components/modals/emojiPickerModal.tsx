import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import emojiData from "emoji-datasource";
// bottom of emoji picker modal kind of clips the last row of emojis
interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const categories: { [key: string]: { emoji: string; name: string }[] } = {
  "Smileys & Emotion": [],
  "People & Body": [],
  "Animals & Nature": [],
  "Food & Drink": [],
  Activities: [],
  "Travel & Places": [],
  Objects: [],
  Symbols: [],
  Flags: [],
};

emojiData.forEach((emoji) => {
  const category = emoji.category;
  if (categories[category]) {
    categories[category].push({
      emoji: String.fromCodePoint(
        ...emoji.unified.split("-").map((u) => parseInt(u, 16))
      ),
      name: emoji.short_name,
    });
  }
});

const emojiPickerModal = ({
  visible,
  onClose,
  onSelectEmoji,
}: EmojiPickerModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState("Smileys & Emotion");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("");
  const categoryNames = Object.keys(categories);
  const colorScheme = useColorScheme();

  const filteredEmojis = categories[selectedCategory].filter((emoji) =>
    emoji.name.includes(searchQuery.toLowerCase())
  );
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View
          className={`w-11/12 h-3/4 rounded-lg p-4 bg-slate-300 dark:bg-neutral-700 gap-1`}
        >
          <View className="items-center justify-center h-16">
            {selectedEmoji ? (
              <Text className="text-4xl text-center">{selectedEmoji}</Text>
            ) : (
              <Text className={`text-4xl text-center p-3 rounded-3xl`}>
                No Emoji Selected
              </Text>
            )}
          </View>
          <TextInput
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className={`w-full p-2 mb-2 rounded bg-gray-200 dark:bg-neutral-600 text-black dark:text-white`}
          />
          <View className="h-12 bg-transparent">
            <FlatList
              data={categoryNames}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item)}
                  className={`p-2 m-1 rounded ${
                    item === selectedCategory ? "bg-emerald-400" : "bg-gray-200"
                  }`}
                >
                  <Text className={`text-xs text-black`}>{item}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            />
          </View>

          <View className="flex-1 w-full items-center ">
            <FlatList
              className="bg-gray-400 p-4 rounded-xl"
              data={filteredEmojis}
              numColumns={6}
              keyExtractor={(item) => item.emoji}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedEmoji(item.emoji)}
                  className={`mb-2 m-1 p-2 rounded-lg ${
                    item.emoji === selectedEmoji ? "bg-green-200" : ""
                  }`}
                >
                  <Text className="text-2xl">{item.emoji}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View className="flex flex-row justify-center items-center gap-6">
          <TouchableOpacity
              onPress={() => {
                onSelectEmoji(selectedEmoji);
                onClose();
              }}
              className="mt-2 p-2 bg-green-500 rounded-full w-24 items-center self-center"
            >
              <Text className="text-white text-base">Select</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedEmoji("");
                onClose();
              }}
              className="mt-2 p-2 bg-blue-500 rounded-full w-24 items-center self-center"
            >
              <Text className="text-white text-base">Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
};

export default emojiPickerModal;
