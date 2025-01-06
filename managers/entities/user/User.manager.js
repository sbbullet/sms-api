const bcrypt = require("@node-rs/bcrypt");
const { paginate } = require("../../_common/mongoose.helper");
const { HTTPStatusCode, SUPER_ADMIN_ACESS_LEVEL } = require("../../../libs/constants");
const { getSchoolsFromUserAccessLevel } = require("../../_common/user.helper");

module.exports = class User {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels } = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "users";
        this.httpExposed = [
            "get=getUsers",
            "post=createFirstSuperAdmin",
            "post=createUser",
            "post=login",
            "patch=updateUserAccessLevel",
            "patch=setUserAsSchoolAdmin",
            "patch=unsetUserAsSchoolAdmin",
            "delete=deleteUser",
        ];
    }

    // This method is used to create the first super admin
    async createFirstSuperAdmin({ email, password }) {
        const user = { email, password, accessLevel: SUPER_ADMIN_ACESS_LEVEL };
        const superAdmin = await this.mongomodels.user.findOne({ accessLevel: SUPER_ADMIN_ACESS_LEVEL }).lean();
        if (superAdmin) {
            return {
                error: "First super admin has already been created",
                code: HTTPStatusCode.CONFLICT,
            };
        }

        return this.createUser(user);
    }

    // This method is used to create a user record
    async createUser({ email, password, accessLevel, __longToken, __superAdmin }) {
        const user = { email, password, accessLevel: accessLevel || "user" };

        // Data validation
        const validationError = await this.validators.user.createUser(user);
        if (validationError) return validationError;

        // Creation Logic
        const createdUser = await this.mongomodels.user.create(user);

        // Response
        return { ...createdUser.toObject({ versionKey: false }), password: undefined };
    }

    async deleteUser({ __longToken, __superAdmin, __params }) {
        const paramValidationError = await this.validators.user.pathParams({ userId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: userId } = __params;

        const deleteResponse = await this.mongomodels.user.deleteOne({ _id: userId });
        if (!deleteResponse.acknowledged) {
            return {
                error: "User deletion failed",
                code: HTTPStatusCode.INTERNAL_SERVER_ERROR,
            };
        }

        if (deleteResponse.acknowledged && !deleteResponse.deletedCount) {
            return {
                error: "User doesn't exist or has already been deleted",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        return {
            message: "User record has been deleted successfully",
            code: HTTPStatusCode.OK,
        };
    }

    // This method is used to login a user
    async login({ email, password }) {
        // Data validation so that we won't have to make unnecessary data calls for invalid data
        const validationError = await this.validators.user.login({ email, password });
        if (validationError) return validationError;

        const user = await this.mongomodels.user.findOne({ email }).select({ accessLevel: 1, password: 1 }).lean();
        if (!user) {
            // By not revealing whether the email exists or not, we make it harder for an
            // attacker to guess valid email addresses and perform a targeted brute
            return {
                error: "Unauthorized. Invalid credentials",
                code: HTTPStatusCode.UNAUTHORIZED,
            };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            //  The generic error message does not specify whether the email or password was
            //  incorrect, which protects against attackers being able to infer which part
            //  of the credentials is wrong.
            return {
                error: "Unauthorized. Invalid credentials",
                code: HTTPStatusCode.UNAUTHORIZED,
            };
        }

        let longToken = this.tokenManager.genLongToken({
            userId: user._id,
            userKey: user.accessLevel,
        });

        return {
            longToken,
        };
    }

    // This method is used to get a list of users
    async getUsers({ __longToken, __superAdmin, __query }) {
        const validationError = await this.validators.shared.paginationQueryParams(__query);
        if (validationError) return validationError;

        __query = await this.validators.shared.paginationQueryParamsTrimmer(__query);
        const { page, pageSize } = __query;

        return await paginate(this.mongomodels.user, { page, pageSize });
    }

    // This method is used to update a user's access level i.e. promote a user to superAdmin or demote a superAdmin to user
    async updateUserAccessLevel({ accessLevel, __longToken, __superAdmin, __params }) {
        const paramValidationError = await this.validators.user.pathParams({ userId: __params.context });
        if (paramValidationError) return paramValidationError;

        // Data validation
        const payloadValidationError = await this.validators.user.updateUserAccessLevel({ accessLevel });
        if (payloadValidationError) return payloadValidationError;

        const { context: userId } = __params;

        const user = await this.mongomodels.user.findById(userId);
        if (!user) {
            return {
                error: "User record doesn't exist or has already been deleted",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        if (user.accessLevel === accessLevel) {
            return {
                error: "User is already at the specified access level",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        // Update access level
        user.accessLevel = accessLevel;

        return await user.save();
    }

    // This method is used to make a user a school admin
    async setUserAsSchoolAdmin({ schools, __longToken, __superAdmin, __params }) {
        const paramValidationError = await this.validators.user.pathParams({ userId: __params.context });
        if (paramValidationError) return paramValidationError;

        // Data validation
        const payloadValidationError = await this.validators.user.setUserAsSchoolAdmin({ schools });
        if (payloadValidationError) return payloadValidationError;

        const { context: userId } = __params;

        const user = await this.mongomodels.user.findById(userId);
        if (!user) {
            return {
                error: "User record doesn't exist or has already been deleted",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        schools = [...new Set(schools)];

        const allSchoolsExist =
            (await this.mongomodels.school.countDocuments({ _id: { $in: schools } })) === schools.length;
        if (!allSchoolsExist) {
            return {
                error: "One or more schools don't exist",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        const schoolsOfWhichUserIsAdmin = getSchoolsFromUserAccessLevel({ accessLevel: user.accessLevel });
        schools = [...new Set([...schoolsOfWhichUserIsAdmin, ...schools])];

        user.accessLevel = `school:${schools.join(",")}`;

        return await user.save();
    }

    // This method is used to remove a user from being a school admin
    async unsetUserAsSchoolAdmin({ schools, __longToken, __superAdmin, __params }) {
        const paramValidationError = await this.validators.user.pathParams({ userId: __params.context });
        if (paramValidationError) return paramValidationError;

        const payloadValidationError = await this.validators.user.setUserAsSchoolAdmin({ schools });
        if (payloadValidationError) return payloadValidationError;

        const { context: userId } = __params;

        const user = await this.mongomodels.user.findById(userId);
        if (!user) {
            return {
                error: "User record doesn't exist or has already been deleted",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        const schoolsOfWhichUserIsAdmin = getSchoolsFromUserAccessLevel({ accessLevel: user.accessLevel });
        if (schoolsOfWhichUserIsAdmin.length === 0) {
            return {
                error: "User has not been admin of any schools",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        const schoolsOfWhichUserCanStillBeAdmin = schoolsOfWhichUserIsAdmin.filter(
            (schoolId) => !schools.includes(schoolId),
        );

        if (schoolsOfWhichUserCanStillBeAdmin.length === schoolsOfWhichUserIsAdmin.length) {
            return {
                error: "User is not an admin of one or more of the selected schools",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        if (schoolsOfWhichUserCanStillBeAdmin.length === 0) {
            user.accessLevel = "user";
        } else {
            user.accessLevel = `school:${schoolsOfWhichUserCanStillBeAdmin.join(",")}`;
        }

        return await user.save();
    }
};
