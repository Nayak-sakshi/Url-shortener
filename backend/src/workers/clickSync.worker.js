const redisRepository = require("../repositories/redis.repository");
const urlRepository = require("../repositories/url.repository");
const clickRepository = require("../repositories/click.repository");

const CLICK_KEY_PREFIX = "click:";

class ClickSyncWorker {
    async syncClicks() {
        console.log("started syncing clicks...");

        try {

            const keys = await redisRepository.scanKeys(`${CLICK_KEY_PREFIX}*`);

            for (const key of keys) {
                await this.syncKey(key);
            }

        } catch (error) {
            console.error("Click sync failed:", error);
        }
    }

    async syncKey(key) {

        // Atomic read + delete so clicks arriving during sync are not lost
        const count = Number(await redisRepository.getDel(key));

        if (!count) {
            return;
        }

        const shortCode = key.slice(CLICK_KEY_PREFIX.length);

        try {

            const url = await urlRepository.findByShortCode(shortCode);

            if (url) {
                // Create individual Click records for analytics
                await clickRepository.createMany(
                    Array.from({ length: count }, () => ({
                        urlId: url._id,
                        shortCode: url.shortCode
                    }))
                );

                // Also update the URL clicks count
                await urlRepository.increamentClickBy(
                    shortCode,
                    count
                );
            }

            console.log(
                `Synced ${count} clicks for ${shortCode}`
            );

        } catch (error) {

            // Put the clicks back so the next run retries them
            await redisRepository.incrementBy(key, count);

            console.error(`Failed to sync clicks for ${shortCode}:`, error);

        }
    }
}

module.exports = new ClickSyncWorker();
