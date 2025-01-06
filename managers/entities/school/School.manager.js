const { paginate, flattenNestedObjectForUpdate } = require("../../_common/mongoose.helper");
const { HTTPStatusCode } = require("../../../libs/constants");
const { filterEmptyFields } = require("../../../libs/utils");

module.exports = class School {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "schools";

        this.httpExposed = ["post=createSchool", "patch=updateSchool", "get=getSchools", "delete=deleteSchool"];
    }

    // This method is used to create a school record
    async createSchool({ name, address, phone, website, __longToken, __superAdmin }) {
        const school = { name, address, phone, website };

        // Data validation
        const validationError = await this.validators.school.createSchool(school);
        if (validationError) return validationError;

        // Creation Logic
        const createdSchool = await this.mongomodels.school.create(school);

        // Response
        return createdSchool.toObject({ versionKey: false });
    }

    // This method is used to update a school record
    async updateSchool({ name, address, phone, website, __longToken, __superAdmin, __params }) {
        const paramValidationError = await this.validators.school.pathParams({ schoolId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: schoolId } = __params;
        let updateData = { name, address, phone, website };

        // Data validation
        const validationError = await this.validators.school.updateSchool(updateData);
        if (validationError) return validationError;

        // Filter out undefined fields
        updateData = filterEmptyFields(updateData);

        if (!Object.keys(updateData).length) {
            return {
                error: "No data to update",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        updateData = flattenNestedObjectForUpdate(updateData);

        // Update Logic
        const updatedSchool = await this.mongomodels.school
            .findByIdAndUpdate(schoolId, updateData, { new: true, runValidators: true })
            .lean();

        if (!updatedSchool) {
            return {
                error: "School not found",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        // Response
        return updatedSchool;
    }

    // This method is used to delete a school record
    async deleteSchool({ __longToken, __superAdmin, __params }) {
        const paramValidationError = await this.validators.school.pathParams({ schoolId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: schoolId } = __params;
        const deleteResponse = await this.mongomodels.school.deleteOne({ _id: schoolId });

        if (!deleteResponse.acknowledged) {
            return {
                error: "School record deletion failed",
                code: HTTPStatusCode.INTERNAL_SERVER_ERROR,
            };
        }

        if (deleteResponse.acknowledged && !deleteResponse.deletedCount) {
            return {
                error: "School not found",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        // TODO: Also delete all the classrooms and students of this school

        return { message: "School record deleted successfully", code: HTTPStatusCode.OK };
    }

    // This method is used to get a list of schools. It uses the paginate helper function to get the paginated list of schools
    // We can also use the filters, sortBy, and select parameters to filter, sort, and select specific fields from the school records
    // Right now, we are only using the page and pageSize parameters to get the paginated list of schools, but we can easily extend
    // this method to include more parameters
    async getSchools({ __longToken, __superAdmin, __query }) {
        const validationError = await this.validators.shared.paginationQueryParams(__query);
        if (validationError) return validationError;

        __query = await this.validators.shared.paginationQueryParamsTrimmer(__query);
        const { page, pageSize } = __query;

        return await paginate(this.mongomodels.school, { page, pageSize });
    }
};
