const AnalyticsService = require("../services/dashboard.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

class AnalyticsController {
    getAnalytics = asyncHandler(async (req, res) => {

        const analytics =
            await AnalyticsService.getUrlAnalytics(

                req.params.urlId,

                req.user.id

            );

        return ApiResponse.success(

            res,

            analytics,

            "Analytics fetched successfully"

        );

    });
}

module.exports = new AnalyticsController();
