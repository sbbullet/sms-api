const { pathParms } = require("../classroom/classroom.schema");

module.exports = {
    createStudent: [
        {
            model: "name",
            label: "Student Name",
            required: true,
        },
        {
            model: "mongoObjectId",
            path: "classroom",
            label: "Classroom ID",
            required: true,
        },
    ],

    updateStudent: [
        {
            model: "name",
            label: "Student Name",
            required: false,
        },
        {
            model: "mongoObjectId",
            path: "classroom",
            label: "Classroom ID",
            required: false,
        },
    ],

    pathParams: [
        {
            model: "mongoObjectId",
            path: "studentId",
            label: "Path Param: Student ID",
            required: true,
        },
    ],
};
