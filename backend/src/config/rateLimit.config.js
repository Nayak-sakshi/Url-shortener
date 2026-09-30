const fixedWindowStrategy = require("../strategies/fixedWindow.strategy");
const slidingWindowStrategy = require("../strategies/slidingWindow.strategy");

module.exports = {

    LOGIN: {
        NAME: "login",
        strategy: slidingWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 5
    },

    REGISTER: {
        NAME: "register",
        strategy: fixedWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 3
    },

    CREATE_URL: {
        NAME: "create_url",
        strategy: fixedWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 20
    },

    REDIRECT: {
        NAME: "redirect",
        strategy: fixedWindowStrategy,
        WINDOW: 60,
        MAX_REQUESTS: 300
    }

};