const { redisClient } = require("../config/redis");

class CacheHelper {

    async get(key) {
        return redisClient.get(key);
    }

    async set(key, value, ttl = null) {

        if (ttl) {
            return redisClient.set(key, value, {
                EX: ttl
            });
        }

        return redisClient.set(key, value);
    }

    async del(key) {
        return redisClient.del(key);
    }

    async exists(key) {
        return redisClient.exists(key);
    }

    async incr(key) {
        return redisClient.incr(key);
    }

    async expire(key, seconds) {
        return redisClient.expire(key, seconds);
    }

    async ttl(key) {
        return redisClient.ttl(key);
    }

}

module.exports = new CacheHelper();