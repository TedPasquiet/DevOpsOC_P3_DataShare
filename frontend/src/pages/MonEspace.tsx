import { useState } from "react";
import { Toolbar } from "../components/toolbar";
import { AuthModal } from "../components/AuthModal";
import { Footer } from "../components/footer";


export function MonEspace() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <main>
      <Toolbar/>
      {/* TODO
      Composant profil
        - Mobile
          Cross Or Bar , photo , Name
        - Desktop
          ajouter fichier, deconnexion
        structure différence desktop et mobile

      En commun 
      Mes fichiers 'texte'
      Switch components
      Liste image (filesInfo component to create?)
        - png texte cadenas (option: 3points)
        - png texte cadenas (option: supprimer accéder)


      Slide
        - Mobile
            Appeat onclick with bar, disapear with cross
            Contain footer
        - Desktop 
            Always present
            Contain footer 
      */}
    </main>
  );
}
