"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  isVerified?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (currentUser: User | null) => void;
  token: string;
  setToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// our hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>("");

  const value: AuthContextType = {
    currentUser,
    setCurrentUser,
    token,
    setToken,
  };

  return <AuthContext.Provider value={value}> {children}</AuthContext.Provider>;
};
