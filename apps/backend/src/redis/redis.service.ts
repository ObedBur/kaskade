import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      });
      this.client.on('connect', () =>
        this.logger.log('Connecté à Redis'),
      );
      this.client.on('error', (err) =>
        this.logger.error('Erreur Redis :', err),
      );
    } else {
      this.logger.warn(
        'REDIS_URL non défini — utilisation du store en mémoire (dev uniquement)',
      );
      // Fallback en mémoire pour le développement local sans Redis
      this.client = null as unknown as Redis;
    }
  }

  // Store en mémoire utilisé uniquement si Redis n'est pas configuré
  private readonly mockStore = new Map<
    string,
    { value: string; timer?: ReturnType<typeof setTimeout> }
  >();

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
      return;
    }

    // Fallback mémoire
    const existing = this.mockStore.get(key);
    if (existing?.timer) clearTimeout(existing.timer);

    const timer = ttlSeconds
      ? setTimeout(() => this.mockStore.delete(key), ttlSeconds * 1000)
      : undefined;
    this.mockStore.set(key, { value, timer });
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      return this.client.get(key);
    }
    return this.mockStore.get(key)?.value ?? null;
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      await this.client.del(key);
      return;
    }
    const existing = this.mockStore.get(key);
    if (existing?.timer) clearTimeout(existing.timer);
    this.mockStore.delete(key);
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }
}
