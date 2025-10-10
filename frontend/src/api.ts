import axios from "axios";

const API = axios.create({
  // baseURL: "https://meshspire-core-vjqd.onrender.com/api/v0",
  // baseURL:"http://localhost:8000/api/v0",
  baseURL:"https://meshspire.onrender.com/api/v0",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && config.headers) {
    // Use `set` to mutate AxiosHeaders safely
    if ("set" in config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});

export default API;