import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { FIREBASE_DB } from "../../firebaseConfig";

interface friendItemProps {
  uid: string;
  removeFriend: (uid: string) => void;
}

const friendItem = ({ uid, removeFriend }: friendItemProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [status, setStatus] = useState("");
  const unsubscribeRef = useRef<() => void>(() => {});

  const fetchDetails = async () => {
    try {
      const friendDoc = await doc(FIREBASE_DB, "users", uid);
      unsubscribeRef.current = onSnapshot(friendDoc, (doc) => {
        setName(doc.data()?.displayName);
        setStatus(doc.data()?.status);
        setEmoji(doc.data()?.emoji);
      });
    } catch (e) {
      console.error("Error fetching friend details: ", e);
    }
  };

  useEffect(() => {
    fetchDetails();

    return () => {
      unsubscribeRef.current();
    };
  }, []);

  const confirmRemoveFriend = () => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => removeFriend(uid),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex p-4 bg-neutral-300 m-2 rounded-lg gap-1 ">
      <Text className="text-wrap underline font-extrabold">{name}</Text>
      <Text>{emoji}</Text>
      <Text>{status}</Text>
      <TouchableOpacity
        onPress={confirmRemoveFriend}
      >
        <Text className="text-right text-red-600">Remove Friend</Text>
      </TouchableOpacity>
    </View>
  );
};

export default friendItem;
