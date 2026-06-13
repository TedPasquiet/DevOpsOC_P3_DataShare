# Plan de tests — DataShare

Ce document décrit la stratégie de tests de l'application : tests unitaires, tests end-to-end, critères d'acceptation, instructions d'exécution et suivi de la couverture de code.

## 1. Stack de test

| Type | Outil | Périmètre |
|---|---|---|
| Tests unitaires / composants | Jest 30 + ts-jest + React Testing Library | Frontend (`frontend/src`) |
| Tests end-to-end | Cypress 15 | Frontend + parcours utilisateur |
| Tests d'API manuels | Bruno (collection `bruno/`) | Backend Symfony (endpoints REST) |

> **Note backend** : l'API Symfony est validée par la collection Bruno (requêtes sur tous les endpoints `/auth`, `/users`, `/files`) et indirectement par les tests end-to-end.

## 2. Tests unitaires sur les fonctionnalités du MVP

Les tests unitaires couvrent les fonctionnalités obligatoires du MVP, page par page et composant par composant :

| Fonctionnalité MVP | Fichier de test |
|---|---|
| Authentification (connexion / inscription, modale) | `src/components/__tests__/authModal.test.tsx` |
| Téléversement d'un fichier (formulaire, options d'expiration, mot de passe) | `src/pages/__tests__/Televersement.test.tsx` |
| Téléchargement d'un fichier (lien public, mot de passe, expiration) | `src/pages/__tests__/Telechargement.test.tsx` |
| Espace personnel (liste des fichiers, taille, date, tags) | `src/pages/__tests__/MonEspace.test.tsx` |
| Composants UI partagés (header, footer, boutons, champs, callouts, select, switch) | `src/components/__tests__/*.test.tsx` |
| Accessibilité (bouton de contraste élevé, préférence mémorisée) | `src/components/__tests__/HighContrastToggle.test.tsx` |

Soit **12 fichiers de tests unitaires** (94 tests) exécutés en environnement `jsdom` (configuration : `frontend/jest.config.cjs`).

## 3. Tests end-to-end (Cypress)

| Spec | Scénarios | Parcours couvert |
|---|---|---|
| `auth-modal.cy.ts` | 7 | Ouverture/fermeture de la modale, saisie login, bascule login ↔ inscription |
| `header.cy.ts` | 5 | Titre de l'application, bouton « Se connecter » / « Mon espace » selon l'état de connexion, ouverture de la modale, navigation vers `/mon-espace` |
| `high-contrast.cy.ts` | 4 | Bouton de contraste élevé : désactivé par défaut, bascule au clic, persistance après rechargement et lors de la navigation entre pages |
| `mon-espace.cy.ts` | 3 | Rendu de l'espace personnel (session et liste de fichiers simulées via `cy.intercept`), responsive mobile/desktop |
| `navigation.cy.ts` | 5 | Rendu de la page d'accueil sur `/` et `/login`, redirection des routes inconnues vers `/`, protection de `/mon-espace` (redirection si déconnecté, rendu si connecté) |
| `telechargement.cy.ts` | 15 | Fichier protégé par mot de passe (activation du bouton), fichier non protégé, fichier expiré (callouts info/warning/erreur), responsive mobile — données de fichier simulées via `cy.intercept` sur `GET /files/:token/info` |

Soit **39 scénarios Cypress**, tous passants (`npm run cy:run` — 39/39).

Les scénarios critiques au sens du MVP sont : le parcours d'authentification, le téléchargement protégé par mot de passe, la gestion de l'expiration et la navigation/redirection.

> **Note** : les specs `header`, `mon-espace`, `navigation` et `telechargement` ont été réécrites pour suivre le routing actuel (`/` et `/login` affichent la page d'accueil, `/mon-espace` est une route protégée, `/telechargement` charge les infos du fichier via `GET /files/:token/info`). La commande personnalisée `cy.loginAs(path)` (`cypress/support/commands.ts`) simule une session authentifiée en seedant `localStorage.jwt` et en stubant `GET /users/me`.

## 4. Critères d'acceptation

Un build est considéré comme acceptable si **tous** les critères suivants sont remplis :

1. **100 % des tests unitaires passent** (`npm test` sans échec ni test skippé non justifié).
2. **100 % des scénarios Cypress passent** (`npm run cy:run` en headless).
3. **La couverture de code est ≥ 70 %**.
4. **Le lint passe sans erreur** (`npm run lint`).
5. **Le build de production réussit** (`npm run build`, incluant la vérification TypeScript `tsc -b`).
6. Aucune régression sur les parcours critiques : connexion, téléversement, téléchargement protégé, expiration.
7. Tout nouveau développement doit être livré avec ses tests unitaires, et scénario e2e si nouvel users story.

## 5. Instructions d'exécution

Toutes les commandes s'exécutent depuis `frontend/` :

```bash
cd frontend
npm install               # première fois uniquement
```

### Tests unitaires

```bash
npm test                  # exécution unique
npm run test:watch        # mode watch (développement)
npm run test:coverage     # avec rapport de couverture
```

### Tests end-to-end

Les tests Cypress nécessitent le serveur de développement :

```bash
npm run dev               # terminal 1 — lance Vite
npm run cy:run            # terminal 2 — exécution headless (CI)
npm run cy:open           # ou : interface graphique Cypress
```

### Backend (tests d'API)

```bash
cd backend
docker compose up -d      # base PostgreSQL
symfony serve             # ou serveur PHP de votre choix
```

Puis ouvrir la collection `bruno/` avec [Bruno](https://www.usebruno.com/) et exécuter les requêtes (auth, upload, download, tags, suppression).

## 6. Couverture de code

- **Objectif minimal : 70 %** des statements.
- **Couverture actuelle (rapport Jest, `frontend/coverage/`)** :

| Métrique | Couverture |
|---|---|
| Statements | **75,11 %** |
| Branches | **71,14 %** |
| Functions | **81,03 %** |
| Lines | **79,34 %** |

Pour régénérer le rapport et l'ouvrir dans le navigateur :

```bash
cd frontend
npm run test:coverage
open coverage/lcov-report/index.html
```

!!!TODO!!! : exécuter `npm run test:coverage`, ouvrir `coverage/lcov-report/index.html` et enregistrer la capture sous `livrable/coverage-report.png`.*
