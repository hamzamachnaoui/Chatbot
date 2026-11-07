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
  Divider,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import FlashOnIcon from "@mui/icons-material/FlashOn";
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

function getFriendlyFirebaseError(error, isLogin) {
  if (!error) return "";
  const code = error.code || "";

  if (code === "auth/operation-not-allowed") {
    return "La méthode Email/Mot de passe n'est pas activée dans votre console Firebase (Authentication > Sign-in method). Activez-la ou utilisez l'accès Invité.";
  }
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
    return isLogin
      ? "Identifiants incorrects ou compte inexistant. Avez-vous créé ce compte ? Cliquez sur 'S'inscrire' ci-dessous pour créer un profil."
      : "Erreur d'identifiant.";
  }
  if (code === "auth/email-already-in-use") {
    return "Ce nom d'utilisateur est déjà utilisé. Cliquez sur 'Se connecter' ou choisissez un autre pseudo.";
  }
  if (code === "auth/weak-password") {
    return "Le mot de passe doit comporter au moins 6 caractères.";
  }
  if (code === "auth/invalid-email") {
    return "Nom d'utilisateur invalide. Évitez les caractères spéciaux.";
  }
  if (code === "auth/too-many-requests") {
    return "Trop de tentatives échouées. Veuillez patienter quelques instants avant de réessayer.";
  }
  return error.message || "Une erreur est survenue lors de l'authentification.";
}

export default function AuthCard({ onSuccess }) {
  const { login, register, loginAsGuest } = useAuth();
  const { currentTheme, isDarkMode } = useChatTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guestSubmitting, setGuestSubmitting] = useState(false);

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
      console.error("Firebase auth error details:", err);
      setError(getFriendlyFirebaseError(err, isLogin));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setGuestSubmitting(true);
      setError("");
      await loginAsGuest(username.trim() || undefined, selectedAvatar);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Guest login error:", err);
      if (err.code === "auth/operation-not-allowed") {
        setError("L'authentification anonyme doit être activée dans la console Firebase (Authentication > Sign-in method > Anonyme).");
      } else {
        setError(getFriendlyFirebaseError(err, false));
      }
    } finally {
      setGuestSubmitting(false);
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
            disabled={submitting || guestSubmitting}
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
            disabled={submitting || guestSubmitting}
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
                        "&:hover": { transform: "scale(1.1)" },
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
            disabled={submitting || guestSubmitting}
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
            disabled={submitting || guestSubmitting}
            sx={{
              mt: 1.5,
              textTransform: "none",
              color: isDarkMode ? "#8696a0" : "#54656f",
              "&:hover": { color: currentTheme.accentColor },
            }}
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Vous avez déjà un compte ? Se connecter"}
          </Button>

          <Divider sx={{ my: 2, borderColor: isDarkMode ? "#2a3942" : "#e9edef" }}>
            <Typography variant="caption" sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}>
              OU
            </Typography>
          </Divider>

          {/* Fast Guest Mode Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleGuestLogin}
            disabled={submitting || guestSubmitting}
            startIcon={<FlashOnIcon />}
            sx={{
              py: 1,
              borderRadius: 2,
              borderColor: isDarkMode ? "#2a3942" : "#d1d5db",
              color: isDarkMode ? "#e9edef" : "#111b21",
              textTransform: "none",
              "&:hover": {
                borderColor: currentTheme.accentColor,
                backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              },
            }}
          >
            {guestSubmitting ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : (
              "Accès direct en tant qu'invité"
            )}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
