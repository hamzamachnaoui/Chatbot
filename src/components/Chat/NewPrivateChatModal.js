import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useChatTheme } from "../../contexts/ChatThemeContext";

export default function NewPrivateChatModal({
  open,
  onClose,
  users = [],
  onSelectUser,
}) {
  const { currentTheme, isDarkMode } = useChatTheme();
  const [query, setQuery] = useState("");

  const filteredUsers = users.filter((u) =>
    (u.displayName || "").toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const handlePickUser = (user) => {
    setQuery("");
    onSelectUser(user);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        <PersonAddIcon sx={{ color: currentTheme.accentColor }} />
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
            Nouvelle discussion privée
          </Typography>
          <Typography variant="caption" sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}>
            Sélectionnez un utilisateur connecté ou inscrit
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: isDarkMode ? "#2a3942" : "#e9edef", p: 2 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Rechercher un utilisateur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: isDarkMode ? "#8696a0" : "#54656f" }} />
              </InputAdornment>
            ),
          }}
        />

        {filteredUsers.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}>
              {users.length === 0
                ? "Aucun autre utilisateur disponible pour le moment. Connectez un second compte pour démarrer une discussion."
                : "Aucun utilisateur ne correspond à votre recherche."}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflowY: "auto", p: 0 }}>
            {filteredUsers.map((user) => (
              <ListItem key={user.uid} disablePadding>
                <ListItemButton
                  onClick={() => handlePickUser(user)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#2a3942" : "#f0f2f5",
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 46 }}>
                    <Avatar src={user.photoURL} alt={user.displayName}>
                      {user.displayName?.[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {user.displayName || "Utilisateur"}
                        </Typography>
                        {user.isAnonymous && (
                          <Chip
                            label="Invité"
                            size="small"
                            sx={{ height: 18, fontSize: "0.65rem" }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}
                      >
                        Démarrer un échange privé
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 1.5 }}>
        <Button onClick={handleClose} sx={{ color: isDarkMode ? "#8696a0" : "#54656f" }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

