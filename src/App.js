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
  where,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  useMediaQuery,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  Alert,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Send as SendIcon,
  EmojiEmotions,
} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import { grey } from "@mui/material/colors";


const firebaseConfig = {
  apiKey: "AIzaSyBDQzO-dvX4WGdA-PnNjtp5fzA9c731WeM",
  authDomain: "chatbot01-150a9.firebaseapp.com",
  projectId: "chatbot01-150a9",
  storageBucket: "chatbot01-150a9.firebasestorage.app",
  messagingSenderId: "483828302225",
  appId: "1:483828302225:web:256b81e69cd954caf31a30"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const drawerWidth = 240;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? grey[900] : grey[100],
        paper: darkMode ? grey[800] : grey[50],
      },
      primary: {
        main: "#f9b613",
        contrastText: "#000000",
      },
    },
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
        <Router>
          <Routes>
            <Route path="/" element={<ProfileSetup />} />
            <Route
              path="/chat/:roomId/*"
              element={<ChatWithRooms toggleDarkMode={toggleDarkMode} darkMode={darkMode} />}
            />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

function ProfileSetup() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
  ];

  const handleAuth = async () => {
    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, `${username}@chat.com`, password);
        navigate(`/chat/Général`);
      } else {
        if (!selectedAvatar) {
          setError("Veuillez sélectionner un avatar");
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          `${username}@chat.com`,
          password
        );
        await updateProfile(userCredential.user, {
          displayName: username,
          photoURL: selectedAvatar,
        });
        navigate(`/chat/Général`);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        maxWidth: 400,
        margin: "auto",
        backgroundColor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
        mt: 4,
      }}
    >
      <Typography variant="h4" gutterBottom>
        {isLogin ? "Se connecter" : "Registe"}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ marginBottom: 2, width: "100%" }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: 2, width: "100%" }}
      />
      {!isLogin && (
        <>
          <Typography variant="h6" gutterBottom>
            Choose an avatar:
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
                  border: selectedAvatar === url ? "3px solid #f9b613" : "3px solid transparent",
                  cursor: "pointer",
                  margin: 1,
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
                onClick={() => setSelectedAvatar(url)}
              />
            ))}
          </Box>
        </>
      )}
      <Button
        variant="contained"
        onClick={handleAuth}
        sx={{ width: "100%", mt: 2 }}
      >
        {isLogin ? "Se connecter" : "Registre"}
      </Button>
      <Button
        variant="text"
        onClick={() => setIsLogin(!isLogin)}
        sx={{ mt: 2 }}
      >
        {isLogin ? "Besoin d'un compte ? Registre" : "Vous avez déjà un compte ? Se connecter"}
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
  const [newMessageRooms, setNewMessageRooms] = useState(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { roomId } = useParams();

  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser({
      displayName: user?.displayName || "User",
      photoURL: user?.photoURL || "",
    });

    rooms.forEach((room) => {
      const q = query(
        collection(db, "rooms", room, "messages"),
        orderBy("timestamp", "desc"),
        where("timestamp", ">", new Date(Date.now() - 1000))
      );
      
      onSnapshot(q, (snapshot) => {
        if (snapshot.docs.length > 0 && room !== roomId) {
          setNewMessageRooms(prev => new Set([...prev, room]));
        }
        setRoomMessages(prev => ({
          ...prev,
          [room]: snapshot.size,
        }));
      });
    });
  }, [roomId]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleRoomClick = (room) => {
    setNewMessageRooms(prev => {
      const updated = new Set(prev);
      updated.delete(room);
      return updated;
    });
    navigate(`/chat/${room}`);
    if (isMobile) handleDrawerToggle();
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Avatar src={currentUser?.photoURL} sx={{ marginRight: 1 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">{currentUser?.displayName}</Typography>
          <Typography variant="body2" color="text.secondary">
            Online
          </Typography>
        </Box>
      </Box>
      <List sx={{ flexGrow: 1, overflow: "auto" }}>
        {rooms.map((room) => (
          <ListItem
            key={room}
            disablePadding
            onClick={() => handleRoomClick(room)}
          >
            <Button
              fullWidth
              sx={{
                justifyContent: "flex-start",
                px: 3,
                py: 1.5,
                borderRadius: 0,
                backgroundColor: room === roomId ? "action.selected" : 
                  newMessageRooms.has(room) ? "primary.main" : "transparent",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                borderLeft: room === roomId ? 4 : 0,
                borderColor: "primary.main",
                animation: newMessageRooms.has(room) ? "pulse 2s infinite" : "none",
                "@keyframes pulse": {
                  "0%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.7,
                  },
                  "100%": {
                    opacity: 1,
                  },
                },
              }}
            >
              <Typography variant="body1">{room}</Typography>
              <Typography
                variant="caption"
                sx={{ ml: "auto", color: "text.secondary" }}
              >
                {roomMessages[room] || 0}
              </Typography>
            </Button>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {roomId}
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="*" element={<ChatRoom />} />
        </Routes>
      </Box>
    </Box>
  );
}

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
        console.error("Error sending message:", error);
      }
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "background.paper",
      }}
    >
      <List
        sx={{
          flexGrow: 1,
          overflow: "auto",
          padding: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((msg) => (
          <ListItem
            key={msg.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.user === auth.currentUser?.displayName ? "flex-end" : "flex-start",
              padding: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: msg.user === auth.currentUser?.displayName ? "row-reverse" : "row",
                alignItems: "flex-start",
                maxWidth: "80%",
              }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Avatar src={msg.avatar} sx={{ width: 32, height: 32 }} />
              </ListItemAvatar>
              <Box
                sx={{
                  backgroundColor: msg.user === auth.currentUser?.displayName
                    ? "primary.main"
                    : "action.hover",
                  color: "text.primary",
                  borderRadius: 2,
                  padding: 1,
                  maxWidth: "100%",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {msg.user}
                </Typography>
                <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                  {msg.text}
                </Typography>
              </Box>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <Box
        sx={{
          p: 2,
          backgroundColor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          position: "relative",
        }}
      >
        {emojiPickerVisible && (
          <ClickAwayListener onClickAway={() => setEmojiPickerVisible(false)}>
            <Box
              sx={{
                position: "absolute",
                bottom: "80px",
                right: isMobile ? "50%" : "20px",
                transform: isMobile ? "translateX(50%)" : "none",
                zIndex: 1000,
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </Box>
          </ClickAwayListener>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            multiline
            maxRows={4}
            size="small"
          />
          <IconButton
            color="primary"
            onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
          >
            <EmojiEmotions />
          </IconButton>
          <IconButton color="primary" onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default App;

