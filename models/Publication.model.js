const { Schema, model } = require("mongoose")

const publicationSchema = Schema(

    {
        user: {
            type: Schema.ObjectId,
            ref: "User"
        },

        text: {
            type: String,
            require: true
        },

        file: {
            type: String
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

module.exports = model("Publication", publicationSchema)