import api from '@/lib/api';

export interface SearchService {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  currency?: string | null;
  imageUrl: string | null;
  imageKey?: string | null;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  quartiers: string[];
  provider?: {
    id: string;
    fullName: string;
    isVerified: boolean;
  };
  _count?: { reviews: number };
}

function normalize(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export async function searchServices(
  q: string,
  opts?: { limit?: number; signal?: AbortSignal }
): Promise<SearchService[]> {
  const norm = normalize(q);
  if (!norm || norm.length < 2) return [];

  const res = await api.get('/services/search', {
    params: { q: norm, limit: opts?.limit ?? 8 },
    signal: opts?.signal,
  });
  return Array.isArray(res.data) ? res.data : [];
}

export const DEBOUNCE_MS = 300;
export const MIN_QUERY_LENGTH = 2;