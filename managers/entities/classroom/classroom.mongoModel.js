const mongoose = require("mongoose");

const classroomSchema = mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        grade: {
            type: Number,
            min: 1,
            required: true,
            trim: true,
        },
        capacity: {
            type: Number,
            min: 1,
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
    { timestamps: true },
);

classroomSchema.index({ name: 1, grade: 1, school: 1 }, { unique: true });

async function deleteStudentsOfClassroom(doc, next) {
    if (!this?._deletedIds || !(this?._deletedIds && this._deletedIds.length)) {
        return next();
    }
    try {
        for (const classroomId of this._deletedIds) {
            const deleteResponse = await mongoose.models.Student.deleteMany({ classroom: classroomId });
            console.log(`Deleted ${deleteResponse.deletedCount} students from classroom ${classroomId}`);
        }
        next();
    } catch (err) {
        console.log("Error in post delete middleware of classroom: ", err);
        next(err);
    }
}

classroomSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], async function (next) {
    try {
        const filter = this.getFilter();
        const documents = await this.model.find(filter).select("_id");
        this._deletedIds = documents.map((doc) => doc._id.toString());
        next();
    } catch (err) {
        console.log("Error in pre delete middleware of classroom: ", err);
        next(err);
    }
});

classroomSchema.post(["deleteOne", "deleteMany", "findOneAndDelete"], deleteStudentsOfClassroom);

module.exports = mongoose.model("Classroom", classroomSchema);
