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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  Image as ImageIcon,
} from "@mui/icons-material";
import EmojiPicker from "emoji-picker-react";
import { grey } from "@mui/material/colors";

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
const storage = getStorage(app);

const drawerWidth = 240;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? grey[900] : grey[100],
        paper: darkMode ? grey[800] : "#fff",
      },
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadRooms();
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const loadRooms = async () => {
    const q = query(collection(db, "rooms"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ p: 2 }}>
      <List>
        {rooms.map((room) => (
          <ListItem
            button
            key={room.id}
            onClick={() => {
              navigate(`/room/${room.id}`);
              if (mobileOpen) handleDrawerToggle();
            }}
          >
            <ListItemText primary={room.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Chat App
            </Typography>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            {user && (
              <Button color="inherit" onClick={() => signOut(auth)}>
                Logout
              </Button>
            )}
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
            p: 0,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Toolbar />
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <Routes>
            <Route path="/login" element={<Login setError={setError} />} />
            <Route path="/signup" element={<SignUp setError={setError} />} />
            <Route path="/room/:roomId" element={<ChatRoom />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

function Login({ setError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
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
        justifyContent: "center",
        height: "100%",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
        <Button
          fullWidth
          onClick={() => navigate("/signup")}
          sx={{ mt: 2 }}
        >
          Create Account
        </Button>
      </Paper>
    </Box>
  );
}

function SignUp({ setError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/6.x/initials/svg?seed=${name}`,
      });
      navigate("/");
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
        justifyContent: "center",
        height: "100%",
        p: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSignUp}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </form>
        <Button
          fullWidth
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Already have an account? Login
        </Button>
      </Paper>
    </Box>
  );
}

function ChatRoom() {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    try {
      setUploading(true);
      const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: "",
        imageUrl,
        user: auth.currentUser.displayName,
        avatar: auth.currentUser.photoURL,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
                  color: msg.user === auth.currentUser?.displayName
                    ? "primary.contrastText"
                    : "text.primary",
                  borderRadius: 2,
                  padding: 1,
                  maxWidth: "100%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {msg.user}
                </Typography>
                {msg.text && (
                  <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
                    {msg.text}
                  </Typography>
                )}
                {msg.imageUrl && (
                  <Box
                    component="img"
                    src={msg.imageUrl}
                    alt="Shared image"
                    sx={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: 1,
                      mt: msg.text ? 1 : 0,
                    }}
                  />
                )}
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
              <Paper elevation={3}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Paper>
            </Box>
          </ClickAwayListener>
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon />
          </IconButton>
          <TextField
            fullWidth
            placeholder={uploading ? "Uploading image..." : "Type a message..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            multiline
            maxRows={4}
            size="small"
            disabled={uploading}
          />
          <IconButton
            color="primary"
            onClick={() => setEmojiPickerVisible(!emojiPickerVisible)}
            disabled={uploading}
          >
            <EmojiEmotions />
          </IconButton>
          <IconButton color="primary" onClick={sendMessage} disabled={uploading}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export default App;