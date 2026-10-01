import { Platform } from "react-native";

// ─── API Base URL ─────────────────────────────────────────────────────────────
// Priority order:
//  1. EXPO_PUBLIC_API_URL  – set this in Vercel dashboard (production)
//  2. Localhost fallback   – for web dev on the same machine
//  3. LAN IP fallback      – for Expo Go on a physical device
//
// In Vercel's dashboard add:
//   EXPO_PUBLIC_API_URL = https://campusfind-backend.vercel.app/api
const DEV_LAN_IP = "192.168.1.7"; // ← your local machine IP for Expo Go

const getBaseUrl = () => {
  // Vercel injects EXPO_PUBLIC_* vars at build time → available as process.env
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web") {
    // Local web dev: proxy through same hostname to avoid CORS issues
    const host =
      typeof window !== "undefined" && window.location?.hostname
        ? window.location.hostname
        : "localhost";
    return `http://${host}:5000/api`;
  }

  // Expo Go on a physical device or emulator
  return `http://${DEV_LAN_IP}:5000/api`;
};

const API_BASE_URL = getBaseUrl();

export default API_BASE_URL;
