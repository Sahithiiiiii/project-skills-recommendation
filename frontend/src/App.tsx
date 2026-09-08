import { BrowserRouter, Navigate, NavLink, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import CareerDetailsPage from "./pages/CareerDetailsPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import RecommendationsPage from "./pages/RecommendationsPage";
import RegisterPage from "./pages/RegisterPage";
import SetupProfilePage from "./pages/SetupProfilePage";
import "./App.css";

function AppShell() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="app-shell">
      {isAuthenticated && (
        <header className="app-header">
          <NavLink className="brand" to="/recommendations">
            <span className="brand-mark">PF</span>
            <span>PathForge</span>
          </NavLink>
          <nav className="main-nav">
            <NavLink to="/recommendations">Recommendations</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </nav>
          <div className="header-account">
            <span>{user?.name}</span>
            <button className="button-quiet" onClick={logout}>Sign out</button>
          </div>
        </header>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/setup-profile" element={<SetupProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/careers/:careerId" element={<CareerDetailsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/recommendations" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;