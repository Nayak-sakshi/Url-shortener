const fixedWindowStrategy = require("../strategies/fixedWindow.strategy");
const slidingWindowStrategy = require("../strategies/slidingWindow.strategy");

module.exports = {

    LOGIN: {
        strategy: slidingWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 5
    },

    REGISTER: {
        strategy: fixedWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 3
    },

    CREATE_URL: {
        strategy: fixedWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 20
    },

    REDIRECT: {
        strategy: fixedWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 300
    }

};