const pick = (object, allowedFields) => {

    const result = {};

    for (const field of allowedFields) {
        if (object[field] !== undefined) {
            result[field] = object[field];
        }
    }

    return result;
};

module.exports = {
    pick
};