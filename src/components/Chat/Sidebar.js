import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import TagIcon from "@mui/icons-material/Tag";
import PaletteIcon from "@mui/icons-material/Palette";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../contexts/AuthContext";
import { useChatTheme } from "../../contexts/ChatThemeContext";
import ThemeSelectorModal from "./ThemeSelectorModal";
import EditProfileModal from "./EditProfileModal";
import NewPrivateChatModal from "./NewPrivateChatModal";

export default function Sidebar({
  rooms,
  currentRoomId,
  isPrivateMode = false,
  currentPrivateChatId = "",
  privateChats = [],
  newPrivateChatIds = new Set(),
  availableUsers = [],
  onSelectRoom,
  onSelectPrivateChat,
  onStartPrivateChatWithUser,
  onCreateRoom,
  roomMessages = {},
  newMessageRooms = new Set(),
  mobileOpen,
  onCloseMobileDrawer,
  drawerWidth = 280,
}) {
  const { currentUser, logout } = useAuth();
  const { currentTheme, isDarkMode } = useChatTheme();
  const [activeTab, setActiveTab] = useState(isPrivateMode ? 1 : 0);
  const [search, setSearch] = useState("");
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [newRoomDialogOpen, setNewRoomDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [newPrivateModalOpen, setNewPrivateModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab(isPrivateMode ? 1 : 0);
  }, [isPrivateMode]);

  const filteredRooms = rooms.filter((r) =>
    r.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPrivateChats = privateChats.filter((chat) =>
    (chat.peerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateRoomSubmit = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    if (onCreateRoom) {
      onCreateRoom(newRoomName.trim());
    }
    setNewRoomName("");
    setNewRoomDialogOpen(false);
  };

  const sidebarContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDarkMode ? "#111b21" : "#ffffff",
        color: isDarkMode ? "#e9edef" : "#111b21",
        borderRight: "1px solid",
        borderColor: isDarkMode ? "#222d34" : "#e9edef",
      }}
    >
      {/* User profile header (WhatsApp Web top bar) */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: isDarkMode ? "#202c33" : "#f0f2f5",
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          borderBottom: "1px solid",
          borderColor: isDarkMode ? "#222d34" : "#e9edef",
        }}
      >
        <Tooltip title="Modifier mon profil">
          <Avatar
            src={currentUser?.photoURL}
            alt={currentUser?.displayName}
            onClick={() => setProfileModalOpen(true)}
            sx={{
              width: 40,
              height: 40,
              cursor: "pointer",
              border: `2px solid ${currentTheme.accentColor}`,
              transition: "transform 0.15s ease",
              "&:hover": { transform: "scale(1.08)" },
            }}
          >
            {currentUser?.displayName?.[0]?.toUpperCase()}
          </Avatar>
        </Tooltip>

        <Box
          sx={{ flexGrow: 1, overflow: "hidden", cursor: "pointer" }}
          onClick={() => setProfileModalOpen(true)}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {currentUser?.displayName || "Utilisateur"}
            </Typography>
            <EditIcon sx={{ fontSize: 13, color: isDarkMode ? "#8696a0" : "#667781" }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#25d366",
              }}
            />
            <Typography variant="caption" sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}>
              En ligne
            </Typography>
          </Box>
        </Box>

        <Tooltip title={activeTab === 1 ? "Nouvelle discussion privée" : "Créer un nouveau salon"}>
          <IconButton
            size="small"
            onClick={() =>
              activeTab === 1 ? setNewPrivateModalOpen(true) : setNewRoomDialogOpen(true)
            }
            sx={{ color: isDarkMode ? "#aebac1" : "#54656f" }}
          >
            {activeTab === 1 ? (
              <PersonAddIcon fontSize="small" />
            ) : (
              <AddCircleOutlineIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Changer mon thème">
          <IconButton
            size="small"
            onClick={() => setThemeModalOpen(true)}
            sx={{ color: isDarkMode ? "#aebac1" : "#54656f" }}
          >
            <PaletteIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Se déconnecter">
          <IconButton
            size="small"
            onClick={logout}
            sx={{ color: isDarkMode ? "#aebac1" : "#54656f" }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Tabs: Public Rooms vs Private Chats */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          borderBottom: "1px solid",
          borderColor: isDarkMode ? "#222d34" : "#e9edef",
          "& .MuiTabs-indicator": {
            backgroundColor: currentTheme.accentColor,
            height: 3,
          },
          "& .MuiTab-root": {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.82rem",
            color: isDarkMode ? "#8696a0" : "#54656f",
            "&.Mui-selected": {
              color: currentTheme.accentColor,
            },
          },
        }}
      >
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <span>Salons</span>
              {newMessageRooms.size > 0 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: currentTheme.accentColor,
                  }}
                />
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <span>Privés</span>
              {newPrivateChatIds.size > 0 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: currentTheme.accentColor,
                  }}
                />
              )}
            </Box>
          }
        />
      </Tabs>

      {/* Search Bar */}
      <Box sx={{ p: 1, backgroundColor: isDarkMode ? "#111b21" : "#ffffff" }}>
        <TextField
          fullWidth
          size="small"
          placeholder={activeTab === 1 ? "Rechercher un contact..." : "Rechercher un salon..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  fontSize="small"
                  sx={{ color: isDarkMode ? "#8696a0" : "#54656f" }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: isDarkMode ? "#202c33" : "#f0f2f5",
              borderRadius: 2,
              fontSize: "0.85rem",
              color: isDarkMode ? "#e9edef" : "#111b21",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "transparent" },
              "&.Mui-focused fieldset": { borderColor: currentTheme.accentColor },
            },
            "& .MuiInputBase-input::placeholder": {
              color: isDarkMode ? "#8696a0" : "#667781",
              opacity: 1,
            },
          }}
        />
      </Box>

      <Divider sx={{ borderColor: isDarkMode ? "#222d34" : "#e9edef" }} />

      {/* Rooms OR Private Chats List */}
      {activeTab === 0 ? (
        <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
          {filteredRooms.map((room) => {
            const isSelected = !isPrivateMode && room === currentRoomId;
            const hasNewMessages = newMessageRooms.has(room);

            return (
              <ListItem key={room} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => {
                    onSelectRoom(room);
                    onCloseMobileDrawer();
                  }}
                  sx={{
                    py: 1.2,
                    px: 2,
                    backgroundColor: isSelected
                      ? isDarkMode
                        ? "#2a3942"
                        : "#f0f2f5"
                      : "transparent",
                    borderLeft: isSelected ? `4px solid ${currentTheme.accentColor}` : "4px solid transparent",
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#202c33" : "#f5f6f6",
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 46 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        backgroundColor: isSelected
                          ? currentTheme.accentColor
                          : isDarkMode
                          ? "#202c33"
                          : "#e9edef",
                        color: isSelected ? "#ffffff" : isDarkMode ? "#8696a0" : "#54656f",
                      }}
                    >
                      <TagIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={isSelected || hasNewMessages ? "bold" : "normal"}
                        noWrap
                      >
                        {room}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}
                        noWrap
                      >
                        {hasNewMessages ? "Nouveau message !" : "Discussion de groupe"}
                      </Typography>
                    }
                  />

                  {hasNewMessages ? (
                    <Badge
                      badgeContent=" "
                      variant="dot"
                      color="secondary"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: currentTheme.accentColor,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                        },
                      }}
                    />
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDarkMode ? "#8696a0" : "#8696a0",
                        fontSize: "0.7rem",
                      }}
                    >
                      {roomMessages[room] || ""}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box sx={{ p: 1.2, pb: 0.6 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => setNewPrivateModalOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: currentTheme.accentColor,
                color: currentTheme.accentColor,
                "&:hover": {
                  borderColor: currentTheme.headerColor,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                },
              }}
            >
              Nouvelle discussion privée
            </Button>
          </Box>

          <List sx={{ flexGrow: 1, overflowY: "auto", p: 0 }}>
            {filteredPrivateChats.length === 0 ? (
              <Box sx={{ px: 2.5, py: 4, textAlign: "center" }}>
                <Typography variant="body2" sx={{ color: isDarkMode ? "#8696a0" : "#667781" }}>
                  Aucune discussion privée pour le moment.
                </Typography>
              </Box>
            ) : (
              filteredPrivateChats.map((chat) => {
                const isSelected = isPrivateMode && chat.id === currentPrivateChatId;
                const hasNewMessages = newPrivateChatIds.has(chat.id);
                const previewText = chat.lastMessage
                  ? `${chat.lastSenderId === currentUser?.uid ? "Vous : " : ""}${chat.lastMessage}`
                  : "Démarrez la conversation";

                return (
                  <ListItem key={chat.id} disablePadding>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => {
                        onSelectPrivateChat(chat.id);
                        onCloseMobileDrawer();
                      }}
                      sx={{
                        py: 1.2,
                        px: 2,
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? "#2a3942"
                            : "#f0f2f5"
                          : "transparent",
                        borderLeft: isSelected
                          ? `4px solid ${currentTheme.accentColor}`
                          : "4px solid transparent",
                        "&:hover": {
                          backgroundColor: isDarkMode ? "#202c33" : "#f5f6f6",
                        },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 46 }}>
                        <Avatar
                          src={chat.peerAvatar}
                          alt={chat.peerName}
                          sx={{ width: 36, height: 36 }}
                        >
                          {chat.peerName?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            fontWeight={isSelected || hasNewMessages ? "bold" : "normal"}
                            noWrap
                          >
                            {chat.peerName || "Utilisateur"}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            sx={{
                              color: hasNewMessages
                                ? currentTheme.accentColor
                                : isDarkMode
                                ? "#8696a0"
                                : "#667781",
                              fontWeight: hasNewMessages ? 600 : 400,
                              display: "block",
                            }}
                            noWrap
                          >
                            {previewText}
                          </Typography>
                        }
                      />

                      {hasNewMessages && (
                        <Badge
                          badgeContent=" "
                          variant="dot"
                          color="secondary"
                          sx={{
                            "& .MuiBadge-badge": {
                              backgroundColor: currentTheme.accentColor,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })
            )}
          </List>
        </Box>
      )}

      <ThemeSelectorModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      <EditProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      <NewPrivateChatModal
        open={newPrivateModalOpen}
        onClose={() => setNewPrivateModalOpen(false)}
        users={availableUsers}
        onSelectUser={(user) => {
          setNewPrivateModalOpen(false);
          if (onStartPrivateChatWithUser) {
            onStartPrivateChatWithUser(user);
          }
          onCloseMobileDrawer();
        }}
      />

      {/* Dialog for creating a new room */}
      <Dialog
        open={newRoomDialogOpen}
        onClose={() => setNewRoomDialogOpen(false)}
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
        <DialogTitle sx={{ fontWeight: "bold" }}>Créer un nouveau salon</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du salon"
            fullWidth
            variant="outlined"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Ex: Gaming, Musique, Projets..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateRoomSubmit(e);
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewRoomDialogOpen(false)} sx={{ color: isDarkMode ? "#8696a0" : "#54656f" }}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateRoomSubmit}
            variant="contained"
            disabled={!newRoomName.trim()}
            sx={{
              backgroundColor: currentTheme.headerColor,
              "&:hover": { backgroundColor: currentTheme.accentColor },
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onCloseMobileDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            border: "none",
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
}
