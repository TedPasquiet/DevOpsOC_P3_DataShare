import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Telechargement } from "./pages/Telechargement";
import { Televersement } from "./pages/Televersement";
import { MonEspace } from "./pages/MonEspace";
import { Login } from "./pages/Login";
import { HighContrastToggle } from "./components/HighContrastToggle";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/televersement" element={<Televersement />} />
      <Route path="/telechargement" element={<Telechargement />} />
      <Route path="/mon-espace" element={<ProtectedRoute><MonEspace /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
