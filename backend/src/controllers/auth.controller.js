const AuthService = require("../services/auth.service");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

class AuthController {

    register = asyncHandler(async (req, res) => {

        const result =
            await AuthService.register(req.body);

        return ApiResponse.success(
            res,
            result,
            "User registered successfully",
            201
        );

    });

    login = asyncHandler(async (req, res) => {

        const result =
            await AuthService.login(req.body);

        return ApiResponse.success(
            res,
            result,
            "Login successful"
        );

    });
    profile = asyncHandler(async (req, res) => {

        const result =
            await AuthService.getProfile(req.user.id);

        return ApiResponse.success(
            res,
            result,
            "Profile fetched successfully"
        );

    });

}

module.exports = new AuthController();