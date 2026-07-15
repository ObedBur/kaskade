# Plan - Mapping des erreurs Mbiyo

## Summary

Corriger le module backend de paiements pour éviter que des erreurs Mbiyo côté requête soient systématiquement transformées en `500 InternalServerError`.

Objectif fonctionnel:
- conserver des erreurs métier exploitables pour le frontend et le support;
- traiter `401/403` Mbiyo comme des erreurs d'intégration/configuration côté Kaskade;
- mapper les timeouts et indisponibilités upstream vers des erreurs de passerelle/disponibilité;
- couvrir le comportement avec des tests unitaires ciblés.

## Current State Analysis

### Constat dans le code

- `apps/backend/src/payments/payments.service.ts`
  - `finalizePayment()` appelle `POST /merchant/transactions/{transaction_id}/finalize` puis attrape toute erreur et relance toujours `InternalServerErrorException`.
  - `initiateCollect()` appelle `POST /merchant/payin`, marque le paiement local en `FAILED` en cas d'échec, puis relance toujours `InternalServerErrorException`.
  - la logique actuelle perd le code HTTP Mbiyo et ne distingue ni erreur de validation (`400`), ni OTP invalide (`400` documenté), ni erreur d'authentification (`401/403`), ni timeout réseau.
- `apps/backend/src/common/filters/all-exceptions.filter.ts`
  - le filtre global ne remappe pas les erreurs Mbiyo; il ne fait qu'exposer le statut de l'exception Nest reçue.
  - en pratique, si le service relance un `InternalServerErrorException`, le client recevra bien un `500`.
- `apps/backend/src/payments/payments.service.spec.ts`
  - les tests couvrent plusieurs flux heureux et quelques gardes métier locales;
  - il n'existe pas encore de couverture ciblée pour `finalizePayment()` ni pour le mapping des erreurs Mbiyo/timeout.

### Constat dans la documentation Mbiyo

- Guide erreurs:
  - `4xx` = erreurs de requête, validation, authentification ou autorisation.
  - `5xx/502/503/504` = erreurs côté Mbiyo.
- Endpoint `Finalize Payment`:
  - documente explicitement un `400 Bad Request` avec message `Invalid OTP`.
- Endpoint `Merchant Payin`:
  - le flux dépend de `auth_mode`; les erreurs de validation upstream ne doivent donc pas être assimilées à une panne interne Kaskade.

### Décisions verrouillées

- `401/403` Mbiyo: exposer une erreur de configuration/intégration côté Kaskade, pas un pass-through brut.
- Autres erreurs métier Mbiyo: conserver un mapping `4xx` détaillé.

## Proposed Changes

### 1. `apps/backend/src/payments/payments.service.ts`

Introduire une normalisation centralisée des réponses/erreurs Mbiyo dans le service, sans changer le contrat métier des endpoints.

Changements prévus:
- ajouter un helper privé pour lire la réponse Mbiyo de façon robuste:
  - extraire `status`, `message`, `data`, code HTTP et payload brut;
  - tolérer les réponses JSON incomplètes tout en conservant un message exploitable.
- ajouter un helper privé de mapping `Mbiyo -> Nest HttpException`, utilisé par `initiateCollect()` et `finalizePayment()`.

Mapping prévu:
- `400` et `422` -> `BadRequestException`
  - inclut le cas OTP invalide sur `finalize`.
- `402` -> `BadRequestException`
  - erreur métier upstream, non assimilée à une panne serveur Kaskade.
- `404` -> `NotFoundException`
  - transaction ou ressource Mbiyo introuvable.
- `409` -> `ConflictException`
  - conflit upstream explicite.
- `429` -> `TooManyRequestsException`
  - permet au frontend de distinguer un throttling.
- `401` et `403` -> `InternalServerErrorException`
  - message d'intégration/configuration explicite, orienté exploitation (`clé API Mbiyo invalide`, `permissions insuffisantes`, etc.).
- `500`, `502`, `503`, `504` -> `BadGatewayException` ou `ServiceUnavailableException`
  - `502/500/504` prioritairement en `BadGatewayException`;
  - `503` prioritairement en `ServiceUnavailableException`.
- timeout/abort réseau (`AbortError` ou équivalent) -> `ServiceUnavailableException` ou `BadGatewayException`
  - avec message explicite indiquant l'indisponibilité temporaire de Mbiyo.
- autres erreurs réseau/fetch non classables -> `BadGatewayException`.

Refactor ciblé:
- `finalizePayment()`
  - remplacer le `catch` générique qui relance toujours un `500`;
  - préserver les messages utiles Mbiyo sans exposer des détails techniques inutiles.
- `initiateCollect()`
  - conserver la mise à jour locale `payment.status = FAILED` quand l'initiation échoue;
  - remplacer la relance générique `500` par l'exception mappée;
  - conserver un log structuré avec code HTTP Mbiyo + message normalisé.
- éventuellement réutiliser le helper dans `verifyTransactionStatus()` pour homogénéiser la lecture des réponses Mbiyo, sans changer le contrat existant du webhook au-delà d'une meilleure journalisation.

### 2. `apps/backend/src/payments/payments.service.spec.ts`

Ajouter des tests unitaires ciblés sur le mapping d'erreurs Mbiyo.

Cas minimums à couvrir:
- `initiateDeposit()` renvoie `BadRequestException` si Mbiyo retourne `400` avec message de validation.
- `finalizePayment()` renvoie `BadRequestException` si Mbiyo retourne `400` avec message `Invalid OTP`.
- `initiateDeposit()` ou `finalizePayment()` renvoie une erreur de configuration/intégration si Mbiyo retourne `401` ou `403`.
- `initiateDeposit()` renvoie `TooManyRequestsException` sur `429`.
- `initiateDeposit()` renvoie `BadGatewayException` ou `ServiceUnavailableException` sur `500/503`.
- `initiateDeposit()` renvoie une erreur de disponibilité sur timeout (`AbortError` simulé).
- en cas d'échec `payin`, le paiement local est bien marqué `FAILED` avant la relance de l'exception mappée.

## Assumptions & Decisions

- Aucun changement n'est nécessaire dans `payments.controller.ts`: le contrôleur délègue déjà correctement au service.
- Aucun changement n'est nécessaire dans `all-exceptions.filter.ts`: une fois les bonnes `HttpException` émises par le service, le filtre exposera naturellement les bons statuts.
- Le mapping détaillé des `4xx` Mbiyo est préférable au regroupement en un unique `400`, car il améliore le diagnostic frontend/support sans élargir le scope.
- Pour `401/403`, le statut public reste un `500` de type intégration/configuration, conformément à votre décision produit.
- Le wording exact des messages utilisateurs restera sobre et actionnable, sans fuite de détails sensibles sur la configuration interne.

## Verification Steps

Vérifications à exécuter après implémentation:
- lancer les tests ciblés backend:
  - `pnpm --filter @kaskade/backend test -- payments.service.spec.ts`
- vérifier qu'aucune régression n'apparaît sur les tests du module paiement.
- vérifier le lint/diagnostics sur les fichiers modifiés.

Vérifications fonctionnelles recommandées si l'accès sandbox est utilisé pendant l'exécution:
- simuler un `payin` invalide et confirmer qu'on reçoit un `4xx` utile au lieu d'un `500`;
- simuler un `finalize` avec OTP invalide et confirmer un `400 Bad Request`;
- simuler une panne ou un timeout Mbiyo et confirmer une erreur `502/503` plutôt qu'un `500` interne générique.
