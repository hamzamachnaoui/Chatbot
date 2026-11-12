import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useAuth } from "./AuthContext";

export const CHAT_THEMES = {
  whatsapp_classic: {
    id: "whatsapp_classic",
    name: "WhatsApp Classique",
    category: "light",
    headerColor: "#008069",
    headerTextColor: "#ffffff",
    accentColor: "#25d366",
    chatBg: "#efeae2",
    hasDoodle: true,
    sentBubble: "#d9fdd3",
    sentText: "#111b21",
    receivedBubble: "#ffffff",
    receivedText: "#111b21",
    timeSent: "#597063",
    timeReceived: "#667781",
    checkColor: "#53bdeb",
    inputBg: "#f0f2f5",
    surfaceColor: "#ffffff",
  },
  whatsapp_dark: {
    id: "whatsapp_dark",
    name: "WhatsApp Sombre",
    category: "dark",
    headerColor: "#202c33",
    headerTextColor: "#e9edef",
    accentColor: "#00a884",
    chatBg: "#0b141a",
    hasDoodle: true,
    sentBubble: "#005c4b",
    sentText: "#e9edef",
    receivedBubble: "#202c33",
    receivedText: "#e9edef",
    timeSent: "#8696a0",
    timeReceived: "#8696a0",
    checkColor: "#53bdeb",
    inputBg: "#202c33",
    surfaceColor: "#111b21",
  },
  ocean_blue: {
    id: "ocean_blue",
    name: "Bleu Océan",
    category: "light",
    headerColor: "#0284c7",
    headerTextColor: "#ffffff",
    accentColor: "#0ea5e9",
    chatBg: "#e0f2fe",
    hasDoodle: true,
    sentBubble: "#bae6fd",
    sentText: "#0369a1",
    receivedBubble: "#ffffff",
    receivedText: "#0f172a",
    timeSent: "#0284c7",
    timeReceived: "#64748b",
    checkColor: "#0284c7",
    inputBg: "#f0f9ff",
    surfaceColor: "#ffffff",
  },
  sunset_lavender: {
    id: "sunset_lavender",
    name: "Lavande & Violet",
    category: "light",
    headerColor: "#7c3aed",
    headerTextColor: "#ffffff",
    accentColor: "#8b5cf6",
    chatBg: "#f5f3ff",
    hasDoodle: true,
    sentBubble: "#ede9fe",
    sentText: "#4c1d95",
    receivedBubble: "#ffffff",
    receivedText: "#1e1b4b",
    timeSent: "#6d28d9",
    timeReceived: "#6b7280",
    checkColor: "#7c3aed",
    inputBg: "#faf5ff",
    surfaceColor: "#ffffff",
  },
  emerald_forest: {
    id: "emerald_forest",
    name: "Émeraude Menthe",
    category: "light",
    headerColor: "#047857",
    headerTextColor: "#ffffff",
    accentColor: "#10b981",
    chatBg: "#ecfdf5",
    hasDoodle: true,
    sentBubble: "#d1fae5",
    sentText: "#064e3b",
    receivedBubble: "#ffffff",
    receivedText: "#064e3b",
    timeSent: "#059669",
    timeReceived: "#6b7280",
    checkColor: "#047857",
    inputBg: "#f0fdf4",
    surfaceColor: "#ffffff",
  },
  blush_pink: {
    id: "blush_pink",
    name: "Rose Pêche",
    category: "light",
    headerColor: "#e11d48",
    headerTextColor: "#ffffff",
    accentColor: "#f43f5e",
    chatBg: "#fff1f2",
    hasDoodle: true,
    sentBubble: "#ffe4e6",
    sentText: "#881337",
    receivedBubble: "#ffffff",
    receivedText: "#4c0519",
    timeSent: "#be123c",
    timeReceived: "#6b7280",
    checkColor: "#e11d48",
    inputBg: "#fff5f5",
    surfaceColor: "#ffffff",
  },
  oled_midnight: {
    id: "oled_midnight",
    name: "Minuit Noir OLED",
    category: "dark",
    headerColor: "#18181b",
    headerTextColor: "#f4f4f5",
    accentColor: "#818cf8",
    chatBg: "#09090b",
    hasDoodle: false,
    sentBubble: "#27272a",
    sentText: "#fafafa",
    receivedBubble: "#18181b",
    receivedText: "#f4f4f5",
    timeSent: "#a1a1aa",
    timeReceived: "#71717a",
    checkColor: "#6366f1",
    inputBg: "#18181b",
    surfaceColor: "#121215",
  },
};

const ChatThemeContext = createContext(null);

export function ChatThemeProvider({ children }) {
  const { currentUser } = useAuth();
  const storageKey = currentUser ? `chatapp_theme_${currentUser.uid}` : "chatapp_theme_guest";

  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem(storageKey) || "whatsapp_classic";
  });

  const [doodleEnabled, setDoodleEnabled] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_doodle`);
    return saved !== null ? saved === "true" : true;
  });

  // When user changes, load user's personal theme preference (or reset to defaults)
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme && CHAT_THEMES[savedTheme]) {
      setThemeId(savedTheme);
    } else {
      setThemeId("whatsapp_classic");
    }
    const savedDoodle = localStorage.getItem(`${storageKey}_doodle`);
    if (savedDoodle !== null) {
      setDoodleEnabled(savedDoodle === "true");
    } else {
      setDoodleEnabled(true);
    }
  }, [storageKey]);

  const selectTheme = (newThemeId) => {
    if (CHAT_THEMES[newThemeId]) {
      setThemeId(newThemeId);
      localStorage.setItem(storageKey, newThemeId);
    }
  };

  const toggleDoodle = () => {
    setDoodleEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(`${storageKey}_doodle`, String(next));
      return next;
    });
  };

  const currentTheme = CHAT_THEMES[themeId] || CHAT_THEMES.whatsapp_classic;
  const isDarkMode = currentTheme.category === "dark";

  // Material-UI theme integrated with current chat theme
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          primary: {
            main: currentTheme.headerColor,
            contrastText: currentTheme.headerTextColor,
          },
          secondary: {
            main: currentTheme.accentColor,
          },
          background: {
            default: isDarkMode ? "#111b21" : "#f0f2f5",
            paper: isDarkMode ? "#202c33" : "#ffffff",
          },
        },
        typography: {
          fontFamily: [
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif",
          ].join(","),
        },
        shape: {
          borderRadius: 10,
        },
      }),
    [currentTheme, isDarkMode]
  );

  const value = {
    themeId,
    currentTheme,
    isDarkMode,
    doodleEnabled,
    allThemes: CHAT_THEMES,
    selectTheme,
    toggleDoodle,
  };

  return (
    <ChatThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ChatThemeContext.Provider>
  );
}

export function useChatTheme() {
  const context = useContext(ChatThemeContext);
  if (!context) {
    throw new Error("useChatTheme must be used within a ChatThemeProvider");
  }
  return context;
}

