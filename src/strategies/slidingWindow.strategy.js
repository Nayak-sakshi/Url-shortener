const fs = require("fs");
const path = require("path");
const CacheHelper = require("../helpers/cache.helper");

const slidingWindowScript = fs.readFileSync(
    path.join(__dirname, "../scripts/slidingWindow.lua"),
    "utf8"
);

class SlidingWindowStrategy {

    async consume(key, options) {

        const { WINDOW, MAX_REQUESTS } = options;

        const currentTime = Math.floor(Date.now() / 1000);

        const result = await CacheHelper.eval(
            slidingWindowScript,
            [key],
            [
                WINDOW,
                MAX_REQUESTS,
                currentTime
            ]
        );

        return {
            allowed: result[0] === 1,
            limit: result[1],
            remaining: result[2],
            retryAfter: result[3]
        };
    }
}

module.exports = new SlidingWindowStrategy();