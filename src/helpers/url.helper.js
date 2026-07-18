const AppError = require("../errors/AppError");
const redisRepository = require("../repositories/redis.repository");

const RESERVED_ALIASES = [
    "login",
    "register",
    "admin",
    "dashboard",
    "profile",
    "analytics",
    "api",
    "health",
    "favicon.ico"
];
const validateAccessibleUrl = async (url, cacheKey = null) => {

    if (!url.isActive) {
        throw new AppError(
            "This URL has been disabled",
            410
        );
    }

    if (url.expiresAt && new Date(url.expiresAt) <= new Date()) {

        if (cacheKey) {
            await redisRepository.del(cacheKey);
        }

        throw new AppError(
            "This URL has expired",
            410
        );
    }
};


module.exports = {
    validateAccessibleUrl, RESERVED_ALIASES
};