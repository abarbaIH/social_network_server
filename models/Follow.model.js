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

// const mongoose = require("mongoose");
// const { Schema, model } = mongoose;
// const mongoosePaginate = require("mongoose-paginate-v2")

// const followSchema = new Schema(
//     {
//         user: {
//             type: Schema.ObjectId,
//             ref: "User"
//         },

//         followed: {
//             type: Schema.ObjectId,
//             ref: "User"
//         },

//         created_at: {
//             type: Date,
//             default: Date.now
//         }

//     },

//     {
//         timestamps: true,
//     }
// );

// followSchema.plugin(mongoosePaginate)
// module.exports = model("Follow", followSchema)