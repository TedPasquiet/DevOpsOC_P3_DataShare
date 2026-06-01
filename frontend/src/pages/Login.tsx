import { useState } from "react";
import { Header } from "../components/header";
import { AuthModal } from "../components/authModal";
import { Footer } from "../components/footer";

export function Login() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="login-page">
      <Header onAuthClick={() => setModalOpen(true)} />
      <div className="login-content">
        <h2 className="title-text">Tu veux partager un fichier ?</h2>
        <img src="/Frame 3.png" alt="Illustration de l'interface de partage de fichier" className="supload-icon" />
      </div>
      <Footer />
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
