const urlService = require('../services/url.service');
const AppResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createShortUrl = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;
    const data = await urlService.createShortUrl(originalUrl);

    return res.status(201).json(
        new AppResponse(201,
            'Short URL created successfully',
            data
        )
    );
})

const redirect = asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const originalUrl = await urlService.redirect(shortCode);
    return res.redirect(originalUrl);
})

module.exports = { createShortUrl, redirect };