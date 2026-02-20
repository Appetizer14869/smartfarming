import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./pages/Chatbot";
import { Toaster } from "react-hot-toast";
import RecommendLive from "./pages/recommend_live";
import RecommendManual from "./pages/recommend_manual";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics"
import SavedAnalytics from "./pages/SavedAnalytics";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import Settings from "./pages/Settings";
import { NotificationProvider } from "./context/NotificationContext";
import FarmGuide from "./pages/FarmGuide";
import DiseaseDetection from "./pages/DiseaseDetection";



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <AnalyticsProvider>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
                <Chatbot />
              </ProtectedRoute>
            }
          >
            {/*Nested routes inside dashboard*/}
            <Route path="profile" element={<Profile/>}/>
            <Route path="recommend-manual" element={<RecommendManual/>}/>
            <Route path="recommend-live" element={<RecommendLive/>}/>
            <Route path="analytics" element={<Analytics/>}/>
            <Route path="saved-analytics" element={<SavedAnalytics/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="farm-guide" element={<FarmGuide />} />
            <Route path="disease-detection" element={<DiseaseDetection />} />
            </Route>
        </Routes>
        <Toaster position="top-center"/>
        </AnalyticsProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
