# 🧪 Kaskade - Fichiers de Tests REST Client

Suite de fichiers `.http` pour valider manuellement chaque module backend Kaskade.

## Prérequis

1. **Extension VSCode** : [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) (par humao)
2. **Backend démarré** : `pnpm run start:dev` sur le port `4000` (URL: `http://localhost:4000/api/v1`)
3. **Base de données migrée** : `npx prisma migrate dev`

---

## 🚀 Ordre d'exécution (OBLIGATOIRE)

```
0. auth.http                  → Obtenir clientToken, adminToken, providerToken
1. users.http                 → Gestion CRUD des comptes utilisateurs (ADMIN)
2. provider-application.http  → Convertir un CLIENT en PROVIDER
3. services.http              → Créer le catalogue de services (ADMIN)
4. requests.http              → Créer et approuver une demande (CLIENT + ADMIN)
5. provider.http              → Accepter et clôturer une mission (PROVIDER)
6. notifications.http         → Vérifier les notifications Push créées
```

---

## 🔑 Gestion des Tokens

Après chaque `POST /auth/login`, copiez la valeur de `accessToken` dans la variable correspondante **en haut du fichier** :

```
@clientToken = eyJhbGciOiJIUzI1NiJ9...
@adminToken = eyJhbGciOiJIUzI1NiJ9...
@providerToken = eyJhbGciOiJIUzI1NiJ9...
```

---

## 📁 Structure des Fichiers

| Fichier | Module | Acteurs |
|:--------|:-------|:--------|
| `auth.http` | Auth & Sessions | Tous |
| `users.http` | Gestion Comptes | ADMIN |
| `provider-application.http` | Candidatures | CLIENT + ADMIN |
| `services.http` | Catalogue | ADMIN + CLIENT |
| `requests.http` | Demandes | CLIENT + ADMIN |
| `provider.http` | Missions | PROVIDER |
| `notifications.http` | Alertes | Tous |

---

## ⚠️ Compte Admin

Le compte Admin doit être créé directement via un **seed Prisma** (pas via l'API Register).

Exemple dans `prisma/seed.ts` :
```ts
await prisma.user.create({
  data: {
    email: 'admin@kaskade.com',
    password: await bcrypt.hash('AdminPassword123!', 10),
    fullName: 'Super Admin',
    role: 'ADMIN',
    isVerified: true,
  }
});
```
