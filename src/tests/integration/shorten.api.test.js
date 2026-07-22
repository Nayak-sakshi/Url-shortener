const request = require('supertest');
const app = require('../../app');
const UrlRepository = require('../../repositories/url.repository');
const UserRepository = require('../../repositories/user.repository');
const { verifyToken, getUserFromToken } = require('../../helpers/auth.helper');

// Mock repositories and rate limiter middleware
jest.mock('../../repositories/url.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/redis.repository');
jest.mock('../../repositories/click.repository');
jest.mock('../../middlewares/rateLimit.middleware', () => {
  return () => (req, res, next) => next();
});
jest.mock('../../helpers/auth.helper', () => {
  const original = jest.requireActual('../../helpers/auth.helper');
  return {
    ...original,
    getUserFromToken: jest.fn()
  };
});

describe('Shorten API Integration Tests (/api/v1/urls)', () => {
  const mockUser = {
    _id: '60c72b2f9b1d8b0015f69c5d',
    id: '60c72b2f9b1d8b0015f69c5d',
    email: 'user@example.com',
    role: 'user',
    name: 'Test User'
  };

  const validObjectId = '60c72b2f9b1d8b0015f69c5e';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/urls (Create Short URL)', () => {
    it('should successfully create a short URL for anonymous user', async () => {
      getUserFromToken.mockResolvedValue(null); // Unauthenticated
      UrlRepository.findByShortCode.mockResolvedValue(null);
      UrlRepository.create.mockResolvedValue({
        _id: '60c72b2f9b1d8b0015f69c5f',
        originalUrl: 'https://google.com',
        shortCode: 'abc12345',
        clicks: 0,
        createdAt: new Date(),
        expiresAt: null,
        isActive: true
      });

      const response = await request(app)
        .post('/api/v1/urls')
        .send({ originalUrl: 'https://google.com' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalUrl).toBe('https://google.com');
      expect(response.body.data.shortCode).toBe('abc12345');
      expect(response.body.data.shortUrl).toContain('/abc12345');
      expect(UrlRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalUrl: 'https://google.com',
          userId: null,
          isCustomAlias: false
        })
      );
    });

    it('should successfully create a short URL with custom alias for logged in user', async () => {
      getUserFromToken.mockResolvedValue(mockUser); // Authenticated
      UrlRepository.findByShortCode.mockResolvedValue(null);
      UrlRepository.create.mockResolvedValue({
        _id: '60c72b2f9b1d8b0015f69c60',
        originalUrl: 'https://github.com',
        shortCode: 'mygit',
        clicks: 0,
        createdAt: new Date(),
        expiresAt: null,
        isActive: true,
        userId: '60c72b2f9b1d8b0015f69c5d'
      });

      const response = await request(app)
        .post('/api/v1/urls')
        .set('Authorization', 'Bearer dummy-token')
        .send({ originalUrl: 'https://github.com', customAlias: 'mygit' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.shortCode).toBe('mygit');
      expect(UrlRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalUrl: 'https://github.com',
          shortCode: 'mygit',
          userId: '60c72b2f9b1d8b0015f69c5d',
          isCustomAlias: true
        })
      );
    });

    it('should fail with 400 if originalUrl is missing', async () => {
      const response = await request(app)
        .post('/api/v1/urls')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 400 if customAlias is a reserved word', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      const response = await request(app)
        .post('/api/v1/urls')
        .set('Authorization', 'Bearer dummy-token')
        .send({ originalUrl: 'https://github.com', customAlias: 'admin' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('reserved');
    });

    it('should fail with 409 if customAlias already exists', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.findByShortCode.mockResolvedValue({ _id: '60c72b2f9b1d8b0015f69c61' });

      const response = await request(app)
        .post('/api/v1/urls')
        .set('Authorization', 'Bearer dummy-token')
        .send({ originalUrl: 'https://github.com', customAlias: 'mygit' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exists');
    });
  });

  describe('GET /api/v1/urls/my (Get My URLs)', () => {
    it('should return 401 if unauthorized', async () => {
      getUserFromToken.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/urls/my');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return list of user URLs if authorized', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.findByUserId.mockResolvedValue({
        urls: [
          { _id: '60c72b2f9b1d8b0015f69c62', originalUrl: 'https://google.com', shortCode: 'g', clicks: 5 },
          { _id: '60c72b2f9b1d8b0015f69c63', originalUrl: 'https://yahoo.com', shortCode: 'y', clicks: 2 }
        ],
        total: 2
      });

      const response = await request(app)
        .get('/api/v1/urls/my')
        .set('Authorization', 'Bearer dummy-token')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.urls).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
      expect(UrlRepository.findByUserId).toHaveBeenCalledWith('60c72b2f9b1d8b0015f69c5d', { page: 1, limit: 10 });
    });
  });

  describe('GET /api/v1/urls/:id (Get URL details)', () => {
    it('should return 401 if unauthorized', async () => {
      getUserFromToken.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/urls/${validObjectId}`);

      expect(response.status).toBe(401);
    });

    it('should return URL details if owned by user', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.findByIdAndUser.mockResolvedValue({
        _id: validObjectId,
        originalUrl: 'https://google.com',
        shortCode: 'abc12345',
        clicks: 10
      });

      const response = await request(app)
        .get(`/api/v1/urls/${validObjectId}`)
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalUrl).toBe('https://google.com');
      expect(UrlRepository.findByIdAndUser).toHaveBeenCalledWith(validObjectId, '60c72b2f9b1d8b0015f69c5d');
    });

    it('should return 404 if URL not found or not owned', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.findByIdAndUser.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/v1/urls/${validObjectId}`)
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/urls/:id (Update URL)', () => {
    it('should successfully update URL if owned by user', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.updateByIdAndUser.mockResolvedValue({
        _id: validObjectId,
        originalUrl: 'https://newgoogle.com',
        shortCode: 'abc12345'
      });

      const response = await request(app)
        .patch(`/api/v1/urls/${validObjectId}`)
        .set('Authorization', 'Bearer dummy-token')
        .send({ originalUrl: 'https://newgoogle.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.originalUrl).toBe('https://newgoogle.com');
      expect(UrlRepository.updateByIdAndUser).toHaveBeenCalledWith(
        validObjectId,
        '60c72b2f9b1d8b0015f69c5d',
        { originalUrl: 'https://newgoogle.com' }
      );
    });

    it('should return 404 if URL to update is not found', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.updateByIdAndUser.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/api/v1/urls/${validObjectId}`)
        .set('Authorization', 'Bearer dummy-token')
        .send({ originalUrl: 'https://newgoogle.com' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/urls/:id (Delete URL)', () => {
    it('should successfully delete URL if owned by user', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.softDeleteByIdAndUser.mockResolvedValue({
        _id: validObjectId,
        originalUrl: 'https://google.com',
        isActive: false
      });

      const response = await request(app)
        .delete(`/api/v1/urls/${validObjectId}`)
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(UrlRepository.softDeleteByIdAndUser).toHaveBeenCalledWith(validObjectId, '60c72b2f9b1d8b0015f69c5d');
    });

    it('should return 404 if URL to delete is not found', async () => {
      getUserFromToken.mockResolvedValue(mockUser);
      UrlRepository.softDeleteByIdAndUser.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/v1/urls/${validObjectId}`)
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
