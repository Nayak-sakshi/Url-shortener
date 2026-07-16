const { nanoid } = require('nanoid');
const UrlRepository = require('../repositories/url.repository');

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
        const url = await UrlRepository.findByShortCode(shortCode);

        if (!url) {
            throw new AppError("URL not found", 404);
        }

        await UrlRepository.increaseClicks(url._id);

        return url.originalUrl;

    }
}

module.exports = new UrlService();