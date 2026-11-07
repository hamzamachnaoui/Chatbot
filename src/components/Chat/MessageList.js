import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, Chip, Fab, Zoom } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MessageItem from "./MessageItem";
import { formatMessageDateHeader } from "../../utils/formatters";
import { useChatTheme } from "../../contexts/ChatThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const DOODLE_SVG_LIGHT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" opacity="0.06"><path d="M14 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm20 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm24-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 44a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm32 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm26-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM18 72a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm36 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm-8-36a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" fill="%23000000"/></svg>`;
const DOODLE_SVG_DARK = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" opacity="0.05"><path d="M14 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm20 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm24-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 44a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm32 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm26-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM18 72a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm36 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm-8-36a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" fill="%23ffffff"/></svg>`;

export default function MessageList({ messages, onReact, onDelete, isSearching = false }) {
  const { currentTheme, isDarkMode, doodleEnabled } = useChatTheme();
  const { currentUser } = useAuth();
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 220);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const doodleBg = doodleEnabled
    ? isDarkMode
      ? `url('${DOODLE_SVG_DARK}')`
      : `url('${DOODLE_SVG_LIGHT}')`
    : "none";

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        flexGrow: 1,
        overflowY: "auto",
        backgroundColor: currentTheme.chatBg,
        backgroundImage: doodleBg,
        backgroundRepeat: "repeat",
        display: "flex",
        flexDirection: "column",
        py: 2,
        px: { xs: 0.5, sm: 2 },
        position: "relative",
      }}
    >
      {messages.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            my: "auto",
            p: 3,
            textAlign: "center",
          }}
        >
          <Chip
            label={isSearching ? "Aucun message correspondant trouvé" : "Aucun message pour le moment"}
            sx={{
              backgroundColor: isDarkMode ? "#182229" : "#ffffff",
              color: isDarkMode ? "#8696a0" : "#54656f",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              mb: 1,
            }}
          />
          <Typography variant="body2" sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}>
            {isSearching
              ? "Essayez d'autres mots-clés de recherche."
              : "Soyez le premier à envoyer un message ou une photo ! 💬"}
          </Typography>
        </Box>
      ) : (
        messages.map((msg, index) => {
          const isOwnMessage =
            msg.user === currentUser?.displayName ||
            msg.userId === currentUser?.uid;

          const prevMsg = messages[index - 1];
          const currentDateHeader = formatMessageDateHeader(msg.timestamp);
          const prevDateHeader = prevMsg ? formatMessageDateHeader(prevMsg.timestamp) : null;
          const showDateBadge = !prevMsg || currentDateHeader !== prevDateHeader;

          return (
            <React.Fragment key={msg.id || index}>
              {showDateBadge && currentDateHeader && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
                  <Chip
                    label={currentDateHeader}
                    size="small"
                    sx={{
                      backgroundColor: isDarkMode ? "#182229" : "#ffffff",
                      color: isDarkMode ? "#8696a0" : "#54656f",
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      textTransform: "capitalize",
                      px: 1,
                    }}
                  />
                </Box>
              )}
              <MessageItem
                msg={msg}
                isOwnMessage={isOwnMessage}
                showAvatar={!isOwnMessage}
                onReact={onReact}
                onDelete={onDelete}
              />
            </React.Fragment>
          );
        })
      )}
      <div ref={messagesEndRef} />

      {/* Floating Scroll to Bottom button (WhatsApp style) */}
      <Zoom in={showScrollBottom}>
        <Fab
          size="small"
          onClick={scrollToBottom}
          sx={{
            position: "sticky",
            bottom: 16,
            alignSelf: "flex-end",
            backgroundColor: isDarkMode ? "#202c33" : "#ffffff",
            color: currentTheme.accentColor,
            boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
            "&:hover": {
              backgroundColor: isDarkMode ? "#2a3942" : "#f0f2f5",
            },
            zIndex: 100,
          }}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}
