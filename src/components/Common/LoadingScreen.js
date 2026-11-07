import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

export default function LoadingScreen({ message = "Chargement de vos conversations..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#111b21",
        color: "#00a884",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          backgroundColor: "#202c33",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          color: "#00a884",
        }}
      >
        <ChatIcon sx={{ fontSize: 40 }} />
      </Box>
      <CircularProgress size={32} sx={{ color: "#00a884" }} />
      <Typography variant="body2" sx={{ color: "#8696a0", mt: 1 }}>
        {message}
      </Typography>
    </Box>
  );
}

