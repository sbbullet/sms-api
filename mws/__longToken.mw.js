const { HTTPStatusCode } = require("../libs/constants");

module.exports = ({ meta, config, managers }) => {
    const unauthorizedResponseOptions = {
        ok: false,
        code: HTTPStatusCode.UNAUTHORIZED,
        msg: "Unauthorized",
    };
    return ({ req, res, next }) => {
        if (!req.headers.token) {
            console.log("token required but not found");
            return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
        }
        let decoded = null;
        try {
            decoded = managers.token.verifyLongToken({ token: req.headers.token });
            if (!decoded) {
                console.log("failed to decode-1");
                return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
            }
        } catch (err) {
            console.log("failed to decode-2");
            return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
        }
        next(decoded);
    };
};
