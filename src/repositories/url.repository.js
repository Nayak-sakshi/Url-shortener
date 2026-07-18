const Url = require("../models/url.model");


class UrlRepository {
    async create(data) {
        return Url.create(data);
    }
    async findByShortCode(shortCode) {
        return Url.findOne({ shortCode, isActive: true });
    }
    async findAndIncrementClicks(shortCode) {
        return Url.findOneAndUpdate(
            { shortCode },
            { $inc: { clicks: 1 } },
            { new: true }
        );
    }
    async increaseClicks(id) {
        return Url.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    }
    async findByOrignalUrl(originalUrl) {
        return Url.findOne({ originalUrl });
    }
    async findById(id) {
        return Url.findById(id);
    }
    async increamentClickBy(shortCode, count) {
        return Url.findOneAndUpdate(
            { shortCode },
            { $inc: { clicks: count } },
            { new: true }
        )
    }
    async findByUserId(userId, options = {}) {

        const {
            page = 1,
            limit = 10
        } = options;

        const skip = (page - 1) * limit;

        const query = {
            userId,
            isActive: true
        };

        const projection = {
            originalUrl: 1,
            shortCode: 1,
            clicks: 1,
            expiresAt: 1,
            createdAt: 1,
            updatedAt: 1
        };

        const [urls, total] = await Promise.all([

            Url.find(query)
                .select(projection)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Url.countDocuments(query)

        ]);

        return {
            urls,
            total
        };
    }
    async findByIdAndUser(id, userId) {

        return Url.findOne({
            _id: id,
            userId,
            isActive: true
        })
        .select({
            originalUrl: 1,
            shortCode: 1,
            clicks: 1,
            expiresAt: 1,
            createdAt: 1,
            updatedAt: 1,
            isCustomAlias: 1
        })
        .lean();

    }
    async updateByIdAndUser(id, userId, updateData) {

        return Url.findOneAndUpdate(
            {
                _id: id,
                userId,
                isActive: true
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        )
        .select(URL_DETAILS_FIELDS)
        .lean();

    }
    async softDeleteByIdAndUser(id, userId) {

        return Url.findOneAndUpdate(
            {
                _id: id,
                userId,
                isActive: true
            },
            {
                $set: {
                    isActive: false
                }
            },
            {
                new: true
            }
        ).lean();

    }
}

module.exports = new UrlRepository();