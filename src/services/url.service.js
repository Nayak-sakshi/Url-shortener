const { nanoid } = require('nanoid');
const UrlRepository = require('../repositories/url.repository');
const redisRepository = require("../repositories/redis.repository");

const AppError = require('../errors/AppError')

class UrlService {
    async createShortUrl(originalUrl) {
        if (!originalUrl) {
            throw new AppError('Original URL is required', 400);
        }

        let url;
        let isCreated = false;

        while (!isCreated) {

            try {

                const shortCode = nanoid(8);
                url = await UrlRepository.create({
                    originalUrl,
                    shortCode,

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
        const cachedUrl = await redisRepository.get(cacheKey);

        if (cachedUrl) {

            console.log("✅ Cache HIT");

            await UrlRepository.incrementClicks(shortCode);

            return cachedUrl;
        }

        console.log("❌ Cache MISS");

        // STEP 2 - MongoDB
        const url = await UrlRepository.findByShortCode(shortCode);

        if (!url) {
            throw new AppError("Short URL not found", 404);
        }

        // STEP 3 - Save in Redis
        await redisRepository.set(
            cacheKey,
            url.originalUrl
        );

        // STEP 4 - Increment Click
        await UrlRepository.incrementClicks(shortCode);

        return url.originalUrl;
    }
    
}

module.exports = new UrlService();