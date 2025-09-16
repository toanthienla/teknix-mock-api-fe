import { Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import MainContentSection from "./components/MainContentSection";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dashboard/:projectId" element={<MainContentSection />} />
    
    </Routes>
  );
}
