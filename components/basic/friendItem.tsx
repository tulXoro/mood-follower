import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useRef } from "react";
import { onSnapshot, doc } from "firebase/firestore";

import { FIREBASE_DB } from "../../firebaseConfig";

interface friendItemProps {
  uid: string;

  removeFriend: (uid: string) => void;
}

const friendItem = ({ uid, removeFriend }: friendItemProps) => {
  const [name, setName] = React.useState("");
  const [emoji, setEmoji] = React.useState("");
  const [status, setStatus] = React.useState("");
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

  return (
    <View>
      <Image />
      <Text>{name}</Text>
      <Text>{emoji}</Text>
      <Text>{status}</Text>
      <Text></Text>
      <TouchableOpacity
        onPress={() => {
          removeFriend(uid);
        }}
      >
        <Text>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

export default friendItem;
