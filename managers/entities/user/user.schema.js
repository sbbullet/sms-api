const { MONGO_OBJECT_ID_REGEX, SUPER_ADMIN_ACESS_LEVEL, USER_ACCESS_LEVEL } = require("../../../libs/constants");

module.exports = {
    createUser: [
        {
            model: "email",
            required: true,
        },
        {
            model: "password",
            required: true,
        },
        {
            path: "accessLevel",
            label: "Access Level",
            oneOf: [SUPER_ADMIN_ACESS_LEVEL, USER_ACCESS_LEVEL],
            onError: {
                oneOf: "$label must be either 'superAdmin' or 'user'",
            },
        },
    ],

    login: [
        {
            model: "email",
            required: true,
        },
        {
            model: "password",
            required: true,
        },
    ],

    updateUserAccessLevel: [
        {
            model: "accessLevel",
            label: "Access Level",
            required: true,
            oneOf: [SUPER_ADMIN_ACESS_LEVEL, USER_ACCESS_LEVEL],
            onError: {
                oneOf: "$label must be either 'superAdmin' or 'user'",
            },
        },
    ],

    pathParams: [
        {
            model: "mongoObjectId",
            path: "userId",
            label: "Path Param: User ID",
            required: true,
        },
    ],

    setUserAsSchoolAdmin: [
        {
            path: "schools",
            label: "Schools",
            type: "Array",
            length: { min: 1 },
            items: {
                type: "String",
                length: 24,
                regex: MONGO_OBJECT_ID_REGEX,
                onError: {
                    regex: "Invalid school ID. Must be a valid mongo object ID",
                    length: "School ID must be 24 characters long",
                },
            },
            required: true,
            onError: {
                type: "$label must be an array of school IDs",
                length: "$label must have at least one school ID",
                items: "$label is invalid",
            },
        },
    ],
};
