const mongoose = require("mongoose")

const connection = async () => {
    console.log("Intentando conectar a la base de datos...")

    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/my_socialNetwork");
        console.log("Conectado correctamente a my_social_network")

    } catch (error) {
        console.log(error)
        throw new Error("Error, no se ha podido conectar a la base de datos!")
    }

}

module.exports = connection


