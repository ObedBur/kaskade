import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService {
  private mockStore = new Map<string, string>();

  constructor(private configService: ConfigService) {}

  async set(key: string, value: string, ttlSeconds?: number) {
    this.mockStore.set(key, value);
    if (ttlSeconds) {
      setTimeout(() => {
        this.mockStore.delete(key);
      }, ttlSeconds * 1000);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.mockStore.get(key) || null;
  }

  async del(key: string) {
    this.mockStore.delete(key);
  }
}
