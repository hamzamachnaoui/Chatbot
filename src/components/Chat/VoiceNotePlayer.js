import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Typography, Slider, Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import MicIcon from "@mui/icons-material/Mic";
import { useChatTheme } from "../../contexts/ChatThemeContext";

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function VoiceNotePlayer({ audioUrl, isOwnMessage }) {
  const { currentTheme, isDarkMode } = useChatTheme();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      syncDuration();
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", syncDuration);
    audio.addEventListener("durationchange", syncDuration);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", syncDuration);
      audio.removeEventListener("durationchange", syncDuration);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSliderChange = (_, value) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    let nextRate = 1;
    if (playbackRate === 1) nextRate = 1.5;
    else if (playbackRate === 1.5) nextRate = 2;
    else nextRate = 1;

    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: { xs: 200, sm: 240 },
        py: 0.5,
      }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <IconButton
        onClick={togglePlay}
        sx={{
          backgroundColor: currentTheme.accentColor,
          color: "#ffffff",
          width: 36,
          height: 36,
          "&:hover": {
            backgroundColor: currentTheme.headerColor,
          },
        }}
      >
        {isPlaying ? <PauseIcon sx={{ fontSize: 20 }} /> : <PlayArrowIcon sx={{ fontSize: 20 }} />}
      </IconButton>

      {/* Progress & Duration */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Slider
          size="small"
          value={duration > 0 ? Math.min(currentTime, duration) : 0}
          max={duration > 0 ? duration : 100}
          disabled={duration <= 0}
          onChange={handleSliderChange}
          sx={{
            color: currentTheme.accentColor,
            height: 4,
            p: "6px 0",
            "& .MuiSlider-thumb": {
              width: 10,
              height: 10,
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.68rem",
              color: isOwnMessage ? currentTheme.timeSent : currentTheme.timeReceived,
            }}
          >
            {formatDuration(isPlaying ? currentTime : duration)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MicIcon
              sx={{
                fontSize: 14,
                color: currentTheme.accentColor,
              }}
            />
            {isPlaying && (
              <Button
                size="small"
                onClick={cyclePlaybackRate}
                sx={{
                  minWidth: "auto",
                  p: "1px 4px",
                  fontSize: "0.65rem",
                  borderRadius: 1,
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                  color: isOwnMessage ? currentTheme.sentText : currentTheme.receivedText,
                }}
              >
                {playbackRate}x
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

