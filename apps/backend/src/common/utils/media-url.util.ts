export function getApiPublicUrl(): string {
  const raw =
    process.env.API_PUBLIC_URL ||
    (process.env.PORT
      ? `http://localhost:${process.env.PORT}`
      : 'http://localhost:4000');

  return raw.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

export function toAbsoluteMediaUrl(
  relativePath: string | null | undefined,
): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;

  const base = getApiPublicUrl();
  return `${base}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}

export function withServiceImageUrl<T extends { imageKey?: string | null }>(
  service: T,
): T & { imageUrl: string | null } {
  const relativePath = service.imageKey
    ? `/uploads/services/${service.imageKey}`
    : null;

  return {
    ...service,
    imageUrl: toAbsoluteMediaUrl(relativePath),
  };
}
