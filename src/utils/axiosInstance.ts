import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_APP_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("staffuser_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;