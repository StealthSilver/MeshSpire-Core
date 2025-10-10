import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://meshspire-core-prod.onrender.com/api/v0",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header if token exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default API;
