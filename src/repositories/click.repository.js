const Click = require("../models/click.model");

class ClickRepository {
    async create(data) {
        return Click.create(data);
    }
    async getTotalClicks(userId) {

        return Click.aggregate([
            {
                $lookup: {
                    from: "urls",
                    localField: "urlId",
                    foreignField: "_id",
                    as: "url"
                }
            },
            {
                $unwind: "$url"
            },
            {
                $match: {
                    "url.userId": userId
                }
            },
            {
                $count: "totalClicks"
            }
        ]);
        return result[0]?.totalClicks || 0;

    }
    async getTotalClicksByUrl(urlId) {
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        return Click.countDocuments({
            urlId,
            clickedAt: {
                $gte: today
            }
        });

    }
    async getLast7DaysClicks(urlId) {

        const sevenDaysAgo = new Date();

        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        sevenDaysAgo.setHours(0, 0, 0, 0);

        return Click.aggregate([

            {
                $match: {

                    urlId,

                    clickedAt: {

                        $gte: sevenDaysAgo

                    }

                }
            },

            {
                $group: {

                    _id: {

                        $dateToString: {

                            format: "%Y-%m-%d",

                            date: "$clickedAt"

                        }

                    },

                    clicks: {

                        $sum: 1

                    }

                }
            },

            {
                $sort: {

                    _id: 1

                }
            },

            {
                $project: {

                    _id: 0,

                    date: "$_id",

                    clicks: 1

                }
            }

        ]);

    }
}
module.exports = new ClickRepository();