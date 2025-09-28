const { SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX, SUPER_ADMIN_ACESS_LEVEL } = require("../../libs/constants");

module.exports = {
    getSchoolsFromUserAccessLevel: ({ accessLevel }) => {
        if (accessLevel.startsWith(SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX)) {
            let schoolIds = accessLevel
                .split(SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX)[1]
                .split(",")
                .filter((schoolId) => schoolId.trim());

            return schoolIds;
        }

        return [];
    },

    isUserSchoolAdmin: ({ accessLevel, schoolId }) => {
        return accessLevel.startsWith(SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX) && accessLevel.includes(schoolId);
    },

    isUserSuperAdmin: ({ accessLevel }) => {
        return accessLevel === SUPER_ADMIN_ACESS_LEVEL;
    },
};
