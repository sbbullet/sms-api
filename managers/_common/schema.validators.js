const { address, pageSize } = require("./schema.models");

module.exports = {
    username: (data) => {
        if (data.trim().length < 3) {
            return false;
        }
        return true;
    },
    password: (data) => {
        if (data.trim().length < 8) {
            return false;
        }
        return true;
    },
    name: (data) => {
        if (data.trim().length < 3) {
            return false;
        }
        return true;
    },
    page: (data) => {
        return parseInt(data.trim(), 10);
    },
    pageSize: (data) => {
        return parseInt(data.trim(), 10);
    },
};
