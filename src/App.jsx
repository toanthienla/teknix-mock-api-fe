import {Routes, Route, Navigate} from "react-router-dom";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import WelcomePage from "@/pages/WelcomePage.jsx";
// import AuthPage from "./pages/AuthPage";
import ProjectPage from "./pages/ProjectPage.jsx";
import ProjectDetail from "./pages/FolderPage.jsx";
import ProjectEndpoints from "./pages/FolderDetail.jsx";
import EndpointDetail from "@/pages/ResponsePage.jsx";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/hello" replace/>}/>

        {/* Auth pages */}
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignupPage/>}/>
        <Route path="/hello" element={<WelcomePage/>}/>

        {/*<Route path="/auth" element={<AuthPage/>}/>*/}

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<ProjectPage/>}/>

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
