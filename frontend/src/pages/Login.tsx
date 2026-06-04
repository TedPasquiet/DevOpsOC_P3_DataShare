import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { AuthModal } from "../components/authModal";
import { Footer } from "../components/footer";

export function Login() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <main className="login-page">
      <Header onAuthClick={() => setModalOpen(true)} />
      <div className="login-content">
        <p className="title-text">Tu veux partager un fichier ?</p>
        <button className="supload-btn" onClick={() => navigate("/televersement")} aria-label="Téléverser un fichier">
          <img src="/Frame 3.png" alt="" className="supload-icon" />
        </button>
      </div>
      <Footer />
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
