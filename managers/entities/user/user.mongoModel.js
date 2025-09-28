const mongoose = require("mongoose");
const bcrypt = require("@node-rs/bcrypt");
const { BCRYPT_SALT_ROUNDS, EMAIL_REGEX, ACCESS_LEVEL_REGEX } = require("../../../libs/constants");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            match: EMAIL_REGEX,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            select: false,
        },
        accessLevel: {
            type: String,
            required: true,
            match: ACCESS_LEVEL_REGEX,
            default: "user",
        },
        __v: { type: Number, select: false },
    },
    { timestamps: true },
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
    next();
});

module.exports = mongoose.model("User", userSchema);
