import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { useAuth } from "../../contexts/AuthContext";
import { useChatTheme } from "../../contexts/ChatThemeContext";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
];

function getFriendlyFirebaseError(error) {
  if (!error) return "";
  const code = error.code || "";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "Nom d'utilisateur ou mot de passe incorrect.";
  }
  if (code === "auth/email-already-in-use") {
    return "Ce nom d'utilisateur est déjà utilisé.";
  }
  if (code === "auth/weak-password") {
    return "Le mot de passe doit comporter au moins 6 caractères.";
  }
  return error.message || "Une erreur est survenue lors de l'authentification.";
}

export default function AuthCard({ onSuccess }) {
  const { login, register } = useAuth();
  const { currentTheme, isDarkMode } = useChatTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Veuillez renseigner tous les champs requis.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      setSubmitting(true);
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, selectedAvatar);
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(getFriendlyFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backgroundColor: isDarkMode ? "#111b21" : "#efeae2",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
          backgroundColor: isDarkMode ? "#202c33" : "#ffffff",
          color: isDarkMode ? "#e9edef" : "#111b21",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        {/* App Logo & Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: currentTheme.headerColor,
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1.5,
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            <ChatIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            {isLogin ? "Connexion" : "Créer un compte"}
          </Typography>
          <Typography variant="body2" sx={{ color: isDarkMode ? "#8696a0" : "#667781", mt: 0.5 }}>
            {isLogin
              ? "Rejoignez vos salons de discussion"
              : "Choisissez votre avatar et commencez à discuter"}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <TextField
            fullWidth
            label="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2 }}
            InputLabelProps={{
              sx: { color: isDarkMode ? "#8696a0" : undefined },
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            type="password"
            label="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            sx={{ mb: 2.5 }}
            InputLabelProps={{
              sx: { color: isDarkMode ? "#8696a0" : undefined },
            }}
          />

          {/* Avatar Selector (Registration only) */}
          {!isLogin && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                sx={{ mb: 1, color: isDarkMode ? "#e9edef" : "#111b21" }}
              >
                Choisissez votre avatar :
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.2,
                  justifyContent: "center",
                }}
              >
                {PRESET_AVATARS.map((url, idx) => {
                  const isSelected = selectedAvatar === url;
                  return (
                    <Avatar
                      key={idx}
                      src={url}
                      onClick={() => setSelectedAvatar(url)}
                      sx={{
                        width: 48,
                        height: 48,
                        cursor: "pointer",
                        border: isSelected ? `3px solid ${currentTheme.accentColor}` : "2px solid transparent",
                        transform: isSelected ? "scale(1.1)" : "scale(1)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting}
            sx={{
              py: 1.3,
              borderRadius: 2,
              fontWeight: "bold",
              fontSize: "0.95rem",
              backgroundColor: currentTheme.headerColor,
              color: currentTheme.headerTextColor,
              "&:hover": {
                backgroundColor: currentTheme.accentColor,
              },
            }}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "inherit" }} />
            ) : isLogin ? (
              "Se connecter"
            ) : (
              "S'inscrire"
            )}
          </Button>

          {/* Toggle Login/Register */}
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            disabled={submitting}
            sx={{
              mt: 2,
              textTransform: "none",
              color: isDarkMode ? "#8696a0" : "#54656f",
              "&:hover": { color: currentTheme.accentColor },
            }}
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Vous avez déjà un compte ? Se connecter"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

