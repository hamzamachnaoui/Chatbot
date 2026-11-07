import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  ClickAwayListener,
  CircularProgress,
  Typography,
} from "@mui/material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import MicIcon from "@mui/icons-material/Mic";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";
import { useChatTheme } from "../../contexts/ChatThemeContext";
import { ImageSendModal } from "./ImagePreviewModal";

// Helper to compress images to ensure fast sending & compatibility with Firestore (< 1MB)
function compressImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function formatRecordTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function MessageInput({ onSendMessage, disabled = false }) {
  const { currentTheme, isDarkMode } = useChatTheme();
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [processingImage, setProcessingImage] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const handleSendText = () => {
    if (!text.trim() || disabled) return;
    onSendMessage({ text: text.trim() });
    setText("");
    setEmojiOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    textInputRef.current?.focus();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingImage(true);
      const compressedDataUrl = await compressImage(file);
      setPendingImage(compressedDataUrl);
    } catch (err) {
      console.error("Failed to process image:", err);
    } finally {
      setProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmSendImage = (caption) => {
    if (pendingImage) {
      onSendMessage({
        text: caption || "",
        imageUrl: pendingImage,
      });
      setPendingImage(null);
    }
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès.");
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64Audio = reader.result;
        onSendMessage({ audioUrl: base64Audio });
      };
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current.stop();
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        backgroundColor: currentTheme.inputBg,
        borderTop: "1px solid",
        borderColor: isDarkMode ? "#2a3942" : "#e9edef",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Emoji Picker Popover */}
      {emojiOpen && (
        <ClickAwayListener onClickAway={() => setEmojiOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              bottom: "75px",
              left: { xs: "10px", sm: "20px" },
              zIndex: 1300,
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={isDarkMode ? EmojiTheme.DARK : EmojiTheme.LIGHT}
              searchPlaceHolder="Rechercher un emoji..."
              previewConfig={{ showPreview: false }}
              width={320}
              height={380}
            />
          </Box>
        </ClickAwayListener>
      )}

      {isRecording ? (
        /* Recording UI Bar */
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            backgroundColor: currentTheme.surfaceColor,
            borderRadius: 3,
            px: 2,
            py: 1,
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FiberManualRecordIcon
              sx={{
                color: "#ef4444",
                fontSize: 18,
                animation: "pulse 1s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                  "100%": { opacity: 1 },
                },
              }}
            />
            <Typography variant="body2" fontWeight="bold" sx={{ color: "#ef4444" }}>
              {formatRecordTime(recordingSeconds)}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{ flexGrow: 1, color: isDarkMode ? "#8696a0" : "#667781" }}
          >
            Enregistrement audio en cours...
          </Typography>

          <IconButton onClick={cancelRecording} sx={{ color: "#ef4444" }}>
            <DeleteOutlineIcon />
          </IconButton>

          <IconButton
            onClick={stopAndSendRecording}
            sx={{
              backgroundColor: currentTheme.accentColor,
              color: "#ffffff",
              "&:hover": { backgroundColor: currentTheme.headerColor },
            }}
          >
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      ) : (
        /* Normal Input UI */
        <>
          {/* Emoji Button */}
          <IconButton
            onClick={() => setEmojiOpen(!emojiOpen)}
            sx={{
              color: emojiOpen ? currentTheme.accentColor : isDarkMode ? "#8696a0" : "#54656f",
              "&:hover": { color: currentTheme.accentColor },
            }}
          >
            <EmojiEmotionsIcon />
          </IconButton>

          {/* Photo Attachment Button */}
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={processingImage}
            sx={{
              color: isDarkMode ? "#8696a0" : "#54656f",
              "&:hover": { color: currentTheme.accentColor },
            }}
          >
            {processingImage ? (
              <CircularProgress size={22} sx={{ color: currentTheme.accentColor }} />
            ) : (
              <AddPhotoAlternateIcon />
            )}
          </IconButton>

          {/* Text Input */}
          <TextField
            fullWidth
            inputRef={textInputRef}
            placeholder="Tapez un message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={4}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: currentTheme.surfaceColor,
                borderRadius: 3,
                color: isDarkMode ? "#e9edef" : "#111b21",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "transparent" },
                "&.Mui-focused fieldset": { borderColor: currentTheme.accentColor },
                padding: "8px 14px",
              },
              "& .MuiInputBase-input::placeholder": {
                color: isDarkMode ? "#8696a0" : "#667781",
                opacity: 1,
              },
            }}
          />

          {/* Send OR Microphone Button */}
          {text.trim() ? (
            <IconButton
              onClick={handleSendText}
              sx={{
                backgroundColor: currentTheme.accentColor,
                color: "#ffffff",
                width: 42,
                height: 42,
                transition: "all 0.2s ease",
                "&:hover": { backgroundColor: currentTheme.headerColor },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          ) : (
            <IconButton
              onClick={startRecording}
              sx={{
                backgroundColor: currentTheme.accentColor,
                color: "#ffffff",
                width: 42,
                height: 42,
                transition: "all 0.2s ease",
                "&:hover": { backgroundColor: currentTheme.headerColor },
              }}
            >
              <MicIcon sx={{ fontSize: 22 }} />
            </IconButton>
          )}
        </>
      )}

      {/* Modal for previewing photo before sending */}
      <ImageSendModal
        open={Boolean(pendingImage)}
        imageSrc={pendingImage}
        onSend={handleConfirmSendImage}
        onCancel={() => setPendingImage(null)}
      />
    </Box>
  );
}
