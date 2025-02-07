// Import necessary libraries and Firebase SDK
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  Avatar,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Box,
  Typography,
  Fab,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import { grey, blue } from "@mui/material/colors";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBfHNrbuUOJsZhts8P2Z0MUzQ0FkPXb0pk",
  authDomain: "chatbot-93bd7.firebaseapp.com",
  projectId: "chatbot-93bd7",
  storageBucket: "chatbot-93bd7.appspot.com",
  messagingSenderId: "540146161895",
  appId: "1:540146161895:web:f0fdc7c12d093cce976a42",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? grey[900] : grey[100],
      },
      primary: blue,
    },
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<ProfileSetup />} />
          <Route
            path="/chat/:roomId/*"
            element={<ChatWithRooms toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const navigate = useNavigate();

  const avatars = [
    "https://via.placeholder.com/150/FF5733?text=Avatar1",
    "https://via.placeholder.com/150/33FF57?text=Avatar2",
    "https://via.placeholder.com/150/3357FF?text=Avatar3",
    "https://via.placeholder.com/150/57FF33?text=Avatar4",
  ];

  const handleStart = async () => {
    if (username.trim() && selectedAvatar) {
      try {
        const userCredential = await signInAnonymously(auth);
        await updateProfile(userCredential.user, {
          displayName: username,
          photoURL: selectedAvatar,
        });
        navigate(`/chat/Général`);
      } catch (error) {
        console.error("Erreur lors de la configuration du profil:", error);
      }
    } else {
      alert("Veuillez choisir un pseudo et un avatar.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        maxWidth: "100%",
        margin: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Configurez votre profil
      </Typography>
      <TextField
        label="Pseudo"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ marginBottom: 2, width: "100%" }}
      />
      <Typography variant="h6" gutterBottom>
        Choisissez un avatar :
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
          marginBottom: 2,
        }}
      >
        {avatars.map((url, index) => (
          <Avatar
            key={index}
            src={url}
            sx={{
              width: 60,
              height: 60,
              border:
                selectedAvatar === url
                  ? "3px solid blue"
                  : "3px solid transparent",
              cursor: "pointer",
              margin: 1,
            }}
            onClick={() => setSelectedAvatar(url)}
          />
        ))}
      </Box>
      <Button variant="contained" onClick={handleStart}>
        Commencer
      </Button>
    </Box>
  );
}

function ChatWithRooms({ toggleDarkMode, darkMode }) {
  const rooms = [
    "Général",
    "Programmation",
    "IA",
    "Développement Web",
    "Sécurité",
    "Cloud Computing",
  ];
  const [currentUser, setCurrentUser] = useState(null);
  const [roomMessages, setRoomMessages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser({
      displayName: user?.displayName || "Utilisateur",
      photoURL: user?.photoURL || "",
    });

    rooms.forEach((room) => {
      const q = collection(db, "rooms", room, "messages");
      onSnapshot(q, (snapshot) => {
        setRoomMessages((prev) => ({
          ...prev,
          [room]: snapshot.size,
        }));
      });
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          width: "25%",
          backgroundColor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Avatar src={currentUser?.photoURL} sx={{ marginRight: 1 }} />
          <Box>
            <Typography variant="h6">{currentUser?.displayName}</Typography>
            <Typography variant="body2">En ligne</Typography>
          </Box>
          <Button
            variant="text"
            sx={{ marginLeft: "auto" }}
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </Box>
        <Typography variant="h5" gutterBottom>
          Rooms
        </Typography>
        <List>
          {rooms.map((room, index) => (
            <ListItem
              key={index}
              sx={{
                borderBottom: `3px solid ${
                  room === window.location.pathname.split("/")[2]
                    ? "green"
                    : "transparent"
                }`,
                marginBottom: "10px",
                padding: "10px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/chat/${room}`)}
            >
              <ListItemText
                primary={room}
                secondary={`Messages : ${roomMessages[room] || 0}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Routes>
          <Route path="*" element={<ChatRoom />} />
        </Routes>
      </Box>
      <Fab
        color="primary"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
        onClick={toggleDarkMode}
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </Fab>
    </Box>
  );
}

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await addDoc(collection(db, "rooms", roomId, "messages"), {
          text: newMessage,
          user: auth.currentUser.displayName,
          avatar: auth.currentUser.photoURL,
          timestamp: new Date(),
        });
        setNewMessage("");
        setEmojiPickerVisible(false);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
      }
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h4">{roomId}</Typography>
      <List sx={{ flexGrow: 1, overflowY: "auto", marginBottom: 2 }}>
        {messages.map((msg) => (
          <ListItem key={msg.id}>
            <ListItemAvatar>
              <Avatar src={msg.avatar} />
            </ListItemAvatar>
            <ListItemText primary={msg.user} secondary={msg.text} />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      {emojiPickerVisible && (
        <Box
          sx={{
            position: "absolute",
            bottom: "70px",
            right: "10px",
            zIndex: 1000,
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
        <TextField
          fullWidth
          placeholder="Écrivez un message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          sx={{ marginRight: 1 }}
        />
        <Button onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}>
          Emoji
        </Button>
        <Button variant="contained" onClick={sendMessage}>
          Envoyer
        </Button>
      </Box>
    </Box>
  );
}

export default App;