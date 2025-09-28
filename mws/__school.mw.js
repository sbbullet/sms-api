const { HTTPStatusCode, SUPER_ADMIN_ACESS_LEVEL, SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX } = require("../libs/constants");
const { isUserSuperAdmin, isUserSchoolAdmin } = require("../managers/_common/user.helper");

module.exports = ({ meta, config, managers, mongomodels }) => {
    return ({ req, res, next, results }) => {
        const accessLevel = results.__longToken.userKey;
        const unauthorizedResponseOptions = {
            ok: false,
            code: HTTPStatusCode.UNAUTHORIZED,
            msg: "Unauthorized. Super admin or school admin access required",
        };

        const isSuperAdmin = isUserSuperAdmin({ accessLevel });
        const isSchoolAdmin = accessLevel.startsWith(SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX);

        if (!isSuperAdmin && !isSchoolAdmin) {
            console.log("Neither a super admin not a school admin");
            return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
        }

        // Instead of calling the database we can use the Redis cache to store the user's access level
        // every time they are updated in the database. This way we can avoid the database call.
        // This is just a demonstration of how to use the database to get the user's latest access level.
        // This we way can unexpired tokens that might be used even after the user's access level has been changed
        // or user has been deleted.
        mongomodels.user
            .findById(results.__longToken.userId)
            .select({ accessLevel: 1 })
            .lean()
            .then((user) => {
                if (!user) {
                    console.log("User not found");
                    return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
                }

                const isSuperAdminNow = isUserSuperAdmin({ accessLevel: user.accessLevel });
                const isSchoolAdminNow = user.accessLevel.startsWith(SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX);

                const hasAccessLevelChanged = !isSuperAdminNow && !isSchoolAdminNow;

                if (hasAccessLevelChanged) {
                    console.log("User is not a super admin or a school admin. Access level has been changed");
                    return managers.responseDispatcher.dispatch(res, unauthorizedResponseOptions);
                }
                next({ ...user, isUserSuperAdmin: isSuperAdminNow, isUserSchoolAdmin: isSchoolAdminNow });
            })
            .catch((err) => {
                console.log("error in __school.mw.js", err);
                return managers.responseDispatcher.dispatch(res, {
                    ok: false,
                    code: HTTPStatusCode,
                    msg: "Internal Server Error",
                });
            });
    };
};
