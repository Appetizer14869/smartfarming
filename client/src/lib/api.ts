import axios from "axios"; 
import type { AxiosError, AxiosResponse } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized → clear storage and redirect
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ------------------------------
// 🔧 Helper functions
// ------------------------------
export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const register = async (name: string, email: string, password: string) => {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
};

export const getDashboardData = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

// Crop recommendation endpoints
export const recommendLive = async (payload: {
  N: number;
  P: number;
  K: number;
  ph: number;
  useCurrentLocation?: boolean;
  latitude?: number;
  longitude?: number;
}) => {
  const res = await api.post("/recommend/live", payload);
  return res.data;
};

export const recommendManual = async (payload: {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}) => {
  const res = await api.post("/recommend/manual", payload);
  return res.data;
};

export const getHistory = async (filters?: {
  crop?: string;
  city?: string;
  country?: string;
  start?: string;
  end?: string;
}) => {
  const params = new URLSearchParams(filters as Record<string, string>).toString();
  const res = await api.get(`/combined/history?${params}`);
  return res.data;
};


// ✅ Updated to match Flask route 
export const getManualHistory = async (filters?: { 
  crop?: string; 
  city?: string; 
  country?: string; 
  start?: string; 
  end?: string; 
}) => { 
  const params = new URLSearchParams(filters as Record<string, string>).toString(); 
  const res = await api.get(`/recommend/manual/history?${params}`); 
  return res.data; };

  // ✅ Live history 
export const getLiveHistory = async (filters?: { 
  crop?: string; 
  city?: string; 
  country?: string; 
  start?: string; 
  end?: string; 
}) => { 
  const params = new URLSearchParams(filters as Record<string, string>).toString(); 
  const res = await api.get(`/recommend/live/history?${params}`); 
  return res.data; };

// Chatbot endpoint
// Chatbot ask query endpoint
export const askChatbot = async (query: string) => {
    const res = await api.post("/chatbot/ask", { query });
    return res.data;  
};
//farm guide endpoints
// Fetch all farming guides
export const getAllFarmingGuides = async () => {
  const res = await api.get("farm_guide/");
  return res.data;
};

// Fetch farming guide by crop name
export const getFarmingGuideByCrop = async (crop: string) => {
  const res = await api.get(`/farm_guide/${crop}`);
  return res.data;
};

// Insert farming guides (via CSV upload or other means)
export const insertFarmingGuides = async () => {
  const res = await api.post("/farm_guide/insert");
  return res.data;
};

// Example for inserting new farming guides
// Call this function if you're going to upload guides to the backend.
export const insertFarmingGuidesCSV = async () => {
  const res = await api.post("/farm_guide/insert");
  return res.data;
};

