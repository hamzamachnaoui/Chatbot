import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  FormControlLabel,
  Switch,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaletteIcon from "@mui/icons-material/Palette";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import { useChatTheme } from "../../contexts/ChatThemeContext";

export default function ThemeSelectorModal({ open, onClose }) {
  const { themeId, allThemes, selectTheme, doodleEnabled, toggleDoodle } = useChatTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <PaletteIcon sx={{ color: "primary.main" }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Thème de discussion
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Personnalisez vos couleurs et votre style d'affichage
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "action.hover",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WallpaperIcon color="primary" />
              <Box>
                <Typography variant="body2" fontWeight="600">
                  Motif Doodle WhatsApp
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Affiche les icônes discrètes en arrière-plan
                </Typography>
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={doodleEnabled}
                  onChange={toggleDoodle}
                  color="primary"
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Box>
        </Box>

        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
          Sélectionnez votre style préféré :
        </Typography>

        <Grid container spacing={2}>
          {Object.values(allThemes).map((theme) => {
            const isSelected = theme.id === themeId;
            return (
              <Grid item xs={12} sm={6} key={theme.id}>
                <Paper
                  elevation={isSelected ? 4 : 1}
                  onClick={() => selectTheme(theme.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: "pointer",
                    position: "relative",
                    border: isSelected ? "2px solid" : "1px solid",
                    borderColor: isSelected ? theme.accentColor : "divider",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                    backgroundColor: theme.surfaceColor,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: theme.category === "dark" ? "#ffffff" : "#111b21" }}
                    >
                      {theme.name}
                    </Typography>
                    {isSelected && (
                      <CheckCircleIcon sx={{ color: theme.accentColor, fontSize: 20 }} />
                    )}
                  </Box>

                  {/* Mini Preview of chat */}
                  <Box
                    sx={{
                      backgroundColor: theme.chatBg,
                      borderRadius: 1.5,
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.8,
                      minHeight: 70,
                      justifyContent: "center",
                    }}
                  >
                    {/* Received preview bubble */}
                    <Box
                      sx={{
                        alignSelf: "flex-start",
                        backgroundColor: theme.receivedBubble,
                        color: theme.receivedText,
                        px: 1.2,
                        py: 0.5,
                        borderRadius: "8px 8px 8px 0px",
                        fontSize: "0.75rem",
                        maxWidth: "80%",
                        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                      }}
                    >
                      Bonjour ! 👋
                    </Box>

                    {/* Sent preview bubble */}
                    <Box
                      sx={{
                        alignSelf: "flex-end",
                        backgroundColor: theme.sentBubble,
                        color: theme.sentText,
                        px: 1.2,
                        py: 0.5,
                        borderRadius: "8px 8px 0px 8px",
                        fontSize: "0.75rem",
                        maxWidth: "80%",
                        boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <span>Super thème !</span>
                      <Typography
                        component="span"
                        sx={{ fontSize: "0.6rem", color: theme.timeSent, ml: 0.5 }}
                      >
                        12:00 ✓✓
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1, display: "flex", gap: 0.5 }}>
                    <Chip
                      size="small"
                      label={theme.category === "dark" ? "Sombre" : "Clair"}
                      sx={{
                        fontSize: "0.65rem",
                        height: 20,
                        backgroundColor: theme.category === "dark" ? "#374151" : "#e5e7eb",
                        color: theme.category === "dark" ? "#ffffff" : "#1f2937",
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

