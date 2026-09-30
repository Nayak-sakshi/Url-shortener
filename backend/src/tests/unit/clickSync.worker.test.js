/**
 * Unit Tests: ClickSyncWorker
 */

jest.mock('../../repositories/url.repository');
jest.mock('../../repositories/redis.repository');
jest.mock('../../repositories/click.repository');

const UrlRepository   = require('../../repositories/url.repository');
const redisRepository = require('../../repositories/redis.repository');
const ClickRepository = require('../../repositories/click.repository');
const clickSyncWorker = require('../../workers/clickSync.worker');

describe('ClickSyncWorker.syncClicks', () => {
    const url = { _id: 'url-id-123', shortCode: 'abc12345' };

    beforeEach(() => {
        jest.clearAllMocks();
        redisRepository.scanKeys.mockResolvedValue(['click:abc12345']);
    });

    it('should bulk-insert one Click per counted click and update the URL counter', async () => {
        redisRepository.getDel.mockResolvedValue('3');
        UrlRepository.findByShortCode.mockResolvedValue(url);

        await clickSyncWorker.syncClicks();

        expect(redisRepository.getDel).toHaveBeenCalledWith('click:abc12345');
        expect(ClickRepository.createMany).toHaveBeenCalledTimes(1);
        expect(ClickRepository.createMany.mock.calls[0][0]).toHaveLength(3);
        expect(UrlRepository.increamentClickBy).toHaveBeenCalledWith('abc12345', 3);
    });

    it('should skip keys that have no pending clicks', async () => {
        redisRepository.getDel.mockResolvedValue(null);

        await clickSyncWorker.syncClicks();

        expect(UrlRepository.findByShortCode).not.toHaveBeenCalled();
        expect(ClickRepository.createMany).not.toHaveBeenCalled();
    });

    it('should restore the counter when the DB write fails', async () => {
        redisRepository.getDel.mockResolvedValue('2');
        UrlRepository.findByShortCode.mockResolvedValue(url);
        ClickRepository.createMany.mockRejectedValue(new Error('DB write failed'));

        await clickSyncWorker.syncClicks();

        expect(redisRepository.incrementBy).toHaveBeenCalledWith('click:abc12345', 2);
    });

    it('should not throw when Redis is unavailable', async () => {
        redisRepository.scanKeys.mockRejectedValue(new Error('Redis down'));

        await expect(clickSyncWorker.syncClicks()).resolves.toBeUndefined();
    });
});
