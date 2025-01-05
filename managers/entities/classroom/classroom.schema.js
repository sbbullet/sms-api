module.exports = {
    createClassroom: [
        {
            model: "name",
            label: "Classroom Name",
            required: true,
        },
        {
            model: "grade",
            label: "Grade",
            required: true,
        },
        {
            model: "capacity",
            label: "Capacity",
            required: true,
        },
        {
            model: "mongoObjectId",
            path: "school",
            label: "School ID",
            required: true,
        },
    ],

    updateClassroom: [
        {
            model: "name",
            label: "Classroom Name",
            required: false,
        },
        {
            model: "grade",
            label: "Grade",
            required: false,
        },
        {
            model: "capacity",
            label: "Capacity",
            required: false,
        },
    ],

    pathParams: [
        {
            model: "mongoObjectId",
            path: "classroomId",
            label: "Path Param: Classroom ID",
            required: true,
        },
    ],
};
