const CacheHelper = require("../helpers/cache.helper");
const AppError = require("../errors/AppError");

const rateLimiter = (options) => {
    return async (req, res, next) => {
        try {
            const clientIp =
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress;

            const key = `rate_limit:${clientIp}`;

            const requestCount = await CacheHelper.incr(key);

            if (requestCount === 1) {
                await CacheHelper.expire(key, options.WINDOW);
            }

            if (requestCount > options.MAX_REQUESTS) {
                throw new AppError(
                    "Too many requests. Please try again later.",
                    429
                );
            }

            res.set({
                "X-RateLimit-Limit": options.MAX_REQUESTS,
                "X-RateLimit-Remaining": Math.max(
                    0,
                    options.MAX_REQUESTS - requestCount
                )
            });

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = rateLimiter;