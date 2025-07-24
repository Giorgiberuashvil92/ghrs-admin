import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      : process.env.NEXT_PUBLIC_API_URL || 'https://ghrs-backend.onrender.com/api',

  headers: {
    "Content-Type": "application/json",
  },
});
