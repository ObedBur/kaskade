import { ThrottlerBehindProxyGuard } from './throttler-behind-proxy.guard';

describe('ThrottlerBehindProxyGuard', () => {
  let guard: ThrottlerBehindProxyGuard;

  beforeEach(() => {
    // Les librairies Throttler internes parentes nécessitent ces flags, mais on teste juste getTracker via polymorphisme
    guard = new ThrottlerBehindProxyGuard({} as any, {} as any, {} as any);
  });

  it('should return the first IP from req.ips if available (Behind Proxy / Load Balancer)', async () => {
    const req = { ips: ['1.1.1.1', '2.2.2.2'], ip: '3.3.3.3' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('1.1.1.1');
  });

  it('should fall back to req.ip if req.ips is empty (Direct link)', async () => {
    const req = { ips: [], ip: '3.3.3.3' };
    const tracker = await (guard as any).getTracker(req);
    expect(tracker).toBe('3.3.3.3');
  });
});
