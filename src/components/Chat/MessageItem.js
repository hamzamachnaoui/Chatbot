import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddReactionOutlinedIcon from "@mui/icons-material/AddReactionOutlined";
import { formatMessageTime } from "../../utils/formatters";
import { useChatTheme } from "../../contexts/ChatThemeContext";
import { ImageViewerModal } from "./ImagePreviewModal";
import VoiceNotePlayer from "./VoiceNotePlayer";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function MessageItem({
  msg,
  isOwnMessage,
  showAvatar = true,
  onReact,
  onDelete,
}) {
  const { currentTheme, isDarkMode } = useChatTheme();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [reactionBarOpen, setReactionBarOpen] = useState(false);

  const bubbleBg = isOwnMessage ? currentTheme.sentBubble : currentTheme.receivedBubble;
  const textColor = isOwnMessage ? currentTheme.sentText : currentTheme.receivedText;
  const timeColor = isOwnMessage ? currentTheme.timeSent : currentTheme.timeReceived;
  const isDeleted = msg.deleted === true;

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (!isDeleted && onDelete && msg.id) {
      onDelete(msg.id);
    }
  };

  const handleSelectReaction = (emoji) => {
    setReactionBarOpen(false);
    if (!isDeleted && onReact && msg.id) {
      onReact(msg.id, emoji);
    }
  };

  // Aggregate reactions by emoji count
  const reactionsMap = msg.reactions || {};
  const aggregatedReactions = Object.entries(reactionsMap).reduce((acc, [user, emoji]) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  const showActions = !isDeleted && (hovered || reactionBarOpen || Boolean(menuAnchorEl));

  const handleBubbleTap = () => {
    if (isDeleted) return;
    if (window.matchMedia?.("(hover: none)").matches) {
      setHovered((prev) => !prev);
    }
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setReactionBarOpen(false);
      }}
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 0.8,
        mb: 1.2,
        px: { xs: 1, sm: 2 },
        position: "relative",
      }}
    >
      {/* Avatar for received messages */}
      {!isOwnMessage && showAvatar && (
        <Avatar
          src={msg.avatar}
          alt={msg.user}
          sx={{
            width: 28,
            height: 28,
            fontSize: "0.8rem",
            mb: 0.5,
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          {msg.user?.[0]?.toUpperCase()}
        </Avatar>
      )}

      {/* Action buttons (hover bar for reaction and options) */}
      {isOwnMessage && showActions && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            opacity: 0.85,
            transition: "opacity 0.2s",
            "&:hover": { opacity: 1 },
          }}
        >
          <Tooltip title="Réagir">
            <IconButton
              size="small"
              onClick={() => setReactionBarOpen(!reactionBarOpen)}
              sx={{ color: isDarkMode ? "#8696a0" : "#54656f", p: 0.5 }}
            >
              <AddReactionOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ color: isDarkMode ? "#8696a0" : "#54656f", p: 0.5 }}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      {/* Bubble Container */}
      <Box
        onClick={handleBubbleTap}
        sx={{
          maxWidth: { xs: "85%", sm: "70%", md: "60%" },
          position: "relative",
          backgroundColor: bubbleBg,
          color: textColor,
          borderRadius: isOwnMessage ? "8px 8px 0px 8px" : "8px 8px 8px 0px",
          p: msg.imageUrl && !isDeleted ? 0.6 : "6px 10px 4px 10px",
          boxShadow: "0 1px 0.5px rgba(11,20,26,0.12)",
          wordBreak: "break-word",
          display: "inline-block",
        }}
      >
        {/* Floating Quick Reaction Bar */}
        {reactionBarOpen && !isDeleted && (
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: isOwnMessage ? 0 : "auto",
              left: isOwnMessage ? "auto" : 0,
              backgroundColor: isDarkMode ? "#202c33" : "#ffffff",
              borderRadius: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              display: "flex",
              p: 0.5,
              gap: 0.5,
              zIndex: 10,
              border: "1px solid",
              borderColor: isDarkMode ? "#2a3942" : "#e9edef",
              animation: "fadeIn 0.15s ease",
            }}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <Box
                key={emoji}
                component="button"
                onClick={() => handleSelectReaction(emoji)}
                sx={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  p: 0.5,
                  borderRadius: "50%",
                  transition: "transform 0.15s ease",
                  "&:hover": {
                    transform: "scale(1.3)",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  },
                }}
              >
                {emoji}
              </Box>
            ))}
          </Box>
        )}

        {/* Sender Name in group room (received messages only) */}
        {!isOwnMessage && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: "bold",
              color: currentTheme.headerColor,
              display: "block",
              mb: 0.3,
              px: msg.imageUrl && !isDeleted ? 0.6 : 0,
              fontSize: "0.75rem",
            }}
          >
            {msg.user || "Utilisateur"}
          </Typography>
        )}

        {/* Image Attachment (if present) */}
        {isDeleted ? (
          <Typography
            variant="body2"
            sx={{
              color: isDarkMode ? "#8696a0" : "#667781",
              fontStyle: "italic",
              px: 0.2,
            }}
          >
            Ce message a été supprimé
          </Typography>
        ) : (
          <>
        {msg.imageUrl && (
          <Box
            sx={{
              position: "relative",
              cursor: "pointer",
              borderRadius: "6px",
              overflow: "hidden",
              mb: msg.text ? 0.6 : 0,
              "&:hover img": {
                transform: "scale(1.01)",
              },
            }}
            onClick={() => setViewerOpen(true)}
          >
            <Box
              component="img"
              src={msg.imageUrl}
              alt="Photo"
              sx={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                display: "block",
                borderRadius: "6px",
                transition: "transform 0.2s ease",
              }}
            />
          </Box>
        )}

        {/* Voice Note Attachment (if present) */}
        {msg.audioUrl && (
          <VoiceNotePlayer
            audioUrl={msg.audioUrl}
            isOwnMessage={isOwnMessage}
          />
        )}

        {/* Text Content */}
        {msg.text && (
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.4,
              fontSize: "0.92rem",
              whiteSpace: "pre-wrap",
              px: msg.imageUrl ? 0.6 : 0,
              pr: isOwnMessage ? 6 : 4,
              display: "inline",
            }}
          >
            {msg.text}
          </Typography>
        )}
          </>
        )}

        {/* Timestamp & double check mark */}
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            float: "right",
            gap: 0.3,
            ml: 1,
            mt: 0.5,
            userSelect: "none",
            verticalAlign: "bottom",
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: "0.68rem",
              color: timeColor,
              lineHeight: 1,
            }}
          >
            {formatMessageTime(msg.timestamp)}
          </Typography>
          {isOwnMessage && (
            <DoneAllIcon
              sx={{
                fontSize: 14,
                color: currentTheme.checkColor,
                display: "inline-block",
              }}
            />
          )}
        </Box>

        {/* Emoji Reactions display under bubble */}
        {!isDeleted && Object.keys(aggregatedReactions).length > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: -12,
              right: isOwnMessage ? 8 : "auto",
              left: isOwnMessage ? "auto" : 8,
              display: "flex",
              gap: 0.4,
              backgroundColor: isDarkMode ? "#202c33" : "#ffffff",
              borderRadius: "12px",
              px: 0.8,
              py: 0.2,
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              border: "1px solid",
              borderColor: isDarkMode ? "#2a3942" : "#e9edef",
              cursor: "pointer",
            }}
          >
            {Object.entries(aggregatedReactions).map(([emoji, count]) => (
              <Box
                key={emoji}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.3,
                  fontSize: "0.75rem",
                  color: isDarkMode ? "#e9edef" : "#111b21",
                }}
              >
                <span>{emoji}</span>
                {count > 1 && (
                  <Typography variant="caption" sx={{ fontSize: "0.65rem", fontWeight: "bold" }}>
                    {count}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Action buttons on received messages when hovered */}
      {!isOwnMessage && showActions && (
        <Tooltip title="Réagir">
          <IconButton
            size="small"
            onClick={() => setReactionBarOpen(!reactionBarOpen)}
            sx={{ color: isDarkMode ? "#8696a0" : "#54656f", p: 0.5 }}
          >
            <AddReactionOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Context Menu for sender */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: isDarkMode ? "#202c33" : "#ffffff",
            color: isDarkMode ? "#e9edef" : "#111b21",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          },
        }}
      >
        <MenuItem onClick={handleDelete} sx={{ color: "#ef4444" }}>
          <ListItemIcon sx={{ color: "#ef4444" }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Supprimer le message" />
        </MenuItem>
      </Menu>

      {/* Image Fullscreen Viewer */}
      {msg.imageUrl && !isDeleted && (
        <ImageViewerModal
          open={viewerOpen}
          imageSrc={msg.imageUrl}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </Box>
  );
}
