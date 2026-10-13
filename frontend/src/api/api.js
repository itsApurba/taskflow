import axios from "axios";
import { endExpiredSession } from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("access_token"))
    if (token) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A signed-in request answered 401 means the session is dead (expired token,
// or a user that no longer exists). Log out instead of leaving a half-working
// app; /auth/* answers 401 for a wrong password and stays with the form.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    if (response?.status === 401 && config?.headers?.Authorization && !config.url?.startsWith("/auth/")) {
      endExpiredSession();
    }
    return Promise.reject(error);
  }
);

export default api;