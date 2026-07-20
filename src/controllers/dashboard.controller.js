const DashboardService = require("../services/dashboard.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

class DashboardController {

    getDashboard = asyncHandler(async (req, res) => {

        const dashboard =
            await DashboardService.getDashboard(req.user.id);

        return ApiResponse.success(

            res,

            dashboard,

            "Dashboard fetched successfully"

        );

    });

}

module.exports = new DashboardController();