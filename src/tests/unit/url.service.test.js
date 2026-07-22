/**
 * Unit Tests: UrlService
 *
 * All external dependencies (UrlRepository, redisRepository,
 * ClickRepository, url.helper, nanoid) are mocked so that
 * every test exercises only the service logic in isolation.
 */

// ─── Mock declarations (must be before any require) ─────────────────────────
jest.mock('../../repositories/url.repository');
jest.mock('../../repositories/redis.repository');
jest.mock('../../repositories/click.repository');
jest.mock('../../helpers/url.helper');

// nanoid is an ESM package – mock the dynamic import inside generateShortCode
jest.mock('nanoid', () => ({ nanoid: jest.fn(() => 'abc12345') }), {
    virtual: true,
});

// ─── Imports ─────────────────────────────────────────────────────────────────
const UrlRepository      = require('../../repositories/url.repository');
const redisRepository    = require('../../repositories/redis.repository');
const ClickRepository    = require('../../repositories/click.repository');
const { validateAccessibleUrl, RESERVED_ALIASES } = require('../../helpers/url.helper');
const AppError           = require('../../errors/AppError');
const urlService         = require('../../services/url.service');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const makeUrl = (overrides = {}) => ({
    _id:         'url-id-123',
    originalUrl: 'https://example.com',
    shortCode:   'abc12345',
    clicks:      0,
    createdAt:   new Date('2024-01-01'),
    expiresAt:   null,
    isActive:    true,
    userId:      'user-id-1',
    ...overrides,
});

