import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { collection, query, where, getDocs, addDoc, deleteDoc, updateDoc, arrayUnion, doc } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from "../../firebaseConfig";

import AsyncStorage from "@react-native-async-storage/async-storage";

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FriendRequest {
    uid: string;
    displayName: string;
}

const addFriendModal = ({ visible, onClose }: AddFriendModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>("");
  const [searchResultUID, setSearchResultUID] = useState<string | null>("");
  const [pendingInvites, setPendingInvites] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState("addFriend");

  const userId = FIREBASE_AUTH.currentUser?.uid;

  const handleSearch = async () => {
    const q = query(collection(FIREBASE_DB, "users"), where("friendPhrase", "==", searchTerm));
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setSearchResult(doc.data().displayName);
            setSearchResultUID(doc.id);
        } else {
            setSearchResult(null);
            alert("No user found.");
        }
    } catch (e: any) {
        alert("Error: " + e.message);
    }
  };

  const handleAddFriend = async () => {
    if (searchResultUID) {
        const q = query(
          collection(FIREBASE_DB, "friendRequests"),
          where("from", "==", userId),
          where("to", "==", searchResultUID)
        );
        try {
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                alert("Friend request already sent!");
                return;
            }
        } catch (e: any) {
            alert("Error!: " + e.message);
            return;
        }
  
        const userRef = collection(FIREBASE_DB, "friendRequests");
        try {
            const userName = await AsyncStorage.getItem('displayName')
            await addDoc(userRef, { from: userId, to: searchResultUID, fromName: userName, toName: searchResult });
          alert("Friend request sent!");
        } catch (e: any) {
          alert("Error: " + e.message + " " + searchResult);
        }
      } else {
        alert("No user found to add.");
      }
};

const fetchPendingInvites = async () => {
    const q = query(collection(FIREBASE_DB, "friendRequests"), where("from", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        const requests: FriendRequest[] = [];
        querySnapshot.forEach((doc) => {
            let friend: FriendRequest = {
                uid: doc.data().to,
                displayName: doc.data().toName
            };
            requests.push(friend);
        });
        setPendingInvites(requests);
    } catch (e: any) {
        alert("Error: " + e.message);
    }

}

const fetchPendingRequests = async () => {
    const q = query(collection(FIREBASE_DB, "friendRequests"), where("to", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        const invites: FriendRequest[] = [];
        querySnapshot.forEach((doc) => {
            let friend: FriendRequest = {
                uid: doc.data().from,
                displayName: doc.data().fromName
            };
            invites.push(friend);
        });
        setPendingRequests(invites);
    } catch (e: any) {
        alert("Error: " + e.message);
    }
}

const acceptFriendRequest = async (uid: string) => {
    const q = query(
      collection(FIREBASE_DB, "friendRequests"),
      where("from", "==", uid),
      where("to", "==", userId)
    );
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
  
        // Update the friends field for both users
        if (userId) {
          const userRef = doc(FIREBASE_DB, "users", userId);
          const friendRef = doc(FIREBASE_DB, "users", uid);
    
          await updateDoc(userRef, {
            friends: arrayUnion(uid)
          });
    
          await updateDoc(friendRef, {
            friends: arrayUnion(userId)
          });
        } else {
          alert("User ID is undefined.");
        }

        // Delete the friend request document
        await deleteDoc(docSnapshot.ref);
  
        alert("Friend added!");
      } else {
        alert("No friend request found.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

const rejectFriendInvite = async (uid: string) => {
    const q = query(
      collection(FIREBASE_DB, "friendRequests"),
      where("from", "==", uid),
      where("to", "==", userId)
    );
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        await deleteDoc(docSnapshot.ref);
        alert("Friend request rejected.");
      } else {
        alert("No friend request found.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

const cancelFriendRequest = async (uid: string) => {
    console.log("Canceling friend request to: " + uid);
    const q = query(
      collection(FIREBASE_DB, "friendRequests"),
      where("from", "==", userId),
      where("to", "==", uid)
    );
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnapshot = querySnapshot.docs[0];
        console.log(docSnapshot.ref);
        await deleteDoc(docSnapshot.ref);
        alert("Friend request canceled.");
      } else {
        alert("No friend request found.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  useEffect(() => { 
    if(visible) {
        fetchPendingInvites();
        fetchPendingRequests();
    }
    }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        className={`flex-1 justify-center items-center bg-gray-800 bg-opacity-50`}
      >
        <View className={`p-4 rounded-lg w-11/12 bg-white`}>
          <Text className={`text-lg font-bold mb-4 text-black`}>
            Add Contacts
          </Text>

          <View className="flex-row justify-around mb-4">
            <TouchableOpacity onPress={() => setActiveTab("addFriend")}>
              <Text
                className={`text-base font-semibold ${
                  activeTab === "addFriend" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Add Friend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab("pendingRequests")}>
              <Text
                className={`text-base font-semibold ${
                  activeTab === "pendingRequests"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                Pending Requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab("pendingInvites")}>
              <Text
                className={`text-base font-semibold ${
                  activeTab === "pendingInvites"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                Pending Invites
              </Text>
            </TouchableOpacity>

          </View>

          <View className="p-6">
            {activeTab === "addFriend" && (
              <View className="mb-4">
                <Text className={`text-base font-semibold mb-2 text-black`}>
                  Add Friend
                </Text>
                <TextInput
                  className={`border p-2 rounded border-gray-300 bg-white text-black`}
                  placeholder="Search for a user"
                  placeholderTextColor="darkgray"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                  onPress={handleSearch}
                  className="mt-2 bg-blue-500 p-2 rounded"
                >
                  <Text className="text-white text-center">Search</Text>
                </TouchableOpacity>
                {searchResult && (
                  <View className="mt-4">
                    <Text className="text-black">{searchResult}</Text>
                    <Button title="Add Friend" onPress={handleAddFriend} />
                  </View>
                )}
              </View>
            )}

{activeTab === "pendingRequests" && (
              <View className="mb-4">
                <Text className={`text-base font-semibold mb-2 text-black`}>
                  Pending Requests
                </Text>
                <FlatList
                  data={pendingRequests}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View>
                        <Text className={`p-2 border-b border-gray-300 text-black`}>
                            {item.displayName}
                        </Text>
                        <View className="flex-row justify-around">
                        <Button title="Accept" onPress={() => acceptFriendRequest(item.uid)} />
                        <Button title="Reject" onPress={() => rejectFriendInvite(item.uid)} />

                        </View>
                    </View>

                  )}
                />
              </View>
            )}

            {activeTab === "pendingInvites" && (
              <View className="mb-4">
                <Text className={`text-base font-semibold mb-2 'text-black'`}>
                  Pending Invites
                </Text>
                <FlatList
                  data={pendingInvites}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View className="grid">
                      <Text className={`p-2 border-b border-gray-300 text-black`}>
                        {item.displayName}
                      </Text>
                      <TouchableOpacity className="bg-slate-500" onPress={() => cancelFriendRequest(item.uid)} >
                        <Text className="text-red-500 text-center justify-end">Cancel</Text>
                        </TouchableOpacity>
                    
                    </View>
                  )}
                />
              </View>
            )}
          </View>

          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

export default addFriendModal;
