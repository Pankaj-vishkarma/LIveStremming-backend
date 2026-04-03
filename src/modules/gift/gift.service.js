// src/modules/gift/gift.service.js

const Gift = require("./gift.model");

const getGifts = async () => {
    return await Gift.find().lean();
};

module.exports = {
    getGifts,
};