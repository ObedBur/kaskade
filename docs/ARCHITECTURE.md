# Architecture du Projet Kaskade

## Graphe d'Architecture Globale

```mermaid
graph TD
    subgraph Frontend [Frontend - Next.js]
        A[Client Web App]
        B[Admin Dashboard]
    end

    subgraph Backend [Backend - NestJS]
        C[API Gateway / Auth]
        D[Modules Services]
        E[Modules Users/Providers]
        F[Modules Requests/Payments]
    end

    subgraph Infrastructure
        G[(PostgreSQL - Prisma)]
        H[(Redis - Cache/Throttler)]
    end

    subgraph External_Services [Services Externes]
        I[Brevo - Email Service]
    end

    A -->|HTTP/REST| C
    B -->|HTTP/REST| C
    C --> D
    C --> E
    C --> F

    Backend -->|Queries| G
    Backend -->|Pub/Sub / Storage| H
    Backend -->|SMTP/API| I
```


## Schéma de Base de Données (ERD)

```mermaid
erDiagram
    USER ||--o{ REQUEST : "clientRequests"
    USER ||--o{ REQUEST : "providerRequests"
    USER ||--o{ PROVIDER_APPLICATION : "applications"
    USER ||--o{ NOTIFICATION : "notifications"
    USER }o--o{ SERVICE : "provides"

    SERVICE ||--o{ REQUEST : "requests"

    USER {
        string id PK
        string email UK
        string password
        string fullName
        string phone UK
        string quartier
        Role role
        Status status
        boolean isPremium
        string metier
        string experience
        string bio
        boolean isVerified
        boolean isActive
        string refreshToken
        datetime createdAt
        datetime updatedAt
    }

    SERVICE {
        string id PK
        string name
        string category
        string description
        float price
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    REQUEST {
        string id PK
        string clientId FK
        string serviceId FK
        string providerId FK
        string description
        string address
        datetime scheduledAt
        float price
        datetime acceptedAt
        RequestStatus status
        datetime createdAt
        datetime updatedAt
    }

    PROVIDER_APPLICATION {
        string id PK
        string userId FK
        string motivation
        RequestStatus status
        datetime createdAt
        datetime updatedAt
    }

    NOTIFICATION {
        string id PK
        string userId FK
        string title
        string message
        string type
        boolean isRead
        datetime createdAt
    }
```

## Graphe de Dépendance des Modules Backend (NestJS)

```mermaid
graph LR
    AppModule --> AuthModule
    AppModule --> UsersModule
    AppModule --> ProvidersModule
    AppModule --> ServicesModule
    AppModule --> RequestsModule
    AppModule --> PaymentsModule
    AppModule --> NotificationsModule
    AppModule --> AdminDashboardModule
    AppModule --> MailModule
    AppModule --> RedisModule
    AppModule --> PrismaModule

    AuthModule --> UsersModule
    UsersModule --> PrismaModule
    ProvidersModule --> PrismaModule
    ServicesModule --> PrismaModule
    RequestsModule --> PrismaModule
    PaymentsModule --> PrismaModule
    NotificationsModule --> PrismaModule

    subgraph Global [Global Modules]
        MailModule
        RedisModule
        ConfigModule
    end
```

## Plan des Routes Frontend (Next.js App Router)

```mermaid
graph TD
    Home[/] --> Login[/(auth)/login]
    Home --> Register[/(auth)/register]

    subgraph Auth_Group [Authentification]
        Login
        Register
        Forgot[/(auth)/forgot-password]
        Reset[/(auth)/reset-password]
        Verify[/(auth)/verify-otp]
    end

    subgraph User_Space [Espace Utilisateur]
        Dashboard[/dashboard]
        Demandes[/mes-demandes]
        Services[/services]
        Notifs[/notifications]
    end

    subgraph Admin_Space [Espace Administration]
        AdminDash[/admin/dashboard]
        AdminUsers[/admin/users]
        AdminRequests[/admin/requests]
        AdminFinancials[/admin/financials]
        AdminAnalytics[/admin/analytics]
        AdminSettings[/admin/settings]
        AdminNotifs[/admin/notifications]
    end

    Dashboard --> Demandes
    Dashboard --> Services
    Dashboard --> Notifs
```
