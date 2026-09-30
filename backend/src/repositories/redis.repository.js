const { redisClient } = require("../config/redis");

class RedisRepository {
    async get(key) {
        return await redisClient.get(key);
    }

    async set(key, value, ttl = 3600) {
        await redisClient.set(
            key,
            value,
            {
                EX: ttl
            }
        );
    }

    async del(key) {
        return await redisClient.del(key);
    }
    // --------------------------
    // Counter Operations
    // --------------------------
    async increment(key) {
        return await redisClient.incr(key);
    }

    async incrementBy(key, value) {
        return await redisClient.incrBy(key, value);
    }

    // --------------------------
    // Utility
    // --------------------------

    async exists(key) {
        return await redisClient.exists(key);
    }

    async ttl(key) {
        return await redisClient.ttl(key);
    }

    async getDel(key) {
        return await redisClient.getDel(key);
    }

    async scanKeys(pattern, count = 100) {
        const keys = [];

        for await (const batch of redisClient.scanIterator({ MATCH: pattern, COUNT: count })) {
            keys.push(...batch);
        }

        return keys;
    }

}

module.exports = new RedisRepository();