# Suivi de performance — DataShare

## 1. Test de performance backend (k6)

### Plan

- **Outil** : [k6](https://k6.io/) (`brew install k6`).
- **Endpoints testés** :
  - `GET /files/{token}/info` — c'est l'endpoint public le plus sollicité (consulté à chaque ouverture d'un lien de partage, sans authentification) et il combine routage Symfony + requête Doctrine.
  - `POST /auth/login` — endpoint d'authentification, sensible car il combine vérification du mot de passe (hash) et émission d'un JWT.
- **Scénario prévu** (identique pour les deux scripts) : montée en charge progressive — 10 utilisateurs virtuels pendant 30 s, puis 50 VUs pendant 1 min, puis retour à 0 sur 15 s.
- **Seuils (thresholds k6)** : identiques pour les deux scripts.
  - `http_req_duration p(95) < 200 ms`
  - `http_req_duration p(99) < 500 ms`
  - `http_req_failed < 1 %`

Script `perf/k6-info.js` :

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/files/${__ENV.TOKEN}/info`);
  check(res, { 'status 200': (r) => r.status === 200 });
}
```
Récupération d'un token valide :
```bash
echo "test" > /tmp/k6test.txt
curl -s -X POST http://localhost:8000/files -F "file=@/tmp/k6test.txt" -F "expires_in=7"
```

Exécution : `k6 run -e BASE_URL=http://localhost:8000 -e TOKEN=<token> perf/k6-info.js`

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const payload = JSON.stringify({
    email: __ENV.EMAIL,
    password: __ENV.PASSWORD,
  });

  const res = http.post(`${__ENV.BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'has token': (r) => JSON.parse(r.body).token !== undefined,
  });
}
```

Exécution : `k6 run -e BASE_URL=http://localhost:8000 -e EMAIL=<email> -e PASSWORD=<password> perf/k6-login.js`
!! Si un rate limiting est mis en place sur `/auth/login`, le test à 50 VUs peut générer des `429` — à surveiller dans les résultats !!

### Résultats et interprétation

#### `k6-info.js` — `GET /files/{token}/info`

Exécuté en local le 2026-06-10 (50 VUs max, 21 529 requêtes) :

| Métrique | Résultat | Seuil | Statut |
|---|---|---|---|
| `http_req_duration` p(95) | 213 ms | < 200 ms |  légèrement dépassé |
| `http_req_duration` p(99) | 277 ms | < 500 ms | ✅ |
| `http_req_duration` avg | 107 ms | — | — |
| `http_req_failed` | 0 % | < 1 % | ✅ |
| Débit | ~205 req/s | — | — |

**Interprétation** : aucune erreur sous charge (50 VUs), temps de réponse moyen autour de 107 ms. Le p95 dépasse légèrement le seuil de 200 ms (213 ms) en environnement local non optimisé (Docker, machine de dev) ; le p99 reste large­ment sous 500 ms. Pas de risque critique identifié, mais une marge de progression existe (cache HTTP/index Doctrine sur la recherche par token).

#### `k6-login.js` — `POST /auth/login`

## 2. Budget de performance côté front

> Côté back, le test k6 ci-dessus valide la partie temps de réponse serveur.

Budgets cibles pour le build de production (`npm run build`, dossier `frontend/dist/`) :

| Indicateur | Budget |
|---|---|
| Bundle JS principal (gzip) | < 200 ko |
| CSS total (gzip) | < 50 ko |
| Lighthouse Performance (page Téléchargement) | ≥ 90 |
| First Contentful Paint | < 1,8 s |
| Largest Contentful Paint | < 2,5 s |

## 3. Suivi des métriques

Métriques suivies et où les relever :

| Métrique | Source | Cible |
|---|---|---|
| Temps de réponse API (p95) | k6 / logs Symfony (`var/log`) | < 200 ms |
| Taille des fichiers du bundle | Sortie `vite build` | Voir budget §2 |
| Taille max d'upload acceptée | Config PHP (`upload_max_filesize`) | Documentée et testée |
| Temps de chargement page (LCP) | Lighthouse | < 2,5 s |

## 5. Amélioration potentielle pour la production

Les tests k6 ci-dessus sont ponctuels (exécutés manuellement en local). En production, un suivi continu serait préférable :

- **Grafana** (associé à Prometheus, ou à [k6 Cloud](https://k6.io/cloud/) / l'extension `xk6-output-prometheus-remote`) permettrait de :
  - visualiser en continu les métriques de l'API (temps de réponse, taux d'erreur, débit) plutôt que via des relevés manuels ponctuels ;
  - exécuter les scripts k6 (`k6-info.js`, `k6-login.js`) en CI/CD avec export des résultats vers un dashboard Grafana, et déclencher des alertes si les seuils (`p(99)<100ms`, `error rate <1%`) sont dépassés ;
  - corréler les métriques applicatives avec les métriques infrastructure (CPU, mémoire, connexions Doctrine/PostgreSQL).

- **Élargir les scénarios k6** au-delà de la montée en charge progressive actuelle, en faisant varier `options.stages` :
  - **Load test** (charge nominale) : nombre de VUs correspondant au trafic attendu en production, sur une durée représentative, pour valider que les seuils sont tenus en conditions normales.
  - **Stress test** (charge croissante au-delà du nominal) : augmenter progressivement les VUs jusqu'à dégradation, afin d'identifier le point de rupture (CPU, connexions DB, mémoire) et la limite de capacité de l'infrastructure.
  - **Spike test** (pic soudain) : montée quasi instantanée à un nombre élevé de VUs (ex. `{ duration: '10s', target: 200 }`) pour vérifier la résilience face à un afflux brutal de trafic (effet "buzz"/lien partagé massivement).
  - **Soak test** (endurance) : charge modérée mais constante sur une longue durée (plusieurs heures), pour détecter des fuites mémoire, une dégradation progressive des temps de réponse ou un épuisement des connexions DB.
