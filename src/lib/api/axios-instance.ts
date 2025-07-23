import axios from "axios";

export const axiosInstance = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://grs-bkbc.onrender.com/api",

  headers: {
    "Content-Type": "application/json",
  },
});
