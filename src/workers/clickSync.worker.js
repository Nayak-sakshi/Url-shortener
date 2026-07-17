const redisRepository = require("../repositories/redis.repository");
const urlRepository = require("../repositories/url.repository");

class ClickSyncWorker {
    async syncClicks() {
        console.log("started syncing clicks...");

        const keys = await redisRepository.keys("click:*");
        // console.log("Keys: ", keys);
        for (const key of keys) {

            const count = await redisRepository.get(key);

            const shortCode = key.replace("click:", "");

            await urlRepository.increamentClickBy(
                shortCode,
                Number(count)
            );

            await redisRepository.del(key);

            console.log(
                `Synced ${count} clicks for ${shortCode}`
            );

        }
    }
}

module.exports = new ClickSyncWorker();
