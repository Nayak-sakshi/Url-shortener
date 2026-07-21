const CacheHelper = require("../helpers/cache.helper");

class TokenBucketStrategy {

    async consume(key, options) {

        const { CAPACITY, REFILL_RATE } = options;

        const currentTime = Math.floor(Date.now() / 1000);

        const bucket = await CacheHelper.hGetAll(key);

        let tokens;
        let lastRefill;

        if (Object.keys(bucket).length === 0) {

            tokens = CAPACITY;
            lastRefill = currentTime;

        } else {

            tokens = Number(bucket.tokens);
            lastRefill = Number(bucket.lastRefill);

        }

        const elapsedTime = currentTime - lastRefill;

        const refillTokens = elapsedTime * REFILL_RATE;

        tokens = Math.min(
            CAPACITY,
            tokens + refillTokens
        );

        lastRefill = currentTime;

        // Step 13 & 14 - Decision point: reject if not enough tokens
        if (tokens < 1) {
            const retryAfter = Math.ceil(1 / REFILL_RATE);

            return {
                allowed: false,
                limit: CAPACITY,
                remaining: 0,
                retryAfter
            };
        }

        // Step 15 - Consume a token
        tokens--;

        // Step 16 - Save updated bucket state
        await CacheHelper.hSet(key, {
            tokens,
            lastRefill
        });

        // Step 17 - Set expiry so idle buckets are cleaned up
        await CacheHelper.expire(
            key,
            Math.ceil(CAPACITY / REFILL_RATE)
        );

        // Step 18 - Return success
        return {
            allowed: true,
            limit: CAPACITY,
            remaining: tokens,
            retryAfter: 0
        };

    }

}

module.exports = new TokenBucketStrategy();