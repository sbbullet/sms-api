const mongoose = require("mongoose");
const { COUNTRY_ISO_CODES, URL_REGEX, SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX } = require("../../../libs/constants");
const { getSchoolsFromUserAccessLevel } = require("../../_common/user.helper");

const addressSchema = new mongoose.Schema(
    {
        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },
        addressLine2: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
        },
        state: {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            iso2: {
                type: String,
                required: true,
                length: { min: 2, max: 6 },
                uppercase: true,
                trim: true,
            },
        },
        zipcode: {
            type: String,
            required: true,
            trim: true,
        },
        country: {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            iso2: {
                type: String,
                required: true,
                uppercase: true,
                enum: COUNTRY_ISO_CODES,
            },
        },
    },
    { _id: false },
);

const schoolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        website: {
            type: String,
            required: true,
            match: URL_REGEX,
            trim: true,
        },
        __v: { type: Number, select: false },
    },
    { timestamps: true },
);

async function handleSchoolAdminAccessLevelUpdate(doc, next) {
    if (!doc?.deletedCount) {
        next();
    }

    const school = this;
    const schoolId = (school._id || school.getFilter()._id).toString();

    try {
        const schoolAdmins = await mongoose.models.User.find({
            accessLevel: {
                $regex: new RegExp(`^${SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX}.*${schoolId}.*`, "i"),
            },
        });

        if (!schoolAdmins.length) {
            return next();
        }

        for (let schoolAdmin of schoolAdmins) {
            let schools = getSchoolsFromUserAccessLevel({ accessLevel: schoolAdmin.accessLevel }).filter(
                (sid) => sid !== schoolId,
            );
            schoolAdmin.accessLevel = !schools.length ? "user" : SCHOOL_ADMIN_ACCESS_LEVEL_PREFIX + schools.join(",");
            await schoolAdmin.save();
        }
    } catch (err) {
        console.log(
            `Error while removing school ID from the access level of school admins of school: ${schoolId}`,
            err,
        );
    } finally {
        next();
    }
}

async function deleteRelatedClassrooms(doc, next) {
    if (!doc?.deletedCount) {
        next();
    }

    const school = this;
    const schoolId = (school._id || school.getFilter()._id).toString();

    try {
        const deleteResponse = await mongoose.models.Classroom.deleteMany({
            school: schoolId,
        });
        console.log(`Deleted ${deleteResponse.deletedCount} classrooms of school ${schoolId}`);
    } catch (err) {
        console.log(`Error while deleting classrooms of school ${schoolId}`, err);
    } finally {
        next();
    }
}

schoolSchema.post(["deleteOne", "findOneAndDelete"], handleSchoolAdminAccessLevelUpdate);
schoolSchema.post(["deleteOne", "findOneAndDelete"], deleteRelatedClassrooms);

module.exports = mongoose.model("School", schoolSchema);
