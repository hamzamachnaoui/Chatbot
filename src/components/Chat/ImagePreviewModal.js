import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

export function ImageSendModal({ open, imageSrc, onSend, onCancel }) {
  const [caption, setCaption] = useState("");

  const handleSend = () => {
    onSend(caption);
    setCaption("");
  };

  const handleClose = () => {
    setCaption("");
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: "#111b21",
          color: "#e9edef",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #222d34",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Aperçu de la photo
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: "#aebac1" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {imageSrc && (
          <Box
            component="img"
            src={imageSrc}
            alt="Aperçu"
            sx={{
              maxHeight: "360px",
              maxWidth: "100%",
              objectFit: "contain",
              borderRadius: 2,
              mb: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          />
        )}
        <TextField
          fullWidth
          placeholder="Ajouter une légende... (optionnel)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#202c33",
              color: "#e9edef",
              borderRadius: 2,
              "& fieldset": { borderColor: "#2a3942" },
              "&:hover fieldset": { borderColor: "#00a884" },
              "&.Mui-focused fieldset": { borderColor: "#00a884" },
            },
            "& .MuiInputBase-input::placeholder": {
              color: "#8696a0",
              opacity: 1,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #222d34" }}>
        <Button onClick={handleClose} sx={{ color: "#8696a0" }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          endIcon={<SendIcon />}
          sx={{
            backgroundColor: "#00a884",
            "&:hover": { backgroundColor: "#02906f" },
            px: 3,
          }}
        >
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function ImageViewerModal({ open, imageSrc, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.92)",
          boxShadow: "none",
          p: 0,
          borderRadius: 2,
          position: "relative",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.5)",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        {imageSrc && (
          <Box
            component="img"
            src={imageSrc}
            alt="Plein écran"
            sx={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
              borderRadius: 1,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

