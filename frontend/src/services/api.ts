import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  signup: async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => {
    const response = await api.post("/api/auth/signup", userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get("/health");
    return response.data;
  },

  checkDatabase: async () => {
    const response = await api.get("/health/db");
    return response.data;
  },
};

export default api;
