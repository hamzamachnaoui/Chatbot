import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

// Safely format any username to a valid RFC email for Firebase Auth
export function formatUsernameToEmail(username) {
  if (!username) return "";
  if (username.includes("@")) return username.trim();

  // Normalize: remove accents, replace spaces/special chars with underscores
  const clean = username
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_.-]/g, "_");

  return `${clean || "user"}@chat.com`;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username, password) => {
    const email = formatUsernameToEmail(username);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (username, password, avatarUrl) => {
    const cleanUsername = username.trim();
    const email = formatUsernameToEmail(cleanUsername);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: cleanUsername,
      photoURL: avatarUrl,
    });
    setCurrentUser({
      ...userCredential.user,
      displayName: cleanUsername,
      photoURL: avatarUrl,
    });
    return userCredential.user;
  };

  const loginAsGuest = async (nickname, avatarUrl) => {
    const cleanNickname = nickname?.trim() || `Invité_${Math.floor(1000 + Math.random() * 9000)}`;
    const userCredential = await signInAnonymously(auth);
    await updateProfile(userCredential.user, {
      displayName: cleanNickname,
      photoURL: avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
    });
    setCurrentUser({
      ...userCredential.user,
      displayName: cleanNickname,
      photoURL: avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
    });
    return userCredential.user;
  };

  const logout = async () => {
    return signOut(auth);
  };

  const updateUserProfile = async ({ displayName, photoURL }) => {
    if (auth.currentUser) {
      const updates = {};
      if (displayName) updates.displayName = displayName.trim();
      if (photoURL) updates.photoURL = photoURL;
      await updateProfile(auth.currentUser, updates);
      setCurrentUser((prev) => ({
        ...prev,
        displayName: updates.displayName || prev?.displayName,
        photoURL: updates.photoURL || prev?.photoURL,
      }));
    }
  };

  const updateUserAvatar = async (newAvatarUrl) => {
    return updateUserProfile({ photoURL: newAvatarUrl });
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    loginAsGuest,
    logout,
    updateUserAvatar,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
