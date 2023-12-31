const { Schema, model } = require("mongoose")

const followSchema = Schema(

    {

        user: {
            type: Schema.ObjectId,
            ref: "User"
        },

        followed: {
            type: Schema.ObjectId,
            ref: "User"
        },

        created_at: {
            type: Date,
            default: Date.now
        }

    },

    {
        timestamps: true,
    }
)

module.exports = model("Follow", followSchema)