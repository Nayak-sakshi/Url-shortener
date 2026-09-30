const UrlRepository = require("../repositories/url.repository");
const ClickRepository = require("../repositories/click.repository");

class DashboardService {

    async getDashboard(userId) {

        const [
            totalUrls,
            activeUrls,
            deletedUrls,
            expiredUrls,
            totalClicks
        ] = await Promise.all([

            UrlRepository.getTotalUrls(userId),

            UrlRepository.getActiveUrls(userId),

            UrlRepository.getDeletedUrls(userId),

            UrlRepository.getExpiredUrls(userId),

            ClickRepository.getTotalClicks(userId)

        ]);

        return {

            totalUrls,

            activeUrls,

            deletedUrls,

            expiredUrls,

            totalClicks

        };

    }

}

module.exports = new DashboardService();