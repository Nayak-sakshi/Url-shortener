const { redisClient } = require("../config/redis");

class CacheHelper {

    async get(key) {
        try {
            return await redisClient.get(key);
        } catch (error) {
            throw new Error(`Cache get error for key "${key}": ${error.message}`);
        }
    }

    async set(key, value, ttl = null) {
        try {
            if (ttl) {
                return await redisClient.set(key, value, {
                    EX: ttl
                });
            }

            return await redisClient.set(key, value);
        } catch (error) {
            throw new Error(`Cache set error for key "${key}": ${error.message}`);
        }
    }

    async del(key) {
        try {
            return await redisClient.del(key);
        } catch (error) {
            throw new Error(`Cache del error for key "${key}": ${error.message}`);
        }
    }

    async exists(key) {
        try {
            return await redisClient.exists(key);
        } catch (error) {
            throw new Error(`Cache exists error for key "${key}": ${error.message}`);
        }
    }

    async incr(key) {
        try {
            return await redisClient.incr(key);
        } catch (error) {
            throw new Error(`Cache incr error for key "${key}": ${error.message}`);
        }
    }

    async expire(key, seconds) {
        try {
            return await redisClient.expire(key, seconds);
        } catch (error) {
            throw new Error(`Cache expire error for key "${key}": ${error.message}`);
        }
    }

    async ttl(key) {
        try {
            return await redisClient.ttl(key);
        } catch (error) {
            throw new Error(`Cache ttl error for key "${key}": ${error.message}`);
        }
    }

    async zAdd(key, score, member) {
        try {
            return await redisClient.zAdd(key, {
                score,
                value: member
            });
        } catch (error) {
            throw new Error(`Cache zAdd error for key "${key}": ${error.message}`);
        }
    }

    async zRemRangeByScore(key, min, max) {
        try {
            return await redisClient.zRemRangeByScore(key, min, max);
        } catch (error) {
            throw new Error(`Cache zRemRangeByScore error for key "${key}": ${error.message}`);
        }
    }

    async zCard(key) {
        try {
            return await redisClient.zCard(key);
        } catch (error) {
            throw new Error(`Cache zCard error for key "${key}": ${error.message}`);
        }
    }

    async zRange(key, start, stop) {
        try {
            return await redisClient.zRange(key, start, stop);
        } catch (error) {
            throw new Error(`Cache zRange error for key "${key}": ${error.message}`);
        }
    }
    async hGetAll(key) {
        try {
            return await redisClient.hGetAll(key);
        } catch (error) {
            throw new Error(`Cache hGetAll error for key "${key}": ${error.message}`);
        }
    }

    async hSet(key, values) {
        try {
            return await redisClient.hSet(key, values);
        } catch (error) {
            throw new Error(`Cache hSet error for key "${key}": ${error.message}`);
        }
    }
    async eval(script, keys, args) {
        try {
            return await redisClient.eval(script, {
                keys,
                arguments: args.map(String)
            });
        } catch (error) {
            throw new Error(`Cache eval error: ${error.message}`);
        }
    }
}

module.exports = new CacheHelper();