import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
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

  // Listen to messages in the active room
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(loaded);
      setRoomMessagesCount((prev) => ({
        ...prev,
        [roomId]: loaded.length,
      }));
    });

    return () => unsubscribe();
  }, [roomId]);

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
    navigate(`/chat/${encodeURIComponent(newRoom)}`);
  };

  const handleCreateRoom = (newRoomName) => {
    if (!rooms.includes(newRoomName)) {
      setRooms((prev) => [...prev, newRoomName]);
    }
    navigate(`/chat/${encodeURIComponent(newRoomName)}`);
  };

  const handleSendMessage = async ({ text, imageUrl }) => {
    if (!currentUser || (!text && !imageUrl)) return;

    try {
      setSending(true);
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: text || "",
        imageUrl: imageUrl || null,
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
        />

        <MessageList
          messages={messages}
          onDelete={handleDeleteMessage}
          onReact={handleReactMessage}
        />

        <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
      </Box>
    </Box>
  );
}