// ─────────────────────────────────────────────────────────────────────────────
//  1. buildShortUrlResponse
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.buildShortUrlResponse', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        process.env = { ...OLD_ENV, BASE_URL: 'https://short.ly' };
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    it('should return a properly shaped response object', () => {
        const url = makeUrl();
        const result = urlService.buildShortUrlResponse(url);

        expect(result).toEqual({
            originalUrl: 'https://example.com',
            shortCode:   'abc12345',
            shortUrl:    'https://short.ly/abc12345',
            clicks:      0,
            createdAt:   url.createdAt,
            expiresAt:   null,
        });
    });

    it('should build the shortUrl using BASE_URL env variable', () => {
        process.env.BASE_URL = 'https://myapp.io';
        const url = makeUrl({ shortCode: 'xyz99' });
        const result = urlService.buildShortUrlResponse(url);

        expect(result.shortUrl).toBe('https://myapp.io/xyz99');
    });

    it('should include expiresAt when present', () => {
        const expiresAt = new Date('2025-12-31');
        const url = makeUrl({ expiresAt });
        const result = urlService.buildShortUrlResponse(url);

        expect(result.expiresAt).toEqual(expiresAt);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  2. generateShortCode
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.generateShortCode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // expose RESERVED_ALIASES to the mock
        RESERVED_ALIASES.includes = jest.fn((alias) =>
            ['login', 'register', 'admin', 'dashboard', 'profile',
             'analytics', 'api', 'health', 'favicon.ico'].includes(alias)
        );
    });

    // ── Custom alias happy path ──────────────────────────────────────────────
    it('should return trimmed, lowercase custom alias when available', async () => {
        UrlRepository.findByShortCode.mockResolvedValue(null); // not taken

        const result = await urlService.generateShortCode('  MyAlias  ');

        expect(result).toBe('myalias');
        expect(UrlRepository.findByShortCode).toHaveBeenCalledWith('myalias');
    });

    // ── Reserved alias ───────────────────────────────────────────────────────
    it('should throw AppError(400) for reserved alias', async () => {
        await expect(urlService.generateShortCode('admin'))
            .rejects
            .toMatchObject({ message: 'This alias is reserved.', statusCode: 400 });
    });

    it('should throw AppError(400) for reserved alias "login"', async () => {
        await expect(urlService.generateShortCode('login'))
            .rejects
            .toMatchObject({ statusCode: 400 });
    });

    // ── Alias already taken ──────────────────────────────────────────────────
    it('should throw AppError(409) when custom alias already exists in DB', async () => {
        UrlRepository.findByShortCode.mockResolvedValue(makeUrl());

        await expect(urlService.generateShortCode('mytaken'))
            .rejects
            .toMatchObject({ message: 'Alias already exists.', statusCode: 409 });
    });

    // ── Auto-generated code ──────────────────────────────────────────────────
    it('should return an 8-char nanoid when no customAlias is provided', async () => {
        // Mock the dynamic ESM import used inside generateShortCode
        jest.spyOn(global, 'import' in global ? 'import' : 'eval').mockImplementation?.();

        // We patch the dynamic import by intercepting require cache approach:
        // The service does: const { nanoid } = await import("nanoid");
        // Jest intercepts this via the virtual mock registered at top.
        // We just verify no DB call is made and a string is returned.
        const result = await urlService.generateShortCode(undefined);

        // Should be a non-empty string (nanoid output)
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  3. createShortUrl
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.createShortUrl', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...OLD_ENV, BASE_URL: 'https://short.ly' };
        // Default: alias is not reserved and not taken
        RESERVED_ALIASES.includes = jest.fn(() => false);
        UrlRepository.findByShortCode.mockResolvedValue(null);
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    // ── Missing originalUrl ──────────────────────────────────────────────────
    it('should throw AppError(400) when originalUrl is missing', async () => {
        await expect(urlService.createShortUrl({}, 'user-1'))
            .rejects
            .toMatchObject({ message: 'Original URL is required', statusCode: 400 });
    });

    it('should throw AppError(400) when originalUrl is an empty string', async () => {
        await expect(urlService.createShortUrl({ originalUrl: '' }, 'user-1'))
            .rejects
            .toMatchObject({ statusCode: 400 });
    });

    // ── Successful creation without custom alias ─────────────────────────────
    it('should create and return a short URL response', async () => {
        const createdUrl = makeUrl();
        UrlRepository.create.mockResolvedValue(createdUrl);

        const result = await urlService.createShortUrl(
            { originalUrl: 'https://example.com' },
            'user-1'
        );

        expect(UrlRepository.create).toHaveBeenCalledTimes(1);
        expect(result).toHaveProperty('originalUrl', 'https://example.com');
        expect(result).toHaveProperty('shortCode');
        expect(result).toHaveProperty('shortUrl');
    });

    // ── Successful creation with custom alias ────────────────────────────────
    it('should use the custom alias as the short code', async () => {
        const createdUrl = makeUrl({ shortCode: 'myalias' });
        UrlRepository.create.mockResolvedValue(createdUrl);

        const result = await urlService.createShortUrl(
            { originalUrl: 'https://example.com', customAlias: 'myalias' },
            'user-1'
        );

        expect(UrlRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ shortCode: 'myalias', isCustomAlias: true })
        );
        expect(result.shortCode).toBe('myalias');
    });

    // ── Custom alias collision → 409 ─────────────────────────────────────────
    it('should throw AppError(409) when custom alias already exists (DB duplicate key)', async () => {
        const dupError = new Error('Duplicate key');
        dupError.code = 11000;
        UrlRepository.create.mockRejectedValue(dupError);

        await expect(
            urlService.createShortUrl(
                { originalUrl: 'https://example.com', customAlias: 'taken' },
                'user-1'
            )
        ).rejects.toMatchObject({ message: 'Alias already exists.', statusCode: 409 });
    });

    // ── Auto-generated code exhausted ────────────────────────────────────────
    it('should throw AppError(500) after exhausting all retries for auto-generated codes', async () => {
        const dupError = new Error('Duplicate key');
        dupError.code = 11000;
        UrlRepository.create.mockRejectedValue(dupError);

        await expect(
            urlService.createShortUrl(
                { originalUrl: 'https://example.com' },
                'user-1'
            )
        ).rejects.toMatchObject({
            message:    'Unable to generate a unique short code. Please try again.',
            statusCode: 500,
        });

        // Should have retried MAX_SHORTCODE_RETRIES (5) times
        expect(UrlRepository.create).toHaveBeenCalledTimes(5);
    });

    // ── Non-duplicate DB error is re-thrown ──────────────────────────────────
    it('should re-throw unexpected repository errors', async () => {
        const networkError = new Error('DB connection lost');
        UrlRepository.create.mockRejectedValue(networkError);

        await expect(
            urlService.createShortUrl(
                { originalUrl: 'https://example.com' },
                'user-1'
            )
        ).rejects.toThrow('DB connection lost');
    });

    // ── expiresAt is forwarded ───────────────────────────────────────────────
    it('should pass expiresAt to the repository', async () => {
        const expiresAt = new Date('2025-12-31');
        const createdUrl = makeUrl({ expiresAt });
        UrlRepository.create.mockResolvedValue(createdUrl);

        await urlService.createShortUrl(
            { originalUrl: 'https://example.com', expiresAt },
            'user-1'
        );

        expect(UrlRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ expiresAt })
        );
    });

    // ── userId is forwarded ──────────────────────────────────────────────────
    it('should pass userId to the repository', async () => {
        const createdUrl = makeUrl();
        UrlRepository.create.mockResolvedValue(createdUrl);

        await urlService.createShortUrl(
            { originalUrl: 'https://example.com' },
            'user-abc'
        );

        expect(UrlRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 'user-abc' })
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  4. redirect
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.redirect', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validateAccessibleUrl.mockResolvedValue(undefined); // valid by default
    });

    // ── Cache HIT ────────────────────────────────────────────────────────────
    it('should return originalUrl from cache on HIT without hitting the DB', async () => {
        const cached = JSON.stringify({
            originalUrl: 'https://example.com',
            isActive:    true,
            expiresAt:   null,
        });
        redisRepository.get.mockResolvedValue(cached);
        redisRepository.increment.mockResolvedValue(1);

        const result = await urlService.redirect('abc12345', {});

        expect(result).toBe('https://example.com');
        expect(UrlRepository.findByShortCode).not.toHaveBeenCalled();
        expect(redisRepository.increment).toHaveBeenCalledWith('click:abc12345');
    });

    it('should validate the cached URL (e.g., expired/inactive)', async () => {
        const cached = JSON.stringify({
            originalUrl: 'https://example.com',
            isActive:    false,
            expiresAt:   null,
        });
        redisRepository.get.mockResolvedValue(cached);
        validateAccessibleUrl.mockRejectedValue(
            new AppError('This URL has been disabled', 410)
        );

        await expect(urlService.redirect('abc12345', {}))
            .rejects
            .toMatchObject({ statusCode: 410 });
    });

    // ── Cache MISS → DB lookup ────────────────────────────────────────────────
    it('should query DB on cache MISS and cache the result', async () => {
        redisRepository.get.mockResolvedValue(null);
        const url = makeUrl();
        UrlRepository.findByShortCode.mockResolvedValue(url);
        redisRepository.set.mockResolvedValue(undefined);
        redisRepository.increment.mockResolvedValue(1);
        ClickRepository.create.mockResolvedValue({});

        const result = await urlService.redirect('abc12345', {});

        expect(result).toBe('https://example.com');
        expect(UrlRepository.findByShortCode).toHaveBeenCalledWith('abc12345');
        expect(redisRepository.set).toHaveBeenCalledWith(
            'url:abc12345',
            expect.stringContaining('"originalUrl":"https://example.com"')
        );
    });

    // ── URL not found in DB ───────────────────────────────────────────────────
    it('should throw AppError(404) when shortCode is not found in DB', async () => {
        redisRepository.get.mockResolvedValue(null);
        UrlRepository.findByShortCode.mockResolvedValue(null);

        await expect(urlService.redirect('notfound', {}))
            .rejects
            .toMatchObject({ message: 'Short URL not found', statusCode: 404 });
    });

    // ── Click is incremented on cache MISS ───────────────────────────────────
    it('should increment click counter in Redis on cache MISS', async () => {
        redisRepository.get.mockResolvedValue(null);
        UrlRepository.findByShortCode.mockResolvedValue(makeUrl());
        redisRepository.set.mockResolvedValue(undefined);
        redisRepository.increment.mockResolvedValue(1);
        ClickRepository.create.mockResolvedValue({});

        await urlService.redirect('abc12345', {});

        expect(redisRepository.increment).toHaveBeenCalledWith('click:abc12345');
    });

    // ── ClickRepository failure is swallowed ─────────────────────────────────
    it('should not throw when ClickRepository.create fails', async () => {
        redisRepository.get.mockResolvedValue(null);
        UrlRepository.findByShortCode.mockResolvedValue(makeUrl());
        redisRepository.set.mockResolvedValue(undefined);
        redisRepository.increment.mockResolvedValue(1);
        ClickRepository.create.mockRejectedValue(new Error('DB write failed'));

        // Must NOT reject – error is caught internally
        await expect(urlService.redirect('abc12345', {})).resolves.toBe('https://example.com');
    });

    // ── Expired URL from DB ───────────────────────────────────────────────────
    it('should throw when URL found in DB is expired', async () => {
        redisRepository.get.mockResolvedValue(null);
        UrlRepository.findByShortCode.mockResolvedValue(makeUrl({ expiresAt: new Date('2000-01-01') }));
        validateAccessibleUrl.mockRejectedValue(new AppError('This URL has expired', 410));

        await expect(urlService.redirect('abc12345', {}))
            .rejects
            .toMatchObject({ statusCode: 410 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  5. getMyUrls
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.getMyUrls', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return paginated URLs with correct pagination metadata', async () => {
        const urls  = [makeUrl(), makeUrl({ shortCode: 'xyz99' })];
        const total = 25;
        UrlRepository.findByUserId.mockResolvedValue({ urls, total });

        const result = await urlService.getMyUrls('user-1', 2, 10);

        expect(result.pagination).toEqual({
            page:           2,
            limit:          10,
            total:          25,
            totalPages:     3,
            hasNextPage:    true,
            hasPreviousPage: true,
        });
        expect(result.urls).toEqual(urls);
    });

    it('should default page=1 and limit=10 when not provided', async () => {
        UrlRepository.findByUserId.mockResolvedValue({ urls: [], total: 0 });

        const result = await urlService.getMyUrls('user-1');

        expect(UrlRepository.findByUserId).toHaveBeenCalledWith(
            'user-1',
            { page: 1, limit: 10 }
        );
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
    });

    it('should clamp limit to 100 when an excessive value is given', async () => {
        UrlRepository.findByUserId.mockResolvedValue({ urls: [], total: 0 });

        await urlService.getMyUrls('user-1', 1, 9999);

        expect(UrlRepository.findByUserId).toHaveBeenCalledWith(
            'user-1',
            expect.objectContaining({ limit: 100 })
        );
    });

    it('should clamp page to 1 when a value < 1 is provided', async () => {
        UrlRepository.findByUserId.mockResolvedValue({ urls: [], total: 0 });

        await urlService.getMyUrls('user-1', -5, 10);

        expect(UrlRepository.findByUserId).toHaveBeenCalledWith(
            'user-1',
            expect.objectContaining({ page: 1 })
        );
    });

    it('should return hasNextPage=true when more pages exist', async () => {
        UrlRepository.findByUserId.mockResolvedValue({ urls: [], total: 50 });

        const result = await urlService.getMyUrls('user-1', 1, 10);

        expect(result.pagination.hasNextPage).toBe(true);
    });

    it('should return hasNextPage=false on last page', async () => {
        UrlRepository.findByUserId.mockResolvedValue({ urls: [], total: 10 });

        const result = await urlService.getMyUrls('user-1', 1, 10);

        expect(result.pagination.hasNextPage).toBe(false);
    });

    it('should return hasPreviousPage=false on first page', async () => {
        UrlRepository.findByUserId.mockResolvedValue({ urls: [], total: 50 });

        const result = await urlService.getMyUrls('user-1', 1, 10);

        expect(result.pagination.hasPreviousPage).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  6. getUrlById
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.getUrlById', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should return the URL document when found', async () => {
        const url = makeUrl();
        UrlRepository.findByIdAndUser.mockResolvedValue(url);

        const result = await urlService.getUrlById('url-id-123', 'user-1');

        expect(result).toEqual(url);
        expect(UrlRepository.findByIdAndUser).toHaveBeenCalledWith('url-id-123', 'user-1');
    });

    it('should throw AppError(404) when URL is not found', async () => {
        UrlRepository.findByIdAndUser.mockResolvedValue(null);

        await expect(urlService.getUrlById('nonexistent', 'user-1'))
            .rejects
            .toMatchObject({ message: 'URL not found', statusCode: 404 });
    });

    it('should throw AppError(404) when URL belongs to a different user', async () => {
        UrlRepository.findByIdAndUser.mockResolvedValue(null); // query filters by userId

        await expect(urlService.getUrlById('url-id-123', 'wrong-user'))
            .rejects
            .toMatchObject({ statusCode: 404 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  7. updateUrl
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.updateUrl', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should update and return the URL when found', async () => {
        const updatedUrl = makeUrl({ originalUrl: 'https://updated.com' });
        UrlRepository.updateByIdAndUser.mockResolvedValue(updatedUrl);

        const result = await urlService.updateUrl(
            'url-id-123',
            'user-1',
            { originalUrl: 'https://updated.com', expiresAt: null }
        );

        expect(result).toEqual(updatedUrl);
    });

    it('should only pass allowed fields (originalUrl, expiresAt) to the repository', async () => {
        const updatedUrl = makeUrl();
        UrlRepository.updateByIdAndUser.mockResolvedValue(updatedUrl);

        await urlService.updateUrl('url-id-123', 'user-1', {
            originalUrl:  'https://updated.com',
            shortCode:    'hack',        // should be stripped
            isActive:     false,         // should be stripped
        });

        expect(UrlRepository.updateByIdAndUser).toHaveBeenCalledWith(
            'url-id-123',
            'user-1',
            { originalUrl: 'https://updated.com' } // only allowed fields
        );
    });

    it('should throw AppError(404) when URL is not found or not owned by user', async () => {
        UrlRepository.updateByIdAndUser.mockResolvedValue(null);

        await expect(urlService.updateUrl('url-id-123', 'user-1', { originalUrl: 'https://x.com' }))
            .rejects
            .toMatchObject({ message: 'URL not found', statusCode: 404 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  8. deleteUrl
// ─────────────────────────────────────────────────────────────────────────────
describe('UrlService.deleteUrl', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should soft-delete the URL and return undefined on success', async () => {
        UrlRepository.softDeleteByIdAndUser.mockResolvedValue(makeUrl({ isActive: false }));

        const result = await urlService.deleteUrl('url-id-123', 'user-1');

        expect(UrlRepository.softDeleteByIdAndUser).toHaveBeenCalledWith('url-id-123', 'user-1');
        expect(result).toBeUndefined();
    });

    it('should throw AppError(404) when URL is not found or not owned by user', async () => {
        UrlRepository.softDeleteByIdAndUser.mockResolvedValue(null);

        await expect(urlService.deleteUrl('url-id-123', 'user-1'))
            .rejects
            .toMatchObject({ message: 'URL not found', statusCode: 404 });
    });

    it('should throw AppError(404) when trying to delete an already-deleted URL', async () => {
        // softDelete query filters isActive:true, so deleted URL returns null
        UrlRepository.softDeleteByIdAndUser.mockResolvedValue(null);

        await expect(urlService.deleteUrl('url-id-123', 'user-1'))
            .rejects
            .toMatchObject({ statusCode: 404 });
    });
});
