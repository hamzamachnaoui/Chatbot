import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AuthCard from "../components/Auth/AuthCard";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/Common/LoadingScreen";

export default function AuthPage() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingScreen message="Vérification de la session..." />;
  }

  if (currentUser) {
    return <Navigate to="/chat/Général" replace />;
  }

  return <AuthCard onSuccess={() => navigate("/chat/Général")} />;
}

