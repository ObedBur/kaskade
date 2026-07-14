export function getMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  const mediaBase =
    process.env.NEXT_PUBLIC_MEDIA_URL ||
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1').replace(
      /\/api\/v1\/?$/,
      '',
    );

  const absoluteBase = mediaBase.startsWith('http')
    ? mediaBase.replace(/\/$/, '')
    : 'http://localhost:4000';

  return `${absoluteBase}${path.startsWith('/') ? '' : '/'}${path}`;
}
