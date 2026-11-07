import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Chat/Sidebar";
import ChatHeader from "../components/Chat/ChatHeader";
import MessageList from "../components/Chat/MessageList";
import MessageInput from "../components/Chat/MessageInput";
import LoadingScreen from "../components/Common/LoadingScreen";
import { playNotificationSound } from "../utils/sound";

const DEFAULT_ROOMS = [
  "Général",
  "Programmation",
  "IA",
  "Développement Web",
  "Sécurité",
  "Cloud Computing",
];

const DRAWER_WIDTH = 300;

export default function ChatPage() {
  const { roomId: rawRoomId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const roomId = decodeURIComponent(rawRoomId || "Général");
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [messages, setMessages] = useState([]);
  const [roomMessagesCount, setRoomMessagesCount] = useState({});
  const [newMessageRooms, setNewMessageRooms] = useState(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [firestoreError, setFirestoreError] = useState(null);

  const isInitialLoadRef = useRef(true);
  const previousMessagesCountRef = useRef(0);

  // Listen to messages in the active room
  useEffect(() => {
    if (!roomId) return;
    isInitialLoadRef.current = true;
    setFirestoreError(null);

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Play soft chime if a new message arrives from another user
        if (
          !isInitialLoadRef.current &&
          loaded.length > previousMessagesCountRef.current
        ) {
          const latest = loaded[loaded.length - 1];
          if (
            latest &&
            latest.userId !== currentUser?.uid &&
            latest.user !== currentUser?.displayName
          ) {
            playNotificationSound();
          }
        }

        isInitialLoadRef.current = false;
        previousMessagesCountRef.current = loaded.length;

        setMessages(loaded);
        setRoomMessagesCount((prev) => ({
          ...prev,
          [roomId]: loaded.length,
        }));
      },
      (error) => {
        console.error("Erreur Firestore onSnapshot:", error);
        if (error.code === "permission-denied") {
          setFirestoreError(
            "La base de données Cloud Firestore n'est pas encore activée ou ses règles de sécurité bloquent l'accès. Activez-la dans la console Firebase pour synchroniser les messages entre fenêtres."
          );
        } else {
          setFirestoreError(error.message);
        }
      }
    );

    return () => unsubscribe();
  }, [roomId, currentUser]);

  // Track room message counts & notifications
  useEffect(() => {
    const unsubscribes = rooms.map((room) => {
      const q = query(
        collection(db, "rooms", room, "messages"),
        orderBy("timestamp", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        setRoomMessagesCount((prev) => ({
          ...prev,
          [room]: snapshot.size,
        }));
      });
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [rooms]);

  // Clear unread badge when viewing room
  useEffect(() => {
    if (newMessageRooms.has(roomId)) {
      setNewMessageRooms((prev) => {
        const next = new Set(prev);
        next.delete(roomId);
        return next;
      });
    }
  }, [roomId, newMessageRooms]);

  const handleSelectRoom = (newRoom) => {
    setSearchQuery("");
    navigate(`/chat/${encodeURIComponent(newRoom)}`);
  };

  const handleCreateRoom = (newRoomName) => {
    if (!rooms.includes(newRoomName)) {
      setRooms((prev) => [...prev, newRoomName]);
    }
    setSearchQuery("");
    navigate(`/chat/${encodeURIComponent(newRoomName)}`);
  };

  const handleSendMessage = async ({ text, imageUrl, audioUrl }) => {
    if (!currentUser || (!text && !imageUrl && !audioUrl)) return;

    try {
      setSending(true);
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: text || "",
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        user: currentUser.displayName || "Utilisateur",
        userId: currentUser.uid,
        avatar: currentUser.photoURL || "",
        timestamp: new Date(),
        serverTime: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await deleteDoc(doc(db, "rooms", roomId, "messages", msgId));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleReactMessage = async (msgId, emoji) => {
    if (!currentUser) return;
    try {
      const msgRef = doc(db, "rooms", roomId, "messages", msgId);
      const userKey = currentUser.displayName || currentUser.uid;
      await updateDoc(msgRef, {
        [`reactions.${userKey}`]: emoji,
      });
    } catch (error) {
      console.error("Erreur lors de la réaction:", error);
    }
  };

  // Filter messages by search query
  const displayedMessages = searchQuery.trim()
    ? messages.filter(
        (m) =>
          (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (m.user && m.user.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : messages;

  if (loading) {
    return <LoadingScreen message="Connexion à vos salons..." />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* WhatsApp Sidebar */}
      <Sidebar
        rooms={rooms}
        currentRoomId={roomId}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={handleCreateRoom}
        roomMessages={roomMessagesCount}
        newMessageRooms={newMessageRooms}
        mobileOpen={mobileOpen}
        onCloseMobileDrawer={() => setMobileOpen(false)}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main Chat Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          overflow: "hidden",
        }}
      >
        <ChatHeader
          roomId={roomId}
          messageCount={messages.length}
          onOpenMobileDrawer={() => setMobileOpen(true)}
          drawerWidth={DRAWER_WIDTH}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {firestoreError && (
          <Alert severity="warning" sx={{ m: 1, borderRadius: 2 }}>
            {firestoreError}
          </Alert>
        )}

        <MessageList
          messages={displayedMessages}
          onDelete={handleDeleteMessage}
          onReact={handleReactMessage}
          isSearching={Boolean(searchQuery.trim())}
        />

        <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
      </Box>
    </Box>
  );
}
