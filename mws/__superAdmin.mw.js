const { HTTPStatusCode, SUPER_ADMIN_ACESS_LEVEL } = require("../libs/constants");

module.exports = ({ meta, config, managers, mongomodels }) => {
    return ({ req, res, next, results }) => {
        const accessLevel = results.__longToken.userKey;
        const unauthorizedResponseOptions = {
            ok: false,
            code: HTTPStatusCode.UNAUTHORIZED,
            msg: "Unauthorized. Super admin access required",
        };

        if (accessLevel !== SUPER_ADMIN_ACESS_LEVEL) {
            console.log("accessLevel !== superAdmin");
            return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
        }

        mongomodels.user
            .findById(results.__longToken.userId)
            .lean()
            .then((superAdmin) => {
                if (!superAdmin) {
                    console.log("superAdmin not found");
                    return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
                }

                if (superAdmin.accessLevel !== SUPER_ADMIN_ACESS_LEVEL) {
                    console.log("superAdmin.accessLevel !== superAdmin as it would have been changed by now");
                    return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
                }
                next(superAdmin);
            })
            .catch((err) => {
                console.log("error in __superAdmin.mw.js", err);
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: HTTPStatusCode,
                    msg: "Internal Server Error",
                });
            });
    };
};
