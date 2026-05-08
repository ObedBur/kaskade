export enum NotificationType {
  // ─── Authentification ──────────────────────────────────────────────────────
  AUTH_WELCOME = 'AUTH_WELCOME',

  // ─── Provider Application ─────────────────────────────────────────────────
  PROVIDER_APPLY_RECEIVED = 'PROVIDER_APPLY_RECEIVED',
  PROVIDER_APPLY_SUBMITTED = 'PROVIDER_APPLY_SUBMITTED',
  PROVIDER_APPLY_RESOLVED = 'PROVIDER_APPLY_RESOLVED',

  // ─── Services ──────────────────────────────────────────────────────────────
  SERVICE_CREATED = 'SERVICE_CREATED',
  SERVICE_UPDATED = 'SERVICE_UPDATED',
  SERVICE_DELETED = 'SERVICE_DELETED',

  // ─── Request Workflow ──────────────────────────────────────────────────────
  REQUEST_CREATED = 'REQUEST_CREATED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_ADMIN_REJECTED = 'REQUEST_ADMIN_REJECTED',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_AWAITING_FINAL = 'REQUEST_AWAITING_FINAL',
  REQUEST_COMPLETED = 'REQUEST_COMPLETED',

  // ─── Payments ──────────────────────────────────────────────────────────────
  PAYMENT_DEPOSIT_CONFIRMED = 'PAYMENT_DEPOSIT_CONFIRMED',
  PAYMENT_FINAL_CONFIRMED = 'PAYMENT_FINAL_CONFIRMED',
}
