const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2")

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
        },
        bio: {
            type: String
        },
        nickName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: [true, "Password is required."],
        },
        role: {
            type: String,
            default: "role_user",
        },
        avatar: {
            type: String,
            default: "default.png",
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.plugin(mongoosePaginate)
module.exports = model("User", userSchema)
