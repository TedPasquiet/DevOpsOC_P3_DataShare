# Scripts de déploiement / installation

## `setup.sh`

Bootstrap complet de l'environnement de développement local :

1. Démarre le conteneur PostgreSQL (`backend/compose.yaml`).
2. Installe les dépendances backend (`composer install`).
3. Génère la paire de clés JWT si elle n'existe pas encore (`config/jwt/`).
4. Exécute les migrations Doctrine puis charge les fixtures de démonstration.
5. Installe les dépendances frontend (`npm install`).

```bash
./scripts/setup.sh
```

Prérequis : Docker, PHP ≥ 8.4 + Composer, Node.js + npm (voir le [README principal](../README.md#prérequis)).

Ce script ne démarre pas les serveurs d'application (Symfony / Vite) : voir le README principal pour les lancer.
