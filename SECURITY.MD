# Garantie de sécurité — DataShare

Ce document présente le scan de sécurité des dépendances, l'analyse de ses résultats et les décisions de sécurité prises dans l'application.

## 1. Scan de sécurité des dépendances

Deux scans sont utilisés, un par écosystème :

| Périmètre | Outil | Commande |
|---|---|---|
| Frontend (npm) | `npm audit` (base d'advisories GitHub) | `cd frontend && npm audit` |
| Backend (Composer) | `composer audit` (base FriendsOfPHP/security-advisories) | `cd backend && composer audit` |

## 2. Décision de sécurité

### Authentification et accès

- **JWT stateless** (LexikJWTAuthenticationBundle) : pas de session côté serveur, le token signé est porté dans l'en-tête `Authorization`. Adapté à une API REST consommée par une SPA.
- **Hachage des mots de passe utilisateurs** avec `algorithm: auto` de Symfony : l'algorithme le plus robuste disponible (bcrypt/argon2) est choisi automatiquement et migré de façon transparente lors des futures montées de version.
- **Règles d'accès explicites** (`backend/config/packages/security.yaml`, section `access_control`) : seuls `/auth/register`, `/auth/login`, l'upload anonyme (`POST /files`) et le téléchargement par token sont publics ; tout le reste (`/users`, gestion `/files`) exige un JWT valide (`IS_AUTHENTICATED_FULLY`).

### Partage de fichiers

- **Tokens de téléchargement aléatoires de 128 bits** (`bin2hex(random_bytes(16))`) : de plus le format du token est de plus contraint par une regex hexadécimale dans `access_control`.
- **Mot de passe optionnel sur les fichiers, haché** (`NativePasswordHasher`) avec longueur minimale de 6 caractères : jamais stocké en clair. Respect du minimum demandé dans les specifications. Le plus sure serait de rajouter des caractères spéciaux, d'alloger la longueur minimale (hors périmètre MVP)
- **Stockage sous le nom du token** : élimine le risque de path traversal ou de collision via un nom de fichier malveillant ; le nom original n'existe qu'en métadonnée en base.

### Périmètre réseau et secrets

- **CORS restreint** (NelmioCORS) : origines autorisées pilotées par la variable d'environnement `CORS_ALLOW_ORIGIN`, en-têtes limités à `Content-Type` et `Authorization`.
- **Secrets hors du code** : identifiants PostgreSQL et clés JWT injectés par variables d'environnement

### Points de vigilance assumés (hors périmètre MVP)

- Pas de limitation de débit (rate limiting) sur `/auth/login` ni sur l'upload anonyme : acceptable pour le MVP, à ajouter avant une mise en production réelle (`symfony/rate-limiter`).
- Pas d'analyse antivirus des fichiers téléversés : documenté comme évolution future.
