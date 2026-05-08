export function getMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const baseUrl = apiUrl.replace('/api/v1', '');

  const absoluteBase = baseUrl.startsWith('http') ? baseUrl : 'http://localhost:4000';

  return `${absoluteBase}${path.startsWith('/') ? '' : '/'}${path}`;
}
