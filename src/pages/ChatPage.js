import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import {
  collection,
  addDoc,
  setDoc,
  deleteField,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
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
import {
  getPrivateChatId,
  getOtherParticipantUid,
  isValidPrivateChatIdForUser,
} from "../utils/privateChat";

const DEFAULT_ROOMS = [
  "Général",
  "Programmation",
  "IA",
  "Développement Web",
  "Sécurité",
  "Cloud Computing",
];

const DRAWER_WIDTH = 300;

const CUSTOM_ROOMS_STORAGE_KEY = "chatapp_custom_rooms";

function loadInitialRooms(activeRoomId) {
  let customRooms = [];
  try {
    const saved = localStorage.getItem(CUSTOM_ROOMS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        customRooms = parsed.filter((r) => typeof r === "string" && r.trim());
      }
    }
  } catch (e) {
    // Ignore invalid localStorage payload
  }
  const merged = [...DEFAULT_ROOMS];
  for (const r of customRooms) {
    if (!merged.includes(r)) merged.push(r);
  }
  if (activeRoomId && !merged.includes(activeRoomId)) {
    merged.push(activeRoomId);
  }
  return merged;
}

export default function ChatPage({ isPrivateMode = false }) {
  const { roomId: rawRoomId, chatId: rawChatId } = useParams();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const roomId = isPrivateMode ? "" : decodeURIComponent(rawRoomId || "Général");
  const chatId = isPrivateMode ? decodeURIComponent(rawChatId || "") : "";
  const [rooms, setRooms] = useState(() => loadInitialRooms(roomId));
  const [messages, setMessages] = useState([]);
  const [roomMessagesCount, setRoomMessagesCount] = useState({});
  const [newMessageRooms, setNewMessageRooms] = useState(new Set());
  const [availableUsers, setAvailableUsers] = useState([]);
  const [rawPrivateChats, setRawPrivateChats] = useState([]);
  const [newPrivateChatIds, setNewPrivateChatIds] = useState(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [firestoreError, setFirestoreError] = useState(null);

  const isInitialLoadRef = useRef(true);
  const previousMessagesCountRef = useRef(0);
  const roomInitialCountsRef = useRef({});
  const privateInitialUpdatesRef = useRef(null);
  const activeRoomRef = useRef(roomId);
  const activePrivateChatRef = useRef(chatId);
  activeRoomRef.current = roomId;
  activePrivateChatRef.current = chatId;

  const isAuthorizedPrivateChat =
    !isPrivateMode || !currentUser || isValidPrivateChatIdForUser(chatId, currentUser.uid);

  // Ensure URL-navigated custom rooms appear in the sidebar and are saved
  useEffect(() => {
    if (isPrivateMode || !roomId) return;
    setRooms((prev) => {
      if (prev.includes(roomId)) return prev;
      const next = [...prev, roomId];
      try {
        const customOnly = next.filter((r) => !DEFAULT_ROOMS.includes(r));
        localStorage.setItem(CUSTOM_ROOMS_STORAGE_KEY, JSON.stringify(customOnly));
      } catch (e) {
        // Ignore storage quota errors
      }
      return next;
    });
  }, [roomId, isPrivateMode]);

  // Listen to directory of users for private chats
  useEffect(() => {
    if (loading || !currentUser) return;

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const list = snapshot.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== currentUser.uid)
          .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));
        setAvailableUsers(list);
      },
      (error) => {
        console.warn("Erreur chargement utilisateurs:", error.code);
      }
    );

    return () => unsubscribe();
  }, [currentUser, loading]);

  // Listen to user's private chats list & unread state
  useEffect(() => {
    if (loading || !currentUser) return;

    privateInitialUpdatesRef.current = null;
    const q = query(
      collection(db, "privateChats"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        const nextTimestamps = {};

        for (const chat of loaded) {
          const updatedMs = chat.updatedAt?.toMillis
            ? chat.updatedAt.toMillis()
            : chat.updatedAt instanceof Date
            ? chat.updatedAt.getTime()
            : 0;
          nextTimestamps[chat.id] = updatedMs;

          if (privateInitialUpdatesRef.current !== null) {
            const prevMs = privateInitialUpdatesRef.current[chat.id] ?? -1;
            if (
              updatedMs > prevMs &&
              chat.id !== activePrivateChatRef.current &&
              chat.lastSenderId &&
              chat.lastSenderId !== currentUser.uid
            ) {
              setNewPrivateChatIds((prev) => {
                if (prev.has(chat.id)) return prev;
                const next = new Set(prev);
                next.add(chat.id);
                return next;
              });
              playNotificationSound();
            }
          }
        }

        privateInitialUpdatesRef.current = nextTimestamps;
        setRawPrivateChats(loaded);
      },
      (error) => {
        console.warn("Erreur chargement discussions privées:", error.code);
      }
    );

    return () => unsubscribe();
  }, [currentUser, loading]);

  // Listen to messages in the active room or private chat
  useEffect(() => {
    if (loading || !currentUser) return;
    if (isPrivateMode && !chatId) return;
    if (!isPrivateMode && !roomId) return;

    if (isPrivateMode && !isValidPrivateChatIdForUser(chatId, currentUser.uid)) {
      setMessages([]);
      setFirestoreError("Vous n'avez pas accès à cette discussion privée.");
      return;
    }

    isInitialLoadRef.current = true;
    setFirestoreError(null);

    const messagesCol = isPrivateMode
      ? collection(db, "privateChats", chatId, "messages")
      : collection(db, "rooms", roomId, "messages");

    const q = query(messagesCol, orderBy("timestamp", "asc"));

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
          if (latest && latest.userId !== currentUser?.uid) {
            playNotificationSound();
          }
        }

        isInitialLoadRef.current = false;
        previousMessagesCountRef.current = loaded.length;

        setMessages(loaded);
        if (!isPrivateMode) {
          setRoomMessagesCount((prev) => ({
            ...prev,
            [roomId]: loaded.length,
          }));
        }
      },
      (error) => {
        console.error("Erreur Firestore onSnapshot:", error);
        if (error.code === "permission-denied") {
          setFirestoreError(
            "Accès Firestore refusé (permission-denied). Vérifiez que les règles de firestore.rules sont bien déployées dans Firebase Console > Firestore Database > Règles."
          );
        } else {
          setFirestoreError(error.message);
        }
      }
    );

    return () => unsubscribe();
  }, [roomId, chatId, isPrivateMode, currentUser, loading]);

  // Track room message counts & notifications
  useEffect(() => {
    if (loading || !currentUser) return;

    const unsubscribes = rooms.map((room) => {
      const q = query(
        collection(db, "rooms", room, "messages"),
        orderBy("timestamp", "desc")
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const nextSize = snapshot.size;
          const prevSize = roomInitialCountsRef.current[room];

          if (
            prevSize !== undefined &&
            nextSize > prevSize &&
            room !== activeRoomRef.current
          ) {
            const latestDoc = snapshot.docs[0]?.data();
            if (!latestDoc || latestDoc.userId !== currentUser.uid) {
              setNewMessageRooms((prev) => {
                if (prev.has(room)) return prev;
                const next = new Set(prev);
                next.add(room);
                return next;
              });
            }
          }

          roomInitialCountsRef.current[room] = nextSize;
          setRoomMessagesCount((prev) => ({
            ...prev,
            [room]: nextSize,
          }));
        },
        (error) => {
          console.warn(`Erreur snapshot pour le salon ${room}:`, error.code);
        }
      );
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [rooms, currentUser, loading]);

  // Clear unread badge when viewing room or private chat
  useEffect(() => {
    if (!isPrivateMode && roomId && newMessageRooms.has(roomId)) {
      setNewMessageRooms((prev) => {
        const next = new Set(prev);
        next.delete(roomId);
        return next;
      });
    }
    if (isPrivateMode && chatId && newPrivateChatIds.has(chatId)) {
      setNewPrivateChatIds((prev) => {
        const next = new Set(prev);
        next.delete(chatId);
        return next;
      });
    }
  }, [roomId, chatId, isPrivateMode, newMessageRooms, newPrivateChatIds]);

  const usersById = useMemo(() => {
    const map = {};
    for (const u of availableUsers) {
      map[u.uid] = u;
    }
    return map;
  }, [availableUsers]);

  const privateChats = useMemo(() => {
    if (!currentUser) return [];
    return rawPrivateChats
      .map((chat) => {
        const peerUid = getOtherParticipantUid(chat.id, currentUser.uid);
        const livePeer = usersById[peerUid];
        const fallbackPeer = chat.participantInfo?.[peerUid];
        const updatedMs = chat.updatedAt?.toMillis
          ? chat.updatedAt.toMillis()
          : chat.updatedAt instanceof Date
          ? chat.updatedAt.getTime()
          : 0;
        return {
          ...chat,
          peerUid,
          peerName: livePeer?.displayName || fallbackPeer?.displayName || "Utilisateur",
          peerAvatar: livePeer?.photoURL || fallbackPeer?.photoURL || "",
          updatedMs,
        };
      })
      .sort((a, b) => b.updatedMs - a.updatedMs);
  }, [rawPrivateChats, usersById, currentUser]);

  const activePeerUser = useMemo(() => {
    if (!isPrivateMode || !currentUser || !chatId) return null;
    const peerUid = getOtherParticipantUid(chatId, currentUser.uid);
    if (!peerUid) return null;
    const livePeer = usersById[peerUid];
    const activeChat = privateChats.find((c) => c.id === chatId);
    return {
      uid: peerUid,
      displayName: livePeer?.displayName || activeChat?.peerName || "Discussion privée",
      photoURL: livePeer?.photoURL || activeChat?.peerAvatar || "",
    };
  }, [isPrivateMode, currentUser, chatId, usersById, privateChats]);

  const handleSelectRoom = (newRoom) => {
    setSearchQuery("");
    navigate(`/chat/${encodeURIComponent(newRoom)}`);
  };

  const handleSelectPrivateChat = (targetChatId) => {
    setSearchQuery("");
    navigate(`/dm/${encodeURIComponent(targetChatId)}`);
  };

  const handleStartPrivateChatWithUser = async (targetUser) => {
    if (!currentUser || !targetUser?.uid || targetUser.uid === currentUser.uid) return;
    const targetChatId = getPrivateChatId(currentUser.uid, targetUser.uid);
    if (!targetChatId) return;

    try {
      await setDoc(
        doc(db, "privateChats", targetChatId),
        {
          participants: [currentUser.uid, targetUser.uid].sort(),
          participantInfo: {
            [currentUser.uid]: {
              displayName: currentUser.displayName || "Utilisateur",
              photoURL: currentUser.photoURL || "",
            },
            [targetUser.uid]: {
              displayName: targetUser.displayName || "Utilisateur",
              photoURL: targetUser.photoURL || "",
            },
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn("Impossible d'initialiser la discussion privée:", error.code || error.message);
    }

    setSearchQuery("");
    navigate(`/dm/${encodeURIComponent(targetChatId)}`);
  };

  const handleCreateRoom = (newRoomName) => {
    const trimmed = newRoomName.trim();
    if (!trimmed) return;
    if (!rooms.includes(trimmed)) {
      const next = [...rooms, trimmed];
      setRooms(next);
      try {
        const customOnly = next.filter((r) => !DEFAULT_ROOMS.includes(r));
        localStorage.setItem(CUSTOM_ROOMS_STORAGE_KEY, JSON.stringify(customOnly));
      } catch (e) {
        // Ignore storage quota errors
      }
    }
    setSearchQuery("");
    navigate(`/chat/${encodeURIComponent(trimmed)}`);
  };

  const handleSendMessage = async ({ text, imageUrl, audioUrl }) => {
    if (!currentUser || (!text && !imageUrl && !audioUrl)) return;
    if (isPrivateMode && !isAuthorizedPrivateChat) return;

    try {
      setSending(true);
      const messagesCol = isPrivateMode
        ? collection(db, "privateChats", chatId, "messages")
        : collection(db, "rooms", roomId, "messages");

      await addDoc(messagesCol, {
        text: text || "",
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        user: currentUser.displayName || "Utilisateur",
        userId: currentUser.uid,
        avatar: currentUser.photoURL || "",
        timestamp: new Date(),
        serverTime: serverTimestamp(),
      });

      if (isPrivateMode && activePeerUser?.uid) {
        const preview = text
          ? text.slice(0, 80)
          : imageUrl
          ? "📷 Photo"
          : "🎤 Note vocale";
        await setDoc(
          doc(db, "privateChats", chatId),
          {
            participants: [currentUser.uid, activePeerUser.uid].sort(),
            participantInfo: {
              [currentUser.uid]: {
                displayName: currentUser.displayName || "Utilisateur",
                photoURL: currentUser.photoURL || "",
              },
              [activePeerUser.uid]: {
                displayName: activePeerUser.displayName || "Utilisateur",
                photoURL: activePeerUser.photoURL || "",
              },
            },
            lastMessage: preview,
            lastSenderId: currentUser.uid,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      if (error.code === "permission-denied") {
        setFirestoreError(
          "Impossible d'envoyer le message : permission refusée par les règles Firestore."
        );
      } else {
        setFirestoreError("Erreur lors de l'envoi : " + error.message);
      }
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!currentUser || !msgId) return;
    if (isPrivateMode && !isAuthorizedPrivateChat) return;

    try {
      const msgRef = isPrivateMode
        ? doc(db, "privateChats", chatId, "messages", msgId)
        : doc(db, "rooms", roomId, "messages", msgId);

      await updateDoc(msgRef, {
        text: deleteField(),
        imageUrl: deleteField(),
        audioUrl: deleteField(),
        reactions: deleteField(),
        deleted: true,
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setFirestoreError("Impossible de supprimer le message : " + error.message);
    }
  };

  const handleReactMessage = async (msgId, emoji) => {
    if (!currentUser) return;
    if (isPrivateMode && !isAuthorizedPrivateChat) return;

    try {
      const msgRef = isPrivateMode
        ? doc(db, "privateChats", chatId, "messages", msgId)
        : doc(db, "rooms", roomId, "messages", msgId);

      await updateDoc(msgRef, {
        [`reactions.${currentUser.uid}`]: emoji,
      });
    } catch (error) {
      console.error("Erreur lors de la réaction:", error);
      setFirestoreError("Impossible d'ajouter la réaction : " + error.message);
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
        isPrivateMode={isPrivateMode}
        currentPrivateChatId={chatId}
        privateChats={privateChats}
        newPrivateChatIds={newPrivateChatIds}
        availableUsers={availableUsers}
        onSelectRoom={handleSelectRoom}
        onSelectPrivateChat={handleSelectPrivateChat}
        onStartPrivateChatWithUser={handleStartPrivateChatWithUser}
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
          isPrivate={isPrivateMode}
          peerUser={activePeerUser}
          messageCount={messages.length}
          onOpenMobileDrawer={() => setMobileOpen(true)}
          drawerWidth={DRAWER_WIDTH}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {firestoreError && (
          <Alert
            severity="warning"
            onClose={() => setFirestoreError(null)}
            sx={{ m: 1, borderRadius: 2 }}
          >
            {firestoreError}
          </Alert>
        )}

        <MessageList
          messages={displayedMessages}
          onDelete={handleDeleteMessage}
          onReact={handleReactMessage}
          isSearching={Boolean(searchQuery.trim())}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={sending || !isAuthorizedPrivateChat}
        />
      </Box>
    </Box>
  );
}
