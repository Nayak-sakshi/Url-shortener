const Url = require("../models/url.model");

class UrlRepository {
    async create(data){
        return URL.create(data);
    }
    async fundByShortCode(shortCode){
        return Url.findOne({ shortCode });
    }
    async increaseClicks(shortCode){
        return Url.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } }, { new: true });
    }
}

module.exports = new UrlRepository();