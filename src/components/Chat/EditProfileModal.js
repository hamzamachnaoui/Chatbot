import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAuth } from "../../contexts/AuthContext";
import { useChatTheme } from "../../contexts/ChatThemeContext";

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Bot1",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Bot2",
];

export default function EditProfileModal({ open, onClose }) {
  const { currentUser, updateUserProfile } = useAuth();
  const { currentTheme, isDarkMode } = useChatTheme();

  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setSelectedAvatar(currentUser.photoURL || AVATAR_OPTIONS[0]);
    }
  }, [currentUser, open]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Le nom d'utilisateur ne peut pas être vide.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: selectedAvatar,
      });
      onClose();
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: isDarkMode ? "#202c33" : "#ffffff",
          color: isDarkMode ? "#e9edef" : "#111b21",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <PersonOutlineIcon sx={{ color: currentTheme.accentColor }} />
        <Typography variant="h6" fontWeight="bold">
          Modifier mon profil
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: isDarkMode ? "#2a3942" : "#e9edef" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Current Avatar preview */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Avatar
            src={selectedAvatar}
            alt={displayName}
            sx={{
              width: 80,
              height: 80,
              border: `3px solid ${currentTheme.accentColor}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              mb: 1.5,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Avatar sélectionné
          </Typography>
        </Box>

        {/* Change Display Name */}
        <TextField
          fullWidth
          label="Nom d'utilisateur"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: { color: isDarkMode ? "#8696a0" : undefined },
          }}
        />

        {/* Avatar selection list */}
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Choisir un autre avatar :
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.2,
            justifyContent: "center",
          }}
        >
          {AVATAR_OPTIONS.map((url, idx) => {
            const isSelected = selectedAvatar === url;
            return (
              <Avatar
                key={idx}
                src={url}
                onClick={() => setSelectedAvatar(url)}
                sx={{
                  width: 44,
                  height: 44,
                  cursor: "pointer",
                  border: isSelected ? `3px solid ${currentTheme.accentColor}` : "2px solid transparent",
                  transform: isSelected ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.15s ease",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              />
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ color: isDarkMode ? "#8696a0" : "#54656f" }}>
          Annuler
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{
            backgroundColor: currentTheme.headerColor,
            "&:hover": { backgroundColor: currentTheme.accentColor },
          }}
        >
          {saving ? <CircularProgress size={22} sx={{ color: "#ffffff" }} /> : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
