const { nanoid } = require('nanoid');
const UrlRepository = require('../repositories/url.repository');
const redisRepository = require("../repositories/redis.repository");
const { validateAccessibleUrl } = require('../helpers/url.helper');

const AppError = require('../errors/AppError')

class UrlService {
    async createShortUrl(data) {
        if (!originalUrl) {
            throw new AppError('Original URL is required', 400);
        }

        let url;
        let isCreated = false;

        while (!isCreated) {

            try {
                const { originalUrl, expiresAt } = data;

                const shortCode = nanoid(8);

                url = await UrlRepository.create({
                    originalUrl,
                    shortCode,
                    expiresAt
                });
                console.log("Saved document", url);
                isCreated = true;

            } catch (error) {
                if (error.code === 11000) {
                    continue
                } else {
                    throw error;
                }
            }
        }
        return {
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
            clicks: url.clicks,
            createAt: url.createdAt,
        };
    }
    async redirect(shortCode) {

        const cacheKey = `url:${shortCode}`;

        // STEP 1 - Check Redis
        const cachedData = await redisRepository.get(cacheKey);

        if (cachedData) {

            const url = JSON.parse(cachedData);

            console.log("✅ Cache HIT");

            await validateAccessibleUrl(url, cacheKey);


            console.log(`Increasing click:${shortCode}`);

            await redisRepository.increment(`click:${shortCode}`);

            return url.originalUrl;
        }

        console.log("❌ Cache MISS");

        // STEP 2 - MongoDB
        const url = await UrlRepository.findByShortCode(shortCode);

        if (!url) {
            throw new AppError("Short URL not found", 404);
        }

        await validateAccessibleUrl(url, cacheKey);

        // STEP 3 - Save in Redis
        await redisRepository.set(
            cacheKey,
            JSON.stringify({
                originalUrl: url.originalUrl,
                isActive: url.isActive,
                expiresAt: url.expiresAt
            })
        );

        // STEP 4 - Increment Click
        await redisRepository.increment(`click:${shortCode}`);

        return url.originalUrl;
    }

}

module.exports = new UrlService();