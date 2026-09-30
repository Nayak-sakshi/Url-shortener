const urlService = require('../services/url.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createShortUrl = asyncHandler(async (req, res) => {
    const data = req.body;
    const result = await urlService.createShortUrl(data, req.user?.id || null);

    return res.status(201).json(
        new ApiResponse(201,
            'Short URL created successfully',
            result
        )
    );
})

const redirect = asyncHandler(async (req, res, next) => {
    const { shortCode } = req.params;
    
    // If the shortCode looks like a MongoDB ObjectId, pass handling to GET /:id route
    if (/^[0-9a-fA-F]{24}$/.test(shortCode)) {
        return next();
    }

    const originalUrl = await urlService.redirect(
        shortCode,
        req
    );
    return res.redirect(originalUrl);
})

const getMyUrls = asyncHandler(async (req, res) => {

    const result = await urlService.getMyUrls(
        req.user.id,
        req.query.page,
        req.query.limit
    );

    return ApiResponse.success(
        res,
        result,
        "URLs fetched successfully"
    );

});

const getUrl = asyncHandler(async (req, res) => {

    const result = await urlService.getUrlById(
        req.params.id,
        req.user.id
    );

    return ApiResponse.success(
        res,
        result,
        "URL fetched successfully"
    );

});
const updateUrl = asyncHandler(async (req, res) => {

    const result = await urlService.updateUrl(
        req.params.id,
        req.user.id,
        req.body
    );

    return ApiResponse.success(
        res,
        result,
        "URL updated successfully"
    );

});
const deleteUrl = asyncHandler(async (req, res) => {

    await urlService.deleteUrl(
        req.params.id,
        req.user.id
    );

    return ApiResponse.success(
        res,
        null,
        "URL deleted successfully"
    );

});
module.exports = { createShortUrl, redirect, getMyUrls, getUrl, updateUrl, deleteUrl};