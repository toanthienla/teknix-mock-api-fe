import {Routes, Route, Navigate} from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail.jsx";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import ProjectEndpoints from "./pages/FolderDetail.jsx";
import EndpointDetail from "@/pages/EndpointDetail.jsx";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/verify" element={<VerifyEmail/>}/>
        <Route path="/forgot-password" element={<Navigate to="/login"/>}/>

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardPage/>}/>

        <Route path="/dashboard/:projectId" element={<ProjectDetail/>}/>
        <Route path="/dashboard/:projectId/folder/:folderId" element={<ProjectEndpoints/>}/>

        <Route
          path="/dashboard/:projectId/endpoint/:endpointId" element={<EndpointDetail/>}
        />
      </Routes>

      <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
    </>
  );
}
