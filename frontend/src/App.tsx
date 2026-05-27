import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { Telechargement } from "./pages/Telechargement";
import { Televersement } from "./pages/Televersement";
import { MonEspace } from "./pages/MonEspace";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige "/" vers la page de login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/telechargement" element={<Telechargement />} />
        <Route path="/televersement" element={<Televersement />} />
        <Route path="/mon-espace" element={<MonEspace />} />

        {/* Fallback : page inconnue → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
