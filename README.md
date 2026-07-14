# Kaskade

**Kaskade** est une plateforme de mise en relation entre **clients** et **prestataires de services locaux** (ménage, électricité, plomberie, architecture, tech, bien-être, etc.). Elle couvre l'intégralité du cycle de vie d'une mission : inscription, demande de service, validation admin, assignation prestataire, paiement en deux temps (acompte 50 % + solde 50 %) via mobile money, et notifications en temps réel.

Le projet est organisé en **monorepo** avec **Turborepo** et **pnpm workspaces**.

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
- [Démarrage en développement](#démarrage-en-développement)
- [Comptes de test (seed)](#comptes-de-test-seed)
- [Rôles et parcours utilisateur](#rôles-et-parcours-utilisateur)
- [Workflow des demandes](#workflow-des-demandes)
- [API REST](#api-rest)
- [Routes frontend](#routes-frontend)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Scripts disponibles](#scripts-disponibles)

---

## Fonctionnalités

### Côté client
- Inscription avec vérification **OTP par e-mail** (Brevo)
- Parcours du catalogue de services et création de demandes
- Planification (date, adresse, créneaux premium récurrents)
- Suivi des missions et paiements (Airtel, Orange, M-Pesa via **Mbiyo Pay**)
- Notifications in-app et temps réel (WebSocket)
- Candidature pour devenir prestataire

### Côté prestataire
- Tableau de bord avec statistiques
- Consultation et acceptation des missions disponibles
- Gestion du calendrier et des missions en cours
- Profil professionnel (métier, expérience, bio, avatar)
- Bascule **mode Client / mode Prestataire** sans changer de compte

### Côté administrateur
- Tableau de bord global (stats, activité, croissance)
- Gestion des utilisateurs, services et demandes
- Validation des candidatures prestataires
- Assignation de services aux prestataires
- Analytics et données financières
- Upload d'images pour le catalogue

### Infrastructure
- Authentification **JWT** (access + refresh tokens)
- Rate limiting global
- Upload de fichiers (avatars, images de services)
- Architecture événementielle pour les notifications
- CRON : rejet automatique des demandes en attente > 48 h

---

## Stack technique

| Couche | Technologies |
|--------|--------------|
| **Monorepo** | Turborepo, pnpm workspaces |
| **Backend** | NestJS 11, TypeScript, Prisma 7, PostgreSQL |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS, Framer Motion, Lucide React, Recharts |
| **Auth** | JWT (Passport), OTP via Redis (mock en mémoire) |
| **E-mail** | Brevo (`@getbrevo/brevo`) |
| **Paiements** | Mbiyo Pay (mobile money RDC) |
| **Temps réel** | Socket.IO (notifications) |
| **Validation** | class-validator (backend), Zod + React Hook Form (frontend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        apps/frontend                            │
│              Next.js 15 — Port 3000                             │
│   Landing │ Auth │ Client │ Dashboard Provider │ Admin          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST (Axios) + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        apps/backend                             │
│              NestJS — Port 4000 — Préfixe /api/v1               │
│   Auth │ Users │ Services │ Requests │ Providers │ Payments     │
│   Notifications │ Admin │ Uploads                               │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
           ▼                              ▼
   ┌───────────────┐              ┌───────────────┐
   │  PostgreSQL   │              │ Redis (OTP)   │
   │  (Prisma)     │              │ docker/local  │
   └───────────────┘              └───────────────┘
```

### Modules backend principaux

| Module | Responsabilité |
|--------|----------------|
| `auth` | Inscription, OTP, login, refresh, reset password |
| `users` | CRUD utilisateurs (admin) |
| `services` | Catalogue de prestations |
| `requests` | Demandes clients + validation admin |
| `providers` | Candidatures, missions, profil prestataire |
| `payments` | Acompte/final Mbiyo Pay + webhook |
| `notifications` | Persistance + WebSocket temps réel |
| `admin` | Dashboard, analytics, financials |
| `uploads` | Fichiers statiques (`/uploads/`) |
| `mail` | E-mails transactionnels Brevo |
| `redis` | Stockage OTP/tokens temporaires |

---

## Structure du projet

```
kaskade/
├── apps/
│   ├── backend/                 # API NestJS (@kaskade/backend)
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Schéma de données
│   │   │   ├── seed.ts          # Données de test
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── services/
│   │   │   ├── requests/
│   │   │   ├── providers/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   ├── uploads/
│   │   │   ├── mail/
│   │   │   └── redis/
│   │   ├── http/                # Fichiers .http pour REST Client
│   │   └── docker-compose.yml   # PostgreSQL + Redis local
│   │
│   └── frontend/                # App Next.js (@kaskade/frontend)
│       ├── src/
│       │   ├── app/             # Routes App Router
│       │   ├── components/      # auth/, landing/, admin/
│       │   └── lib/             # api.ts, auth-context, guards
│       └── prisma/              # Schéma Prisma (legacy, peu utilisé)
│
├── packages/                    # Réservé aux libs partagées (vide)
├── .env.example                 # Variables d'environnement
├── render.yaml                  # Config déploiement Render
├── turbo.json                   # Orchestration Turborepo
├── pnpm-workspace.yaml
└── package.json
```

---

## Prérequis

- **Node.js** ≥ 20 (recommandé : 24.x pour Render)
- **pnpm** 10.32.1 (`corepack enable` recommandé)
- **PostgreSQL** 15+ (local via Docker ou service cloud)
- **Redis** (optionnel en dev — mock en mémoire par défaut)

---

## Installation

```bash
# Cloner le dépôt
git clone <url-du-repo>
cd kaskade

# Installer les dépendances (à la racine)
pnpm install
```

---

## Configuration

Copiez le fichier d'exemple et renseignez vos valeurs :

```bash
cp .env.example .env
```

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Connexion PostgreSQL | `postgresql://user:pass@localhost:5432/kaskade_db` |
| `PORT` | Port backend | `4000` |
| `FRONTEND_URL` | URL(s) frontend autorisées (CORS) | `http://localhost:3000` |
| `JWT_ACCESS_SECRET` | Secret JWT access token | Chaîne aléatoire forte |
| `JWT_REFRESH_SECRET` | Secret JWT refresh token | Chaîne aléatoire forte |
| `BREVO_API_KEY` | Clé API Brevo (e-mails) | — |
| `MAIL_FROM_EMAIL` | Expéditeur e-mails | `contact@kaskade.com` |
| `MAIL_FROM_NAME` | Nom expéditeur | `L'équipe Kaskade` |
| `MBIYO_API_URL` | URL API Mbiyo Pay | `https://dashboard.mbiyo.africa/api/v1` |
| `MBIYO_SECRET_KEY` | Clé API marchande Mbiyo (test ou production) | — |
| `MBIYO_WEBHOOK_SECRET` | Secret webhook HMAC | — |
| `MBIYO_WEBHOOK_URL` | URL callback webhook | `https://api.example.com/api/v1/payments/webhook/mbiyo` |
| `NEXT_PUBLIC_API_URL` | URL API pour le frontend | `http://localhost:4000/api/v1` |

> **Note :** Le frontend lit `NEXT_PUBLIC_API_URL`. Placez-la dans `apps/frontend/.env.local` ou à la racine selon votre setup.

---

## Base de données

### Option 1 — Docker (recommandé en local)

```bash
cd apps/backend
docker compose up -d
```

Services démarrés :
- **PostgreSQL** : `localhost:5432` (user: `admin_kaskade`, pass: `1234567890`, db: `kaskade_db`)
- **Redis** : `localhost:6379`
- **Redis Commander** : `http://localhost:8081`

### Option 2 — PostgreSQL externe

Utilisez Neon, Supabase, Render PostgreSQL, etc. et renseignez `DATABASE_URL`.

### Migrations et seed

```bash
# Générer le client Prisma
pnpm --filter @kaskade/backend exec prisma generate

# Appliquer les migrations
pnpm --filter @kaskade/backend exec prisma migrate dev

# Peupler la base avec des comptes de test
pnpm --filter @kaskade/backend exec prisma db seed
```

---

## Démarrage en développement

### Tout lancer en parallèle (recommandé)

```bash
pnpm dev
```

Démarre simultanément :
- **Frontend** : [http://localhost:3000](http://localhost:3000)
- **Backend** : [http://localhost:4000/api/v1](http://localhost:4000/api/v1)

### Lancer séparément

```bash
# Backend uniquement
pnpm backend:dev

# Frontend uniquement
pnpm frontend:dev
```

### Build production

```bash
pnpm build
pnpm start
```

---

## Comptes de test (seed)

Après `prisma db seed`, les comptes suivants sont disponibles (mot de passe : `password123`) :

| Rôle | E-mail | Téléphone |
|------|--------|-----------|
| **ADMIN** | `kaskade@gmail.com` | `+243990000000` |
| **CLIENT** | `client@gmail.com` | `+243990000001` |
| **PROVIDER** | `provider@gmail.com` | `+243990000002` |

> Les comptes **ADMIN** ne peuvent pas être créés via l'API d'inscription — ils doivent être insérés via le seed ou directement en base.

---

## Rôles et parcours utilisateur

### CLIENT
1. Découverte des services sur la landing (`/`) ou `/services`
2. Inscription → vérification OTP → connexion
3. Création d'une demande depuis le catalogue
4. Paiement de l'acompte (50 %) via mobile money
5. Suivi sur `/mes-demandes`
6. Option : candidature prestataire via `/devenir-prestataire`

### PROVIDER
1. Candidature validée par un admin
2. Connexion → redirection vers `/dashboard`
3. Acceptation des missions disponibles
4. Exécution et marquage « terminé »
5. Bascule possible en **mode Client** pour commander des services

### ADMIN
1. Connexion → redirection vers `/admin/dashboard`
2. Validation des demandes et candidatures prestataires
3. Gestion du catalogue de services
4. Consultation des analytics et revenus

---

## Workflow des demandes

```
PENDING ──(admin approuve)──► APPROVED
   │                              │
   │(admin rejette)               │(prestataire accepte)
   ▼                              ▼
REJECTED                       ACCEPTED
                                   │
                          (client paie acompte 50%)
                                   ▼
                              IN_PROGRESS
                                   │
                          (prestataire termine)
                                   ▼
                             AWAITING_FINAL
                                   │
                          (client paie solde 50%)
                                   ▼
                               COMPLETED
```

| Statut | Signification |
|--------|---------------|
| `PENDING` | Demande créée, en attente de validation admin |
| `APPROVED` | Admin a validé et fixé le prix |
| `REJECTED` | Demande refusée par l'admin |
| `ACCEPTED` | Prestataire a accepté, en attente de l'acompte |
| `IN_PROGRESS` | Acompte versé, mission en cours |
| `AWAITING_FINAL` | Mission terminée, en attente du paiement final |
| `COMPLETED` | Mission clôturée |

---

## API REST

**Base URL :** `http://localhost:4000/api/v1`

### Authentification (`/auth`)

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/auth/register` | Public | Inscription + envoi OTP |
| POST | `/auth/verify-otp` | Public | Vérification du compte |
| POST | `/auth/resend-otp` | Public | Renvoi du code OTP |
| POST | `/auth/login` | Public | Connexion (access + refresh tokens) |
| POST | `/auth/refresh` | Refresh token | Renouvellement des tokens |
| GET | `/auth/me` | JWT | Profil connecté |
| PATCH | `/auth/me` | JWT | Mise à jour du profil |
| POST | `/auth/logout` | Refresh token | Déconnexion |
| POST | `/auth/forgot-password` | Public | Demande de reset |
| POST | `/auth/reset-password` | Public | Réinitialisation |

### Services (`/services`)

| Méthode | Route | Accès |
|---------|-------|-------|
| GET | `/services` | Public |
| GET | `/services/:id` | Public |
| POST | `/services` | ADMIN |
| PATCH | `/services/:id` | ADMIN |
| DELETE | `/services/:id` | ADMIN |

### Demandes (`/requests`)

| Méthode | Route | Accès |
|---------|-------|-------|
| POST | `/requests` | CLIENT |
| GET | `/requests` | CLIENT |
| GET | `/requests/availability/:serviceId` | Public |
| GET | `/requests/:id` | CLIENT |
| PATCH | `/requests/:id` | CLIENT |
| DELETE | `/requests/:id` | CLIENT |

### Prestataire (`/provider`, `/providers`)

| Méthode | Route | Accès |
|---------|-------|-------|
| POST | `/providers/apply` | JWT |
| GET | `/providers/my-application` | JWT |
| GET | `/provider/dashboard-stats` | PROVIDER |
| GET | `/provider/my-missions` | PROVIDER |
| GET | `/provider/requests` | PROVIDER |
| PATCH | `/provider/requests/:id/accept` | PROVIDER |
| PATCH | `/provider/requests/:id/complete` | PROVIDER |
| GET/PATCH | `/provider/profile` | PROVIDER |

### Paiements (`/payments`)

| Méthode | Route | Accès |
|---------|-------|-------|
| POST | `/payments/initiate/deposit` | CLIENT |
| POST | `/payments/initiate/final` | CLIENT |
| POST | `/payments/webhook/mbiyo` | Public (HMAC) |
| GET | `/payments/status/:paymentId` | CLIENT |

### Admin (`/admin`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/admin/dashboard` | Données agrégées |
| GET | `/admin/dashboard/stats` | Statistiques |
| GET | `/admin/users` | Liste utilisateurs |
| GET | `/admin/requests` | Liste demandes |
| PATCH | `/admin/requests/:id/approve` | Approuver |
| PATCH | `/admin/requests/:id/reject` | Rejeter |
| GET | `/admin/providers/applications` | Candidatures |
| GET | `/admin/financials` | Données financières |
| GET | `/admin/analytics` | Analytiques |

### Notifications (`/notifications`)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/notifications` | Liste paginée |
| GET | `/notifications/unread-count` | Compteur non-lues |
| PATCH | `/notifications/read-all` | Tout marquer lu |
| PATCH | `/notifications/:id/read` | Marquer une notification |

### Uploads (`/uploads`)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/uploads/avatar` | Image profil (max 5 Mo) |
| POST | `/uploads/service` | Image service (max 5 Mo) |

> Documentation détaillée des tests manuels : [`apps/backend/http/README.md`](apps/backend/http/README.md)

---

## Routes frontend

### Publiques
| Route | Description |
|-------|-------------|
| `/` | Page d'accueil (landing) |
| `/services` | Catalogue de services |
| `/login` | Connexion |
| `/register` | Inscription |
| `/verify-otp` | Vérification OTP |
| `/forgot-password` | Mot de passe oublié |
| `/reset-password` | Réinitialisation |

### Client
| Route | Description |
|-------|-------------|
| `/mes-demandes` | Suivi des demandes |
| `/notifications` | Notifications |
| `/client/profil` | Profil client |
| `/devenir-prestataire` | Candidature prestataire |
| `/parametres/*` | Sécurité, notifications, suppression |

### Prestataire (`/dashboard`)
| Route | Description |
|-------|-------------|
| `/dashboard` | Tableau de bord |
| `/dashboard/missions` | Missions disponibles |
| `/dashboard/mes-missions` | Missions acceptées |
| `/dashboard/calendrier` | Calendrier |
| `/dashboard/profil` | Profil prestataire |
| `/dashboard/notifications` | Notifications |

### Admin (`/admin`)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Vue d'ensemble |
| `/admin/client` | Gestion clients |
| `/admin/prestataire` | Candidatures prestataires |
| `/admin/service` | CRUD services |
| `/admin/request` | Gestion demandes |
| `/admin/revenu` | Revenus |
| `/admin/financials` | Finances |
| `/admin/analytics` | Analytiques |
| `/admin/users` | Utilisateurs |
| `/admin/settings` | Paramètres |

---

## Tests

### Backend (Jest)

```bash
pnpm --filter @kaskade/backend test
pnpm --filter @kaskade/backend test:cov
pnpm --filter @kaskade/backend test:e2e
```

### Tests manuels API (REST Client)

1. Installer l'extension [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) dans VS Code
2. Démarrer le backend
3. Exécuter les fichiers `.http` dans `apps/backend/http/` dans l'ordre indiqué

### Lint

```bash
pnpm lint
pnpm format
```

---

## Déploiement

### Backend — Render

Le fichier [`render.yaml`](render.yaml) configure le déploiement automatique :

```bash
# Build (Render)
pnpm run render:build

# Start (Render)
pnpm run render:start
```

Le build exécute : installation → `prisma generate` → `prisma db push` → compilation TypeScript.

### Frontend — Vercel (recommandé)

1. Déployer `apps/frontend` sur Vercel
2. Configurer `NEXT_PUBLIC_API_URL` vers l'URL du backend Render
3. Configurer `FRONTEND_URL` côté backend avec l'URL Vercel

### Checklist production

- [ ] Générer des secrets JWT forts (`openssl rand -base64 32`)
- [ ] Configurer Brevo pour les e-mails OTP
- [ ] Configurer Mbiyo Pay (clés + webhook)
- [ ] Renseigner `FRONTEND_URL` pour le CORS
- [ ] Utiliser un PostgreSQL managé
- [ ] Remplacer le mock Redis par un vrai serveur Redis

---

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `pnpm dev` | Démarre frontend + backend en mode watch |
| `pnpm build` | Build de toutes les apps |
| `pnpm start` | Démarre en mode production |
| `pnpm lint` | Lint de toutes les apps |
| `pnpm test` | Tests de toutes les apps |
| `pnpm format` | Formatage Prettier |
| `pnpm backend:dev` | Backend seul |
| `pnpm frontend:dev` | Frontend seul |
| `pnpm render:build` | Build pour Render |
| `pnpm render:start` | Start pour Render |

---

## Modèle de données (aperçu)

```
User ──┬── clientRequests (Request)
       ├── providerRequests (Request)
       ├── providerApplications (ProviderApplication)
       ├── services (Service)          [prestataires assignés]
       └── notifications (Notification)

Service ── requests (Request)

Request ── payments (Payment)
        └── notifications (Notification)

ProviderApplication ── notifications (Notification)
```

**Rôles :** `CLIENT`, `PROVIDER`, `ADMIN`  
**Statuts prestataire :** `DISPONIBLE`, `EN_MISSION`, `INDISPONIBLE`

---

## Licence

Projet privé — tous droits réservés.
