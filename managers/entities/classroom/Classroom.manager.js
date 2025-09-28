const { paginate } = require("../../_common/mongoose.helper");
const { HTTPStatusCode } = require("../../../libs/constants");
const { isUserSchoolAdmin, isUserSuperAdmin, getSchoolsFromUserAccessLevel } = require("../../_common/user.helper");
const { filterEmptyFields } = require("../../../libs/utils");

module.exports = class Classroom {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "classrooms";

        this.httpExposed = [
            "post=createClassroom",
            "patch=updateClassroom",
            "get=getClassrooms",
            "delete=deleteClassroom",
        ];
    }

    _checkPermissions({ accessLevel, schoolId }) {
        if (isUserSchoolAdmin({ accessLevel, schoolId }) || isUserSuperAdmin({ accessLevel })) return;

        return {
            error: "Insufficient permissions.",
            code: HTTPStatusCode.FORBIDDEN,
        };
    }

    // This method is used to create a classroom record
    async createClassroom({ name, grade, capacity, school: schoolId, __longToken, __school }) {
        const errorResponse = this._checkPermissions({ accessLevel: __school.accessLevel, schoolId: schoolId });
        if (errorResponse) return errorResponse;

        const classroom = { name, grade, capacity, school: schoolId };
        // Data validation
        const validationError = await this.validators.classroom.createClassroom(classroom);
        if (validationError) return validationError;

        // Creation Logic
        const createdClassroom = await this.mongomodels.classroom.create(classroom);

        // Response
        return createdClassroom.toObject({ versionKey: false });
    }

    // This method is used to update a classroom record
    async updateClassroom({ name, grade, capacity, __longToken, __school, __params }) {
        // Path param validation
        const paramValidationError = await this.validators.classroom.pathParams({ classroomId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: classroomId } = __params;
        let updateData = { name, grade, capacity };

        // Data validation
        const validationError = await this.validators.classroom.updateClassroom(updateData);
        if (validationError) return validationError;

        // Filter out undefined fields
        updateData = filterEmptyFields(updateData);

        if (!Object.keys(updateData).length) {
            return {
                error: "No data to update",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        const queryFilters = {
            _id: classroomId,
        };

        if (__school.isUserSchoolAdmin) {
            queryFilters["school"] = { $in: getSchoolsFromUserAccessLevel({ accessLevel: __school.accessLevel }) };
        }

        const classroom = await this.mongomodels.classroom.findOne(queryFilters);

        // const classroom = await this.mongomodels.classroom
        //     .findOneAndUpdate(queryFilters, updateData, { new: true, runValidators: true })
        //     .lean();

        if (!classroom) {
            return {
                error: "Classroom not found in any of the schools you manage",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        if (capacity) {
            const totalStudentsInClassroom = await this.mongomodels.student.countDocuments({ classroom: classroomId });
            if (capacity < totalStudentsInClassroom) {
                return {
                    error: `Capacity update failed: Requested capacity (${capacity}) is less than the current number of students (${totalStudentsInClassroom})`,
                    code: HTTPStatusCode.BAD_REQUEST,
                };
            }
        }

        // Update Logic
        Object.assign(classroom, updateData);

        return await classroom.save();
    }

    // This method is used to delete a classroom record
    async deleteClassroom({ __longToken, __school, __params }) {
        const paramValidationError = await this.validators.classroom.pathParams({ classroomId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: classroomId } = __params;

        const queryFilters = {
            _id: classroomId,
        };

        if (__school.isUserSchoolAdmin) {
            queryFilters["school"] = { $in: getSchoolsFromUserAccessLevel({ accessLevel: __school.accessLevel }) };
        }
        const deleteResponse = await this.mongomodels.classroom.deleteOne(queryFilters);

        if (!deleteResponse.acknowledged) {
            return {
                error: "Classroom record deletion failed",
                code: HTTPStatusCode.INTERNAL_SERVER_ERROR,
            };
        }

        if (deleteResponse.acknowledged && !deleteResponse.deletedCount) {
            return {
                error: "Classroom not found in any of the schools you manage",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        return { message: "Classroom record deleted successfully", code: HTTPStatusCode.OK };
    }

    async getClassrooms({ __longToken, __school, __params, __query }) {
        // Path param validation
        const paramValidationError = await this.validators.school.pathParams({ schoolId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: schoolId } = __params;

        const errorResponse = this._checkPermissions({ accessLevel: __school.accessLevel, schoolId });
        if (errorResponse) return errorResponse;

        const queryParamValidationError = await this.validators.shared.paginationQueryParams(__query);
        if (queryParamValidationError) return queryParamValidationError;

        // ** We don't have to check if the school exists here as we
        // ** delete all the belonging classrooms and students on the
        // ** deletion of school. Also, the school id would have been
        // ** removed from the school admin's accessLevel and a permission
        // ** issue before reaching here

        const { page, pageSize } = __query;
        return await paginate(this.mongomodels.classroom, { page, pageSize, filters: { school: schoolId } });
    }
};
