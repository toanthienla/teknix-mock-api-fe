import axios from 'axios';
import {API_ROOT} from "@/utils/constants.js";

const API = axios.create({
  baseURL: API_ROOT,
  withCredentials: true
});

// -------------------- RESPONSE INTERCEPTOR --------------------
let isRefreshing = false;
let subscribers = [];

const subscribeTokenRefresh = (cb) => subscribers.push(cb);
const onRefreshed = () => {
  subscribers.forEach((cb) => cb());
  subscribers = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu access token hết hạn → backend trả 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh → chờ refresh xong rồi gọi lại request
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(API(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi endpoint refresh token (cookie tự gửi kèm)
        await axios.post(`${API_ROOT}/auth/refresh`, {}, {withCredentials: true});
        isRefreshing = false;
        onRefreshed(); // gọi lại các request đang chờ
        return API(originalRequest); // retry request cũ
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        isRefreshing = false;

        // Nếu refresh thất bại → logout user
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// -------------------- EXPORT API METHODS --------------------

export const login = (credentials) =>
  API.post("/auth/login", credentials); // backend tự set cookie

export const signup = (credentials) =>
  API.post("/auth/register", credentials);

export const logout = () => API.post("/auth/logout"); // backend clear cookie

export const getCurrentUser = () => API.get("/auth/me"); // check user hiện tại

// export async function getCentrifugoToken() {
//   const res = await fetch(`${API_ROOT}/centrifugo/conn-token`, {
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error("Cannot get Centrifugo token");
//   return res.json();
// }
//
// export async function getSubToken(userId, channel) {
//   const res = await fetch(
//     `${API_ROOT}/centrifugo/sub-token?channel=${encodeURIComponent(channel)}`,
//     {
//       method: "GET",
//       credentials: "include", // gửi cookie để backend biết user nào
//     }
//   );
//
//   if (!res.ok) throw new Error("Cannot get sub token");
//   return await res.json(); // { token, user_id, channel, exp }
// }

export async function getEndpointToken(endpointId) {
  const res = await fetch(`${API_ROOT}/centrifugo/endpoint-connect-token`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint_id: Number(endpointId) })
    }
  );

  if (!res.ok) throw new Error("Failed to get endpoint token");
  return await res.json();
}

export async function getProjectConnectToken(projectId) {
  const res = await fetch(`http://localhost:3000/centrifugo/project-connect-token`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      project_id: Number(projectId),
      include_subs: true
    })
  });

  if (!res.ok) throw new Error("Failed to get project connect token");
  return await res.json(); // { token, user_id, channels, ... }
}