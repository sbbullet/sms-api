const { HTTPStatusCode } = require("../../libs/constants");

module.exports = class ResponseDispatcher {
    constructor() {
        this.key = "responseDispatcher";
    }
    dispatch(res, { ok, data, code, errors, message, msg }) {
        let statusCode = code ? code : ok == true ? HTTPStatusCode.OK : HTTPStatusCode.BAD_REQUEST;
        return res.status(statusCode).send({
            ok: ok || false,
            data: data || {},
            errors: errors || [],
            message: msg || message || "",
        });
    }
};
