const { paginate } = require("../../_common/mongoose.helper");
const { HTTPStatusCode } = require("../../../libs/constants");
const { getSchoolsFromUserAccessLevel, isUserSchoolAdmin } = require("../../_common/user.helper");
const { filterEmptyFields } = require("../../../libs/utils");

module.exports = class Student {
    constructor({ utils, cache, config, cortex, managers, validators, mongomodels }) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.usersCollection = "students";

        this.httpExposed = [
            "post=createStudent",
            "patch=updateStudent",
            "delete=deleteStudent",
            "get=getStudentsOfClassroom",
            "get=getStudentsOfSchool",
        ];
    }

    async checkClassroomExistence({ classroomId, __school }) {
        const queryOptions = {
            _id: classroomId,
        };
        if (__school.isUserSchoolAdmin) {
            queryOptions["school"] = {
                $in: getSchoolsFromUserAccessLevel({ accessLevel: __school.accessLevel }),
            };
        }

        const dbClassroom = await this.mongomodels.classroom.findOne(queryOptions).lean();

        if (!dbClassroom) {
            return {
                dbClassroom: null,
                errorResponse: {
                    error: "Classroom doesn't exist in any of the schools you manage",
                    code: HTTPStatusCode.NOT_FOUND,
                },
            };
        }

        return {
            dbClassroom,
            errorResponse: null,
        };
    }

    async isClassroomFull({ classroomId, capacity }) {
        // Check for classroom capacity by fetching total numbers of students alloted in the classroom
        const totalStudentsInClassroom = await this.mongomodels.student.countDocuments({ classroom: classroomId });
        if (totalStudentsInClassroom >= capacity) {
            return {
                error: "Classroom capacity is full",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        return false;
    }

    // This method is used to create a student record
    async createStudent({ name, classroom: classroomId, __longToken, __school }) {
        const student = { name, classroom: classroomId };

        // Data validation
        const validationError = await this.validators.student.createStudent(student);
        if (validationError) return validationError;

        const { dbClassroom, errorResponse } = await this.checkClassroomExistence({ classroomId, __school });
        if (errorResponse) return errorResponse;

        const classroomFullErrorResponse = await this.isClassroomFull({ classroomId, capacity: dbClassroom.capacity });
        if (classroomFullErrorResponse) return classroomFullErrorResponse;

        student.school = dbClassroom.school;
        const createdstudent = await this.mongomodels.student.create(student);
        return createdstudent.toObject({ versionKey: false });
    }

    // This method is used to update a student record
    async updateStudent({ name, classroom: classroomId, __longToken, __school, __params }) {
        const paramValidationError = await this.validators.student.pathParams({ studentId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: studentId } = __params;
        let updateData = { name, classroom: classroomId };

        // Data validation
        const validationError = await this.validators.student.updateStudent(updateData);
        if (validationError) return validationError;

        // Filter out undefined fields
        updateData = filterEmptyFields(updateData);

        if (!Object.keys(updateData).length) {
            return {
                error: "No data to update",
                code: HTTPStatusCode.BAD_REQUEST,
            };
        }

        // Update only the student details
        if (!classroomId) return this.updateStudentData({ studentId, __school, updateData });

        // Check if transfer is made
        const { dbClassroom, errorResponse } = await this.checkClassroomExistence({ classroomId, __school });
        if (errorResponse) return errorResponse;

        if (dbClassroom._id.toString() === updateData.classroom) {
            // No transfer made to other class, so just update student data
            return this.updateStudentData({ studentId, __school, updateData });
        }

        const classroomFullErrorResponse = await this.isClassroomFull({
            classroomId,
            capacity: dbClassroom.capacity,
        });
        if (classroomFullErrorResponse) return classroomFullErrorResponse;

        updateData.school = dbClassroom.school;
        return this.updateStudentData({ studentId, __school, updateData });
    }

    async updateStudentData({ studentId, __school, updateData }) {
        const queryFilters = {
            _id: studentId,
        };

        if (__school.isUserSchoolAdmin) {
            queryFilters["school"] = {
                $in: getSchoolsFromUserAccessLevel({ accessLevel: __school.accessLevel }),
            };
        }
        // Update only the name with the checks in place
        const updatedStudent = await this.mongomodels.student
            .findOneAndUpdate(queryFilters, updateData, { new: true, runValidators: true })
            .lean();

        if (!updatedStudent) {
            return {
                error: "Student not found in any of the schools you manage",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        return updatedStudent;
    }

    // This method is used to delete a student record
    async deleteStudent({ __longToken, __school, __params }) {
        const paramValidationError = await this.validators.student.pathParams({ studentId: __params.context });
        if (paramValidationError) return paramValidationError;

        const { context: studentId } = __params;

        const deleteFilters = {
            _id: studentId,
        };

        if (__school.isUserSchoolAdmin) {
            deleteFilters["school"] = {
                $in: getSchoolsFromUserAccessLevel({ accessLevel: __school.accessLevel }),
            };
        }

        const deleteResponse = await this.mongomodels.student.deleteOne(deleteFilters);

        if (!deleteResponse.acknowledged) {
            return {
                error: "Student deletion failed",
                code: HTTPStatusCode.INTERNAL_SERVER_ERROR,
            };
        }

        if (deleteResponse.acknowledged && !deleteResponse.deletedCount) {
            return {
                error: "Student not found in any of the schools you manage",
                code: HTTPStatusCode.NOT_FOUND,
            };
        }

        return { message: "Student deleted successfully", code: HTTPStatusCode.OK };
    }

    // This method is used to get a list of students of a school
    async getStudentsOfClassroom({ __longToken, __school, __params, __query }) {
        const pathParamValidationError = await this.validators.classroom.pathParams({ classroomId: __params.context });
        if (pathParamValidationError) return pathParamValidationError;

        const { context: classroomId } = __params;
        const queryParamValidationError = await this.validators.shared.paginationQueryParams(__query);
        if (queryParamValidationError) return queryParamValidationError;

        __query = await this.validators.shared.paginationQueryParamsTrimmer(__query);
        const { page, pageSize } = __query;

        const filterOptions = {
            classroom: classroomId,
        };

        if (__school.isUserSchoolAdmin) {
            filterOptions.school = { $in: getSchoolsFromUserAccessLevel({ accessLevel: __school.accessLevel }) };
        }

        return await paginate(this.mongomodels.student, {
            page,
            pageSize,
            filters: filterOptions,
        });
    }

    async getStudentsOfSchool({ __longToken, __school, __params, __query }) {
        const pathParamValidationError = await this.validators.school.pathParams({ schoolId: __params.context });
        if (pathParamValidationError) return pathParamValidationError;

        const { context: schoolId } = __params;
        if (!__school.isUserSuperAdmin && !isUserSchoolAdmin({ accessLevel: __school.accessLevel, schoolId })) {
            return {
                error: "Insufficient permission",
                code: HTTPStatusCode.FORBIDDEN,
            };
        }

        const queryParamValidationError = await this.validators.shared.paginationQueryParams(__query);
        if (queryParamValidationError) return queryParamValidationError;

        __query = await this.validators.shared.paginationQueryParamsTrimmer(__query);
        const { page, pageSize } = __query;

        return await paginate(this.mongomodels.student, {
            page,
            pageSize,
            filters: {
                school: schoolId,
            },
        });
    }
};
