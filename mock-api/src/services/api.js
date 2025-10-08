import axios from 'axios';
import {API_ROOT} from "@/utils/constants.js";

const API = axios.create({
  baseURL: API_ROOT,
  withCredentials: true
});

export const login = (credentials) => API.post("/auth/login", credentials);
export const signup = (credentials) => API.post("/auth/register", credentials);
export const logout = () => API.post("/auth/logout");
