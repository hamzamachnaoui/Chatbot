import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext(null);

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
    const email = username.includes("@") ? username.trim() : `${username.trim().toLowerCase()}@chat.com`;
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (username, password, avatarUrl) => {
    const cleanUsername = username.trim();
    const email = cleanUsername.includes("@") ? cleanUsername : `${cleanUsername.toLowerCase()}@chat.com`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: cleanUsername,
      photoURL: avatarUrl,
    });
    // Update local state with latest profile
    setCurrentUser({ ...userCredential.user, displayName: cleanUsername, photoURL: avatarUrl });
    return userCredential.user;
  };

  const logout = async () => {
    return signOut(auth);
  };

  const updateUserAvatar = async (newAvatarUrl) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });
      setCurrentUser({ ...auth.currentUser, photoURL: newAvatarUrl });
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUserAvatar,
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

