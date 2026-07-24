const Click = require("../models/click.model");
const mongoose = require("mongoose");

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
        const result = await Click.countDocuments({ urlId });
        return result;

    }
    async getTodayClicksByUrl(urlId) {
        const today = new Date();

        today.setHours(0, 0, 0, 0);
        const result = await Click.countDocuments({
            urlId,
            clickedAt: {
                $gte: today
            }
        });
        return result;
    }
    async getLast7DaysClicks(urlId) {

        const sevenDaysAgo = new Date();

        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        sevenDaysAgo.setHours(0, 0, 0, 0);

        const result = await Click.aggregate([

            {
                $match: {

                    urlId: new mongoose.Types.ObjectId(urlId),

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

        return result;

    }
}
module.exports = new ClickRepository();
