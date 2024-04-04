import { HttpRequest, HttpResponse } from '@angular/common/http';
import { waitForAsync } from '@angular/core/testing';
import { HttpCacheService } from '@app-core/services/cache.service';

describe('Cache service', () => {
  let cacheService: HttpCacheService;
  const data = { data: 'sample data' };
  const req = new HttpRequest('GET', 'api1');
  const res = new HttpResponse({ body: data });

  beforeEach(() => {
    cacheService = new HttpCacheService();
  });

  it('store and retrieve cache', () => {
    cacheService.setCache(req, res);

    const cache = cacheService.getCache(req);

    expect(cache.body).toBe(data);
  });

  it('returns null if cache is not found', () => {
    const req1 = new HttpRequest('GET', 'unsavedKey');
    const cache = cacheService.getCache(req1);

    expect(cache).toBe(null);
  });

  it('returns null when a cache is expired', waitForAsync(() => {
    // set cache for 1 second
    cacheService.setCache(req, res, 0.016);
    // simulate 1 second delay
    setTimeout(() => {
      const cache = cacheService.getCache(req);

      expect(cache).toBe(null);
    }, 1000);
  }));
});
