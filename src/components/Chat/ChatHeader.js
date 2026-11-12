import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PaletteIcon from "@mui/icons-material/Palette";
import TagIcon from "@mui/icons-material/Tag";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useChatTheme } from "../../contexts/ChatThemeContext";
import ThemeSelectorModal from "./ThemeSelectorModal";

export default function ChatHeader({
  roomId,
  isPrivate = false,
  peerUser = null,
  messageCount = 0,
  onOpenMobileDrawer,
  searchQuery = "",
  onSearchChange,
}) {
  const { currentTheme } = useChatTheme();
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleToggleSearch = () => {
    if (searchOpen) {
      if (onSearchChange) onSearchChange("");
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={1}
        sx={{
          backgroundColor: currentTheme.headerColor,
          color: currentTheme.headerTextColor,
          width: "100%",
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ minHeight: "58px !important", px: { xs: 1.5, sm: 2.5 } }}>
          {/* Mobile hamburger menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={onOpenMobileDrawer}
            sx={{ mr: 1, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Room or Peer Avatar */}
          <Avatar
            src={isPrivate ? peerUser?.photoURL : undefined}
            alt={isPrivate ? peerUser?.displayName : roomId}
            sx={{
              bgcolor: currentTheme.accentColor,
              color: "#ffffff",
              width: 38,
              height: 38,
              mr: 1.5,
              fontWeight: "bold",
            }}
          >
            {isPrivate
              ? peerUser?.displayName?.[0]?.toUpperCase() || "?"
              : <TagIcon sx={{ fontSize: 22 }} />}
          </Avatar>

          {/* Room/Peer Title and Subtitle OR Search Input */}
          {searchOpen ? (
            <Box sx={{ flexGrow: 1, mr: 1.5 }}>
              <TextField
                autoFocus
                size="small"
                fullWidth
                placeholder={isPrivate ? "Rechercher dans cette discussion..." : "Rechercher dans ce salon..."}
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => onSearchChange && onSearchChange("")}
                        sx={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    color: "#ffffff",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    fontSize: "0.88rem",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                    "&.Mui-focused fieldset": { borderColor: "#ffffff" },
                  },
                }}
              />
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                {isPrivate && <LockOutlinedIcon sx={{ fontSize: 15, opacity: 0.9 }} />}
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{ fontWeight: "bold", lineHeight: 1.2 }}
                >
                  {isPrivate ? peerUser?.displayName || "Discussion privée" : `#${roomId}`}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  opacity: 0.85,
                  display: "block",
                  lineHeight: 1,
                  fontSize: "0.72rem",
                }}
              >
                {isPrivate ? "Discussion privée" : "Salon de discussion"} • {messageCount} message{messageCount > 1 ? "s" : ""}
              </Typography>
            </Box>
          )}

          {/* Search Toggle button */}
          <Tooltip title={searchOpen ? "Fermer la recherche" : "Rechercher dans les messages"}>
            <IconButton
              color="inherit"
              onClick={handleToggleSearch}
              sx={{
                mr: 0.8,
                backgroundColor: searchOpen ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.12)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.22)" },
              }}
            >
              {searchOpen ? <CloseIcon /> : <SearchIcon />}
            </IconButton>
          </Tooltip>

          {/* Theme Selector action button */}
          <Tooltip title="Changer le thème de discussion">
            <IconButton
              color="inherit"
              onClick={() => setThemeModalOpen(true)}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.12)",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.22)" },
              }}
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Theme selection modal */}
      <ThemeSelectorModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </>
  );
}
