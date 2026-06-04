import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Telechargement } from "./pages/Telechargement";
import { Televersement } from "./pages/Televersement";
import { MonEspace } from "./pages/MonEspace";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { token, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? "/mon-espace" : "/login"} replace />} />
      <Route path="/login" element={token ? <Navigate to="/mon-espace" replace /> : <Login />} />
      <Route path="/telechargement" element={<Telechargement />} />
      <Route path="/televersement" element={<ProtectedRoute><Televersement /></ProtectedRoute>} />
      <Route path="/mon-espace" element={<ProtectedRoute><MonEspace /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
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
