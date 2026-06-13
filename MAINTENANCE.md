# Documentation de maintenance — DataShare

Ce document décrit les procédures de mise à jour des dépendances, leur fréquence et leurs risques.

## 1. Vue d'ensemble des dépendances

| Écosystème | Gestionnaire | Fichiers de verrouillage |
|---|---|---|---|
| Frontend | npm | `frontend/package-lock.json` | React 19, React Router 7, Vite 8, TypeScript 6, Jest 30, Cypress 15 |
| Backend | Composer | `backend/composer.lock` | PHP ≥ 8.4, Symfony 8.0.*, Doctrine ORM 3, LexikJWT 3, NelmioApiDocBundle 5 |
| Infrastructure | Docker Compose | `backend/compose.yaml` | PostgreSQL 16 (alpine) |

## 2. Procédures de mise à jour

Toute mise à jour suit le même processus :

1. Créer une branche dédiée (ex. `feat/featureName`).
2. Mettre à jour (voir commandes ci-dessous).
3. Relancer les scans de sécurité (`npm audit`, `composer audit` — voir `SECURITY.md`).
4. Valider avec les critères d'acceptation de `TESTING.md` : tests unitaires, e2e Cypress, lint, build.
5. Commit conventionnel (`chore(deps): ...`), pull request, merge.

### Frontend (npm)
```bash
cd frontend
npm outdated                  # 1. inventaire des versions en retard
npm update                    # 2. mises à jour dans les plages semver du package.json
npm audit fix                 # 3. correctifs de sécurité sans saut majeur
npm install <pkg>@latest      # 4. saut de version majeure : paquet par paquet
npm test && npm run cy:run && npm run build   # 5. validation
```

### Backend (Composer)
```bash
cd backend
composer outdated --direct            # 1. inventaire
composer update --with-all-dependencies   # 2. mise à jour dans les contraintes du composer.json
composer audit                        # 3. scan de sécurité
composer require vendor/paquet:^X.0   # 4. saut de version majeure : paquet par paquet
php bin/console doctrine:migrations:migrate   # 5. si une mise à jour introduit des migrations
```

### Base de données (Docker)
L'image PostgreSQL est épinglée par variable (`POSTGRES_VERSION`, défaut 16). Une montée de version majeure de PostgreSQL nécessite un dump/restore (`pg_dump` avant montée, restore après) — ne jamais simplement changer le tag sur un volume existant.

## 3. Fréquence

| Type de mise à jour | Fréquence | Déclencheur |
|---|---|---|
| **Correctifs de sécurité** | Immédiate (sous 48 h) | Alerte `npm audit` / `composer audit` / Dependabot |
| **Patches et mineures** (plages semver) | Mensuelle | Routine de maintenance |
| **Majeures** (React, Vite, Symfony, PostgreSQL…) | Trimestrielle, planifiée | Évaluation au cas par cas, une majeure à la fois |
| **Scan de sécurité seul** | Mensuel minimum + à chaque PR de dépendances | Routine |

## 4. Risques et parades

| Risque | Exemple concret dans ce projet |
|---|---|---|
| **Breaking changes en version majeure** | React 19 → 20, Vite 8 → 9, Symfony 8 → 9 : APIs supprimées, dépréciations | Lire le changelog/guide de migration ; une majeure à la fois ; suite de tests complète avant merge |
| **Régression fonctionnelle silencieuse** | Changement de comportement de React Router sur les redirections | Les 32 scénarios Cypress couvrent les parcours critiques ; couverture unitaire ~98 % |
| **Incompatibilité de paires** | `ts-jest` ↔ `jest`, `@vitejs/plugin-react` ↔ `vite`, `doctrine/orm` ↔ `doctrine-bundle` | Mettre à jour les paires ensemble ; `npm ls` / `composer why-not` en cas de conflit |
| **Désynchronisation du lockfile** | `package.json` modifié sans regénérer le lock | Toujours committer `package-lock.json` / `composer.lock`|
| **Migration de schéma destructive** | Mise à jour Doctrine générant une migration qui altère les tables `user`/`file` | Relire chaque migration générée ; sauvegarde de la base avant `migrate` en production |
| **Faille introduite par une nouvelle dépendance** | Dépendance vulnérable | `npm audit` / `composer audit` systématiques dans la procédure |
