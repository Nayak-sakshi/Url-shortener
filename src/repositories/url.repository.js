const Url = require("../models/url.model");


class UrlRepository {
    async create(data) {
        return Url.create(data);
    }
    async findByShortCode(shortCode) {
        return Url.findOne({ shortCode });
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

}

module.exports = new UrlRepository();