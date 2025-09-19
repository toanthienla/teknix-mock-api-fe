import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ProjectEndpoints from "./pages/ProjectEndpoints.jsx";
import EndpointDetail from "@/pages/EndpointDetail.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/dashboard/:projectId" element={<ProjectEndpoints />} />

        <Route
          path="/dashboard/:projectId/endpoint/:endpointId"
          element={<EndpointDetail />}
        />
      </Routes>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}
