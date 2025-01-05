const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom",
            required: true,
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },
        __v: {
            type: Number,
            select: false,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Student", studentSchema);
