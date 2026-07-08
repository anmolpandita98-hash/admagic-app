import axios from "axios";
import { auth } from "../firebase";

/**
 * Shared axios instance for all authenticated management API calls.
 * Attaches the signed-in user's Firebase ID token as a Bearer header so the
 * Express `requireAuth` middleware can verify identity server-side. The Firebase
 * SDK caches and auto-refreshes the token, so getIdToken() is NOT force-refreshed
 * (passing `true` would hammer the token endpoint and add latency per request).
 */
export const api = axios.create();

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
