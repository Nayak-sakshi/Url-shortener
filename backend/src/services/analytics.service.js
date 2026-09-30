const UrlRepository = require("../repositories/url.repository");
const ClickRepository = require("../repositories/click.repository");
const AppError = require("../errors/AppError");


class AnalyticsService {
    async getUrlAnalytics(urlId, userId) {

    const url =
        await UrlRepository.findByIdAndUser(
            urlId,
            userId
        );

    if (!url) {
        throw new AppError("URL not found",404);
    }

    const [

        totalClicks,

        todayClicks,

        last7Days

    ] = await Promise.all([

        ClickRepository.getTotalClicksByUrl(urlId),

        ClickRepository.getTodayClicksByUrl(urlId),

        ClickRepository.getLast7DaysClicks(urlId)

    ]);

    return {

        url: {

            id: url._id,

            originalUrl: url.originalUrl,

            shortCode: url.shortCode

        },

        analytics: {

            totalClicks,

            todayClicks,

            last7Days

        }

    };

}
}
module.exports = new AnalyticsService();