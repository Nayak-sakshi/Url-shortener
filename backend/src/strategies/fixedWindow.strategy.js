const CacheHelper = require("../helpers/cache.helper");

class FixedWindowStrategy {

    async consume(key, options) {

        const { WINDOW, MAX_REQUESTS } = options;

        const requestCount = await CacheHelper.incr(key);

        if (requestCount === 1) {
            await CacheHelper.expire(key, WINDOW);
        }

        const remaining = Math.max(
            0,
            MAX_REQUESTS - requestCount
        );

        let retryAfter = 0;
        if (requestCount > MAX_REQUESTS) {
            retryAfter = await CacheHelper.ttl(key);
        }

        return {
            allowed: requestCount <= MAX_REQUESTS,
            limit: MAX_REQUESTS,
            remaining,
            retryAfter
        };
    }
}

module.exports = new FixedWindowStrategy();