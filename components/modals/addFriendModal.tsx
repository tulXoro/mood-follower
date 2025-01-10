import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
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

interface Friend {
  uid: string;
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
    const friendPhrase = await AsyncStorage.getItem("friendPhrase");

    if (friendPhrase === searchTerm) {
      alert("You cannot add yourself as a friend.");
      return;
    }

    if(searchTerm.length < 5) {
      alert("Please enter a valid friend phrase.");
      return;
    }

    const q = query(
      collection(FIREBASE_DB, "users"),
      where("friendPhrase", "==", searchTerm)
    );
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
      alert("Error in searching for a user: " + e.message);
    }
  };

  const handleInviteFriend = async () => {
    if (searchResultUID) {
      const docId1 = `${userId}_${searchResultUID}`;
      const docId2 = `${searchResultUID}_${userId}`;

      const docRef1 = doc(FIREBASE_DB, "friendRequests", docId1);
      const docRef2 = doc(FIREBASE_DB, "friendRequests", docId2);

      try {
        const docSnap1 = await getDoc(docRef1);
        const docSnap2 = await getDoc(docRef2);

        if (docSnap1.exists() || docSnap2.exists()) {
          alert("Friend request already exists between users!");
          return;
        } else {
          // Proceed with sending the friend request
          const displayName = await AsyncStorage.getItem("displayName");
          const userRef = doc(FIREBASE_DB, "friendRequests", docId1); // Use docId1 as the document ID
          await setDoc(userRef, {
            from: displayName,
            to: searchResult,
          });

          alert("Friend request sent!");
          if (searchResult) {
            setPendingInvites([
              ...pendingInvites,
              { uid: searchResultUID, displayName: searchResult },
            ]);
          }
          setSearchResult(null);
          setSearchResultUID(null);
        }
      } catch (e: any) {
        alert("Error: " + e.message);
      }
    }
  };

  const fetchPendingInvites = async () => {
    const q = query(collection(FIREBASE_DB, "friendRequests"));
    try {
      const querySnapshot = await getDocs(q);
      const requests: FriendRequest[] = [];
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const [fromUid, toUid] = docId.split("_");
        if (fromUid === userId) {
          let friend: FriendRequest = {
            uid: toUid,
            displayName: doc.data().to,
          };
          requests.push(friend);
        }
      });
      setPendingInvites(requests);
    } catch (e: any) {
      alert("Error fetching invites: " + e.message);
    }
  };

  const fetchPendingRequests = async () => {
    const q = query(collection(FIREBASE_DB, "friendRequests"));
    try {
      const querySnapshot = await getDocs(q);
      const invites: FriendRequest[] = [];
      querySnapshot.forEach((doc) => {
        const docId = doc.id;
        const [fromUid, toUid] = docId.split("_");
        if (toUid === userId) {
          let friend: FriendRequest = {
            uid: fromUid,
            displayName: doc.data().from,
          };
          invites.push(friend);
        }
      });
      setPendingRequests(invites);
    } catch (e: any) {
      alert("Error fetching requests: " + e.message);
    }
  };

  const acceptFriendRequest = async (uid: string) => {
    const docId1 = `${uid}_${userId}`;
    const docRef1 = doc(FIREBASE_DB, "friendRequests", docId1);

    try {
      const docSnap1 = await getDoc(docRef1);

      if (docSnap1.exists()) {
        // Update the friends field for both users
        if (userId) {
          const userRef = doc(FIREBASE_DB, "users", userId);
          const friendRef = doc(FIREBASE_DB, "users", uid);

          await updateDoc(userRef, {
            friends: arrayUnion(uid),
          });

          await updateDoc(friendRef, {
            friends: arrayUnion(userId),
          });

          // Delete the friend request document
          await deleteDoc(docRef1);

          alert("Friend added!");
          setPendingRequests(
            pendingRequests.filter((item) => item.uid !== uid)
          );
          const friends = await AsyncStorage.getItem("friendUIDs");
          if (friends) {
            await AsyncStorage.setItem(
              "friendUIDs",
              JSON.stringify([...JSON.parse(friends), uid])
            );
          } else {
            const docSnap2 = await getDoc(friendRef);

            const friend: Friend = {
              uid: uid,
            };
            await AsyncStorage.setItem("friendUIDs", JSON.stringify([friend]));
          }
        } else {
          alert("User ID is undefined.");
        }
      } else {
        alert("No friend request found.");
      }
    } catch (e: any) {
      alert("Error accepting friend: " + e.message);
    }
  };

  const rejectFriendInvite = async (uid: string) => {
    const docId1 = `${uid}_${userId}`;
    const docRef1 = doc(FIREBASE_DB, "friendRequests", docId1);

    try {
      const docSnap1 = await getDoc(docRef1);

      if (docSnap1.exists()) {
        await deleteDoc(docRef1);
        alert("Friend request rejected.");
        setPendingInvites(pendingInvites.filter((item) => item.uid !== uid));
      } else {
        alert("No friend request found.");
      }
    } catch (e: any) {
      alert("Error rejecting friend invite: " + e.message);
    }
  };

  const cancelFriendRequest = async (uid: string) => {
    const docId1 = `${userId}_${uid}`;
    const docRef1 = doc(FIREBASE_DB, "friendRequests", docId1);

    try {
      const docSnap1 = await getDoc(docRef1);

      if (docSnap1.exists()) {
        await deleteDoc(docRef1);
        alert("Friend request canceled.");
        setPendingRequests(pendingRequests.filter((item) => item.uid !== uid));
      } else {
        alert("No friend request found.");
      }
    } catch (e: any) {
      alert("Error cancelling friend request: " + e.message);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchPendingInvites();
      fetchPendingRequests();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className={`flex-1 justify-center items-center bg-gray-800/50`}>
        <View className={`p-4 rounded-lg w-11/12 bg-white dark:bg-zinc-900`}>
          <Text className={`text-lg font-bold mb-4 text-black dark:text-white`}>
            Add Contacts
          </Text>

          <View className="flex-row justify-around mb-4">
            <TouchableOpacity onPress={() => setActiveTab("addFriend")}>
              <Text
                className={`text-base font-semibold ${
                  activeTab === "addFriend"
                    ? "text-blue-500 dark:text-blue-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Add Friend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab("pendingRequests")}>
              <Text
                className={`text-base font-semibold ${
                  activeTab === "pendingRequests"
                    ? "text-blue-500 dark:text-blue-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Pending Requests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setActiveTab("pendingInvites")}>
              <Text
                className={`text-base font-semibold ${
                  activeTab === "pendingInvites"
                    ? "text-blue-500 dark:text-blue-300"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Pending Invites
              </Text>
            </TouchableOpacity>
          </View>

          <View className="p-6">
            {activeTab === "addFriend" && (
              <View className="mb-4">
                <Text
                  className={`text-base font-semibold mb-2 text-black dark:text-white`}
                >
                  Add Friend
                </Text>
                <KeyboardAvoidingView>
                <TextInput
                  className={`border p-2 rounded border-gray-300 bg-white text-black`}
                  placeholder="XXXX-XXXX-XXXX"
                  placeholderTextColor="darkgray"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={handleSearch}
                />
                </KeyboardAvoidingView>

                <TouchableOpacity
                  onPress={handleSearch}
                  className="mt-2 bg-blue-500 p-2 rounded"
                >
                  <Text className="text-white text-center">Search</Text>
                </TouchableOpacity>
                {searchResult && (
                  <View className="mt-4 bg-slate-400 p-3 gap-2 dark:bg-blue-900">
                    <Text className="text-black">{searchResult}</Text>
                    <Button title="Add Friend" onPress={handleInviteFriend} />
                  </View>
                )}
              </View>
            )}

            {activeTab === "pendingRequests" && (
              <View className="mb-4">
                <Text
                  className={`text-base font-semibold mb-2 text-black dark:text-white`}
                >
                  Pending Requests
                </Text>
                {pendingRequests.length > 0 ? (
                  <FlatList
                    data={pendingRequests}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View className="bg-slate-400 p-3 gap-2 dark:bg-blue-900">
                        <Text
                          className={`p-2 border-b border-gray-300 text-black dark:text-white`}
                        >
                          {item.displayName}
                        </Text>
                        <View className="flex-row justify-around ">
                          <Button
                            title="Accept"
                            onPress={() => acceptFriendRequest(item.uid)}
                          />
                          <Button
                            title="Reject"
                            onPress={() => rejectFriendInvite(item.uid)}
                          />
                        </View>
                      </View>
                    )}
                  />
                ) : (
                  <Text className="text-black dark:text-white">No pending requests.</Text>
                )}
              </View>
            )}

            {activeTab === "pendingInvites" && (
              <View className="mb-4">
                <Text
                  className={`text-base font-semibold mb-2 text-black dark:text-white`}
                >
                  Pending Invites
                </Text>
                {
                  pendingInvites.length > 0 ? (
                    <FlatList
                    data={pendingInvites}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View className="grid bg-slate-400 p-3 gap-2 dark:bg-blue-900">
                        <Text
                          className={`p-2 border-b border-gray-300 text-black dark:text-white`}
                        >
                          {item.displayName}
                        </Text>
                        <TouchableOpacity
                          className="bg-slate-500 dark:bg-slate-200"
                          onPress={() => cancelFriendRequest(item.uid)}
                        >
                          <Text className="text-red-500 text-center justify-end">
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />) : (
                    <Text className="text-black dark:text-white">No pending invites.</Text>
                  )
                }
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
