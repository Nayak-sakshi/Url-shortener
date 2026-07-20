const { nanoid } = require('nanoid');
const UrlRepository = require('../repositories/url.repository');
const redisRepository = require("../repositories/redis.repository");
const { validateAccessibleUrl, RESERVED_ALIASES } = require('../helpers/url.helper');
const { pick } = require("../helpers/object.helper");

const AppError = require('../errors/AppError')

const MAX_SHORTCODE_RETRIES = 5;
class UrlService {

    buildShortUrlResponse(url) {

        return {
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
            clicks: url.clicks,
            createdAt: url.createdAt,
            expiresAt: url.expiresAt
        };

    } 
async createShortUrl(data, userId) {

    const {
        originalUrl,
        expiresAt,
        customAlias
    } = data;

    if (!originalUrl) {
        throw new AppError(
            "Original URL is required",
            400
        );
    }
    for (let attempt = 1; attempt <= MAX_SHORTCODE_RETRIES; attempt++) {

        try {

            const shortCode =
                await this.generateShortCode(customAlias);

            const url =
                await UrlRepository.create({

                    originalUrl,

                    shortCode,

                    expiresAt,

                    userId,

                    isCustomAlias: Boolean(customAlias)

                });

            return this.buildShortUrlResponse(url);

        } catch (error) {

            // Duplicate alias or generated code
            if (error.code === 11000) {

                // If it's a custom alias,
                // retrying doesn't make sense.
                if (customAlias) {
                    throw new AppError(
                        "Alias already exists.",
                        409
                    );
                }

                continue;
            }

            throw error;

        }

    }

    throw new AppError(
        "Unable to generate a unique short code. Please try again.",
        500
    );

}
    async generateShortCode(customAlias) {

        // ---------- Custom Alias ----------
        if (customAlias) {

            const alias = customAlias.trim().toLowerCase();

            if (RESERVED_ALIASES.includes(alias)) {
                throw new AppError(
                    "This alias is reserved.",
                    400
                );
            }

            const existingAlias =
                await UrlRepository.findByShortCode(alias);

            if (existingAlias) {
                throw new AppError(
                    "Alias already exists.",
                    409
                );
            }

            return alias;
        }

        // ---------- Auto Generated Alias ----------
        const { nanoid } = await import("nanoid");

        return nanoid(8);

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
    async getMyUrls(userId, page = 1, limit = 10) {

        page = Math.max(Number(page) || 1, 1);
        limit = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const { urls, total } =
            await UrlRepository.findByUserId(userId, {
                page,
                limit
            });

        return {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1
            },
            urls
        };
    }
    async getUrlById(id, userId) {

        const url = await UrlRepository.findByIdAndUser(
            id,
            userId
        );

        if (!url) {
            throw new AppError(
                "URL not found",
                404
            );
        }

        return url;

    }
    async updateUrl(id, userId, data) {
         const updateData = pick(data, [
            "originalUrl",
            "expiresAt"
        ]);

        const url = await UrlRepository.updateByIdAndUser(
            id,
            userId,
            updateData
        );

        if (!url) {
            throw new AppError("URL not found", 404);
        }

        return url;

    }
    async deleteUrl(id, userId) {

        const url =
            await UrlRepository.softDeleteByIdAndUser(
                id,
                userId
            );

        if (!url) {
            throw new AppError(
                "URL not found",
                404
            );
        }

        return;
    }
}

module.exports = new UrlService();