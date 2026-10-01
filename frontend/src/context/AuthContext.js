import React, { createContext, useState, useEffect, useContext } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import axiosInstance, { setAuthToken } from "../api/axiosInstance";

// Cross-platform storage helper (SecureStore on mobile, localStorage on web)
const storage = {
  getItem: async (key) => {
    if (Platform.OS === "web") {
      return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    return await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      return;
    }
    return await SecureStore.deleteItemAsync(key);
  },
};

// Create the context object that screens will read from
const AuthContext = createContext();

// Keys used to persist data in the device's secure storage
const TOKEN_KEY = "campusfind_token";
const USER_KEY = "campusfind_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check storage on startup

  // On app startup: restore a previously saved session so the user
  // doesn't have to log in every time they open the app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await storage.getItem(TOKEN_KEY);
        const savedUser = await storage.getItem(USER_KEY);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setAuthToken(savedToken); // attach token to all future Axios requests
        }
      } catch (e) {
        console.log("Could not restore session:", e);
      } finally {
        setLoading(false); // done checking — let the navigator render
      }
    };
    restoreSession();
  }, []);

  // Register a 401 response interceptor so any screen that gets a 401
  // automatically logs the user out (expired or invalid token)
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response, // pass successful responses through unchanged
      (error) => {
        if (error.response?.status === 401) {
          logout(); // clear state and redirect to login
        }
        return Promise.reject(error);
      }
    );
    // Clean up the interceptor when the provider unmounts (good practice)
    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, []);

  // Save the user and token to state + storage + axios header
  const saveSession = async (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
    await storage.setItem(TOKEN_KEY, newToken);
    await storage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  // ── register ─────────────────────────────────────────────────────────────────
  const register = async (name, email, password, phone) => {
    const { data } = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
      phone,
    });
    await saveSession(data.token, data.user);
  };

  // ── login ─────────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await axiosInstance.post("/auth/login", { email, password });
    await saveSession(data.token, data.user);
  };

  // ── logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null); // remove Authorization header from axios
    await storage.deleteItem(TOKEN_KEY);
    await storage.deleteItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — screens call useAuth() instead of useContext(AuthContext) directly
export const useAuth = () => useContext(AuthContext);
