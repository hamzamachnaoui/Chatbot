import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PaletteIcon from "@mui/icons-material/Palette";
import TagIcon from "@mui/icons-material/Tag";
import { useChatTheme } from "../../contexts/ChatThemeContext";
import ThemeSelectorModal from "./ThemeSelectorModal";

export default function ChatHeader({
  roomId,
  messageCount = 0,
  onOpenMobileDrawer,
  drawerWidth = 280,
}) {
  const { currentTheme } = useChatTheme();
  const [themeModalOpen, setThemeModalOpen] = useState(false);

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

          {/* Room Avatar */}
          <Avatar
            sx={{
              bgcolor: currentTheme.accentColor,
              color: "#ffffff",
              width: 38,
              height: 38,
              mr: 1.5,
              fontWeight: "bold",
            }}
          >
            <TagIcon sx={{ fontSize: 22 }} />
          </Avatar>

          {/* Room Title and Subtitle */}
          <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ fontWeight: "bold", lineHeight: 1.2 }}
            >
              #{roomId}
            </Typography>
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
              Salon de discussion • {messageCount} message{messageCount > 1 ? "s" : ""}
            </Typography>
          </Box>

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

