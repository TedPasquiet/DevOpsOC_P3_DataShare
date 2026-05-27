import { useState } from "react";
import { Header } from "../components/header";
import { AuthModal } from "../components/AuthModal";
import { Footer } from "../components/footer";

export function Login() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="login-page">
      <Header onAuthClick={() => setModalOpen(true)} />
      <div className="login-content">
        <p className="title-text">Tu veux partager un fichier ?</p>
        <img src="/Frame 3.png" alt="Upload Icon" className="supload-icon" />
      </div>
      <Footer />
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
