import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { FIREBASE_DB } from "../../lib/firebaseConfig";
import Svg, { Path } from "react-native-svg";

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
    <View className="flex p-4 m-2 bg-emerald-200 rounded-lg gap-1">
      <View className="flex-row justify-between items-center mb-5">
        <View className="flex-row gap-3 items-end">
          <Text className="bg-white rounded-full p-2 border-2 text-3xl">
            {emoji}
          </Text>
          <Text className="text-wrap underline font-extrabold text-xl">
            {name}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => alert("Widgets coming soon!")}
          className="bg-sky-200 border-blue-900 rounded-lg border-2 p-1"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M14.5 6.5H17.5M17.5 6.5H20.5M17.5 6.5V9.5M17.5 6.5V3.5"
              stroke="#1C274C"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></Path>
            <Path
              d="M2.55078 15.5C2.61472 14.8499 2.75923 14.4124 3.08582 14.0858C3.67161 13.5 4.61442 13.5 6.50004 13.5C8.38565 13.5 9.32846 13.5 9.91425 14.0858C10.5 14.6716 10.5 15.6144 10.5 17.5C10.5 19.3856 10.5 20.3284 9.91425 20.9142C9.32846 21.5 8.38565 21.5 6.50004 21.5C4.61442 21.5 3.67161 21.5 3.08582 20.9142C2.77645 20.6048 2.63047 20.1959 2.56158 19.6011"
              stroke="#1C274C"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></Path>
            <Path
              d="M2.5 6.5C2.5 4.61438 2.5 3.67157 3.08579 3.08579C3.67157 2.5 4.61438 2.5 6.5 2.5C8.38562 2.5 9.32843 2.5 9.91421 3.08579C10.5 3.67157 10.5 4.61438 10.5 6.5C10.5 8.38562 10.5 9.32843 9.91421 9.91421C9.32843 10.5 8.38562 10.5 6.5 10.5C4.61438 10.5 3.67157 10.5 3.08579 9.91421C2.5 9.32843 2.5 8.38562 2.5 6.5Z"
              stroke="#1C274C"
              strokeWidth="1.5"
            ></Path>
            <Path
              d="M13.5 17.5C13.5 15.6144 13.5 14.6716 14.0858 14.0858C14.6716 13.5 15.6144 13.5 17.5 13.5C19.3856 13.5 20.3284 13.5 20.9142 14.0858C21.5 14.6716 21.5 15.6144 21.5 17.5C21.5 19.3856 21.5 20.3284 20.9142 20.9142C20.3284 21.5 19.3856 21.5 17.5 21.5C15.6144 21.5 14.6716 21.5 14.0858 20.9142C13.5 20.3284 13.5 19.3856 13.5 17.5Z"
              stroke="#1C274C"
              strokeWidth="1.5"
            ></Path>
          </Svg>
        </TouchableOpacity>
      </View>

      <Text>{status}</Text>
      <View className="flex-row mt-3 justify-between items-center w-full">
        <TouchableOpacity
          onPress={() => {
            alert("Reactions not implemented yet");
          }}
        >
          <Text className=" text-red-600 bg-sky-200 border-blue-900 rounded-full p-1 border-2">
            ➕
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-200 p-2 rounded-md border-2 border-red-800"
          onPress={confirmRemoveFriend}
        >
          <Text className=" text-red-600">Remove Friend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default friendItem;
