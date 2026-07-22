const request = require('supertest');
const app = require('../../app');
const UrlRepository = require('../../repositories/url.repository');
const redisRepository = require('../../repositories/redis.repository');
const ClickRepository = require('../../repositories/click.repository');
const { validateAccessibleUrl } = require('../../helpers/url.helper');

jest.mock('../../repositories/url.repository');
jest.mock('../../repositories/redis.repository');
jest.mock('../../repositories/click.repository');
jest.mock('../../middlewares/rateLimit.middleware', () => {
  return () => (req, res, next) => next();
});

describe('Redirect API Integration Tests (GET /api/v1/urls/:shortCode)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to originalUrl on Redis Cache HIT', async () => {
    const cachedData = JSON.stringify({
      originalUrl: 'https://google.com',
      isActive: true,
      expiresAt: null
    });
    redisRepository.get.mockResolvedValue(cachedData);
    redisRepository.increment.mockResolvedValue(1);

    const response = await request(app)
      .get('/api/v1/urls/abc12')
      .expect('Location', 'https://google.com');

    expect(response.status).toBe(302); // Redirect status
    expect(redisRepository.get).toHaveBeenCalledWith('url:abc12');
    expect(redisRepository.increment).toHaveBeenCalledWith('click:abc12');
    expect(UrlRepository.findByShortCode).not.toHaveBeenCalled();
  });

  it('should redirect to originalUrl on Cache MISS and MongoDB HIT', async () => {
    redisRepository.get.mockResolvedValue(null);
    UrlRepository.findByShortCode.mockResolvedValue({
      _id: 'db-url-id',
      originalUrl: 'https://github.com',
      shortCode: 'git123',
      isActive: true,
      expiresAt: null
    });
    redisRepository.set.mockResolvedValue(undefined);
    redisRepository.increment.mockResolvedValue(1);
    ClickRepository.create.mockResolvedValue({});

    const response = await request(app)
      .get('/api/v1/urls/git123')
      .expect('Location', 'https://github.com');

    expect(response.status).toBe(302);
    expect(redisRepository.get).toHaveBeenCalledWith('url:git123');
    expect(UrlRepository.findByShortCode).toHaveBeenCalledWith('git123');
    expect(redisRepository.set).toHaveBeenCalledWith(
      'url:git123',
      JSON.stringify({
        originalUrl: 'https://github.com',
        isActive: true,
        expiresAt: null
      })
    );
    expect(redisRepository.increment).toHaveBeenCalledWith('click:git123');
    expect(ClickRepository.create).toHaveBeenCalledWith({
      urlId: 'db-url-id',
      shortCode: 'git123'
    });
  });

  it('should return 404 if shortCode does not exist in DB (Cache MISS)', async () => {
    redisRepository.get.mockResolvedValue(null);
    UrlRepository.findByShortCode.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/v1/urls/missingcode');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Short URL not found');
  });

  it('should return 410 if URL is inactive in DB (Cache MISS)', async () => {
    redisRepository.get.mockResolvedValue(null);
    UrlRepository.findByShortCode.mockResolvedValue({
      _id: 'db-url-id',
      originalUrl: 'https://inactive.com',
      shortCode: 'inact',
      isActive: false,
      expiresAt: null
    });

    const response = await request(app)
      .get('/api/v1/urls/inact');

    expect(response.status).toBe(410);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('disabled');
  });

  it('should return 410 and delete cache if URL has expired (Cache MISS)', async () => {
    redisRepository.get.mockResolvedValue(null);
    
    // Set expiration in the past
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 10);

    UrlRepository.findByShortCode.mockResolvedValue({
      _id: 'db-url-id',
      originalUrl: 'https://expired.com',
      shortCode: 'exp12',
      isActive: true,
      expiresAt: pastDate
    });

    const response = await request(app)
      .get('/api/v1/urls/exp12');

    expect(response.status).toBe(410);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('expired');
  });
});
