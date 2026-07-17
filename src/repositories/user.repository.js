const User = require("../models/User");

class UserRepository {

    async create(data) {
        return User.create(data);
    }

    async findByEmail(email) {
        return User.findOne({ email });
    }

    async findById(id) {
        return User.findById(id);
    }

}

module.exports = new UserRepository();