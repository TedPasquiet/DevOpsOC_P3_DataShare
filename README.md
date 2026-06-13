# DataShare

DataShare est une application de partage de fichiers : un utilisateur authentifié dépose un fichier (avec une date d'expiration et un mot de passe optionnel), et obtient un lien de téléchargement à partager. L'upload anonyme est également possible.

Projet réalisé dans le cadre du parcours **Expert DevOps OpenClassrooms — Projet 3 : Pilotez le développement d'une solution informatique**.

- Lien Figma (composants front) : https://www.figma.com/design/XEinfkoE7mXktCCfMs3E8c/DataShare?node-id=0-1&p=f

## Sommaire

- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
- [Installation manuelle](#installation-manuelle)
  - [1. Base de données](#1-base-de-données)
  - [2. Backend (Symfony)](#2-backend-symfony)
  - [3. Frontend (React)](#3-frontend-react)
- [Variables d'environnement](#variables-denvironnement)
- [Lancer l'application](#lancer-lapplication)
- [Documentation API (Swagger)](#documentation-api-swagger)
- [Tests](#tests)
- [Documentation complémentaire](#documentation-complémentaire)

## Stack technique

| Couche | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router 7, Jest, Cypress |
| Backend | Symfony 8, PHP ≥ 8.4, Doctrine ORM 3, LexikJWTAuthenticationBundle, NelmioApiDocBundle (Swagger/OpenAPI) |
| Base de données | PostgreSQL 16 |
| Infra locale | Docker / Docker Compose (base de données) |

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose (pour la base de données)
- [PHP](https://www.php.net/) ≥ 8.4 et [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) ≥ 20 et npm
- (Optionnel) [Symfony CLI](https://symfony.com/download) pour `symfony server:start`

## Installation rapide

Un script automatise l'installation complète de l'environnement de développement local :

```bash
./setup.sh
```

Ce script :

1. Démarre le conteneur PostgreSQL (`backend/compose.yaml`).
2. Installe les dépendances backend (`composer install`).
3. Génère la paire de clés JWT si elle n'existe pas encore (`backend/config/jwt/`).
4. Exécute les migrations Doctrine puis charge les fixtures de démonstration.
5. Installe les dépendances frontend (`npm install`).

Il ne démarre pas les serveurs d'application (Symfony / Vite) : voir [Lancer l'application](#lancer-lapplication) ci-dessous.

## Installation manuelle

### 1. Base de données

PostgreSQL est lancé via Docker Compose. Le port hôte exposé par défaut est `5433` (configurable dans `backend/compose.override.yaml` si déjà utilisé sur votre machine).

```bash
cd backend
docker compose up -d database
```

### 2. Backend (Symfony)

```bash
cd backend
composer install

# Génère la paire de clés JWT (config/jwt/private.pem et public.pem)
php bin/console lexik:jwt:generate-keypair

# Crée le schéma de base de données
php bin/console doctrine:migrations:migrate

# (Optionnel) charge des données de démonstration
php bin/console doctrine:fixtures:load

# Lance le serveur (Symfony CLI)
symfony server:start
# ou, sans Symfony CLI :
php -S 127.0.0.1:8000 -t public
```

L'API est alors disponible sur `http://localhost:8000`.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

L'application est alors disponible sur `http://localhost:5173` (port par défaut de Vite).

> ⚠️ L'URL de l'API backend est actuellement codée en dur (`http://localhost:8000`) dans `frontend/src/lib/api.ts` et `frontend/src/pages/Telechargement.tsx`. Si le backend tourne sur une autre adresse/port, ces fichiers doivent être mis à jour.

## Variables d'environnement

### Backend (`backend/.env`, surchargeable dans `backend/.env.local`)

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | DSN de connexion PostgreSQL | `postgresql://app:!ChangeMe!@127.0.0.1:5433/app?serverVersion=16&charset=utf8` |
| `CORS_ALLOW_ORIGIN` | Regex des origines autorisées (CORS) | `^https?://(localhost\|127\.0\.0\.1)(:[0-9]+)?$` |
| `JWT_SECRET_KEY` / `JWT_PUBLIC_KEY` | Chemins des clés JWT (générées via `lexik:jwt:generate-keypair`) | `%kernel.project_dir%/config/jwt/private.pem` |
| `JWT_PASSPHRASE` | Passphrase de la clé privée JWT | *(à générer, secret)* |

### Base de données (`backend/compose.yaml` / `compose.override.yaml`)

| Variable | Description | Défaut |
|---|---|---|
| `POSTGRES_DB` | Nom de la base | `app` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `app` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | `!ChangeMe!` |
| `POSTGRES_VERSION` | Version de l'image PostgreSQL | `16` |

⚠️ Ne jamais committer de vrais secrets (`.env.local` est ignoré par Git). Voir `SECURITY.md` pour la gestion des secrets en production.

## Lancer l'application

Une fois la base de données, le backend et le frontend démarrés :

1. Backend API : `http://localhost:8000`
2. Frontend : `http://localhost:5173`
3. Créer un compte via `/auth/register`, se connecter via `/auth/login`, puis uploader/partager un fichier depuis l'interface.

## Documentation API (Swagger)

La documentation interactive de l'API (générée via [NelmioApiDocBundle](https://github.com/nelmio/NelmioApiDocBundle), au format OpenAPI 3) est disponible une fois le backend démarré :

- Interface Swagger : `http://localhost:8000/api/doc`
- Spécification OpenAPI (JSON) : `http://localhost:8000/api/doc.json`

Ces routes sont accessibles sans authentification. Pour tester les endpoints protégés (préfixés JWT), récupérer un token via `/auth/login` puis l'ajouter via le bouton « Authorize » (schéma `bearerAuth`, en-tête `Authorization: Bearer <token>`).

## Tests

| Périmètre | Commande |
|---|---|
| Backend (PHPUnit) | `cd backend && php bin/phpunit` |
| Frontend (unitaire, Jest) | `cd frontend && npm test` |
| Frontend (e2e, Cypress) | `cd frontend && npm run cy:run` |
| Lint frontend | `cd frontend && npm run lint` |
| Audit sécurité | `cd frontend && npm audit` / `cd backend && composer audit` |

Détails des scénarios de test dans [`TESTING.md`](TESTING.md).

## Documentation complémentaire

- [`TESTING.md`](TESTING.md) — plan et scénarios de test
- [`SECURITY.md`](SECURITY.md) — choix et garanties de sécurité
- [`PERF.md`](PERF.md) — tests de performance (k6) et budgets front
- [`MAINTENANCE.md`](MAINTENANCE.md) — procédures de mise à jour des dépendances
- [`bruno/`](bruno) — collection de requêtes API (Bruno) pour tester l'API manuellement
- `http://localhost:8000/api/doc` — documentation interactive Swagger/OpenAPI de l'API (voir [Documentation API (Swagger)](#documentation-api-swagger))
