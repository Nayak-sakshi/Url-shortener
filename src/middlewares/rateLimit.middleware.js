const CacheHelper = require("../helpers/cache.helper");
const AppError = require("../errors/AppError");

const rateLimiter = (options) => {
    return async (req, res, next) => {
        try {

            const { strategy } = options;

            const key = `rate_limit:${req.ip}`;

            const result = await strategy.consume(
                key,
                options
            );

            res.setHeader(
                "X-RateLimit-Limit",
                result.limit
            );

            res.setHeader(
                "X-RateLimit-Remaining",
                result.remaining
            );

            res.setHeader(
                "Retry-After",
                result.retryAfter
            );

            if (!result.allowed) {
                throw new AppError(
                    "Too many requests",
                    429
                );
            }

            next();

        } catch (error) {
            next(error);
        }
    };
};

module.exports = rateLimiter;