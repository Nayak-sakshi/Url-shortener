const redisRepository = require("../repositories/redis.repository");
const urlRepository = require("../repositories/url.repository");
const clickRepository = require("../repositories/click.repository");

class ClickSyncWorker {
    async syncClicks() {
        console.log("started syncing clicks...");

        const keys = await redisRepository.keys("click:*");
        // console.log("Keys: ", keys);
        for (const key of keys) {

            const count = await redisRepository.get(key);

            const shortCode = key.replace("click:", "");

            const url = await urlRepository.findByShortCode(shortCode);

            if (url) {
                // Create individual Click records for analytics
                for (let i = 0; i < Number(count); i++) {
                    await clickRepository.create({
                        urlId: url._id,
                        shortCode: url.shortCode
                    });
                }

                // Also update the URL clicks count
                await urlRepository.increamentClickBy(
                    shortCode,
                    Number(count)
                );
            }

            await redisRepository.del(key);

            console.log(
                `Synced ${count} clicks for ${shortCode}`
            );

        }
    }
}

module.exports = new ClickSyncWorker();
