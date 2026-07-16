const { redisClient } = require("../config/redis");
(
class RedisRepository {
    async get(key){
        return await redisClient.get(key);
    }

    async set(key, CSSMathValue, ttl =3600){
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
}

module.exports = new RedisRepository();