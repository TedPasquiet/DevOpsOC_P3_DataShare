# DataShare — Frontend

Application React (TypeScript + Vite) du projet DataShare. Voir le [README principal](../README.md) pour une présentation générale et l'installation complète (backend + base de données).

## Stack

- React 19 + React Router 7
- Vite (dev server / build)
- Jest + Testing Library (tests unitaires)
- Cypress (tests end-to-end)
- ESLint

## Installation

```bash
npm install
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement Vite (`http://localhost:5173`) |
| `npm run build` | Vérifie les types (`tsc -b`) puis build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm run lint` | Lint ESLint du code source |
| `npm test` | Tests unitaires (Jest) |
| `npm run test:watch` | Tests unitaires en mode watch |
| `npm run test:coverage` | Tests unitaires avec rapport de couverture |
| `npm run cy:open` | Ouvre l'interface Cypress (tests e2e interactifs) |
| `npm run cy:run` | Exécute les tests Cypress en mode headless |

## Configuration de l'API

L'URL de l'API backend (`http://localhost:8000`) est définie en dur dans :

- `src/lib/api.ts`
- `src/pages/Telechargement.tsx`

Si le backend Symfony tourne sur une autre adresse/port, mettre à jour ces deux fichiers en conséquence.

## Structure

```
src/
├── components/   # Composants UI réutilisables (header, footer, modales, etc.)
├── pages/        # Pages de l'application (Login, Téléversement, Téléchargement, MonEspace)
├── lib/          # Helpers (appels API, etc.)
└── ...
```

## Tests e2e (Cypress)

Les scénarios Cypress nécessitent que le backend (et sa base de données) ainsi que le frontend soient démarrés. Voir [`../TESTING.md`](../TESTING.md) pour le détail des scénarios couverts.
