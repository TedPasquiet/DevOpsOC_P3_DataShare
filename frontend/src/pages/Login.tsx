import { Header } from "../components/header";
import Frame from "../../public/Frame 3.png";

export function Login() {
  return (
    <main className="login-page">
      <Header />
      <div className="login-content">
        <p className="title-text">Tu veux partager un fichier ?</p>
        <img src={Frame} alt="Upload Icon" className="upload-icon" />
      </div>
    </main>
  );
}
