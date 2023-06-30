// importar dependencias y módulos
const User = require('../models/User.model');
const bcrypt = require('bcrypt')
const jwt = require('./../services/jwt')

// Acciones de prueba
const testUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controllers/user-controllers.js",
        userAuth: req.user

    });
};

// REGISTRO DE USUARIOS
const signup = (req, res) => {

    // Recoger datos de la request
    const userParams = req.body

    // Comprobar que llegan correctamente
    if (!userParams.firstName || !userParams.email || !userParams.password || !userParams.nickName) {
        return res.status(400).json({
            status: "error",
            message: "Validación incorrecta, faltan datos obligatorios"
        });
    }

    // Control de usuarios duplicados
    User.find({
        $or: [
            { email: userParams.email },
            { nickName: userParams.nickName }
        ]
    }).then(async (users) => {
        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        // Cifrar la password
        let hashedPassword = await bcrypt.hash(userParams.password, 10)
        userParams.password = hashedPassword

        // Crear objeto de usuario con los datos validados
        const userToSave = new User(userParams)

        // Guardar usuario en db
        userToSave.save().then((userStored) => {

            // Retornar el resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored
            });

        })

    })

};

// LOGIN USUARIOS

const login = (req, res) => {

    // Recoger parámetros de la request
    const userParams = req.body;

    // Comprobar si existen los datos
    if (!userParams.email || !userParams.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos de email y password"
        });
    }

    // Buscar en DB si existe
    User
        .findOne({ email: userParams.email })
        // .select({ "password": 0 })
        .then(async (user) => {
            if (!user) return res.status(404).send({ status: "error", message: "No existe usuario" });

            // Comprobar password
            const pwd = bcrypt.compareSync(userParams.password, user.password)
            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "no contraseña incorrecta"
                })
            }

            // Conseguir el TOKEN de JWT
            const token = jwt.createToken(user)


            // Retornar datos user

            return res.status(200).send({
                status: "success",
                message: "Te has identificado correctamente",
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    nickName: user.nickName,
                    avatar: user.avatar
                },
                token
            });
        });
};

const profile = (req, res) => {

    // Recibir el parámetro de id de usuario por URL
    const user_id = req.params.user_id

    // Consulta para sacar datos de usuario
    User
        .findById(user_id)
        .select({ password: 0, role: 0 })
        .then(async (userProfile) => {
            if (!userProfile) {
                return (
                    res.status(404).send({
                        status: "error",
                        message: "usuario no encotrado"
                    })
                )
            }
            // Retornar el resultado

            return (
                res.status(200).send({
                    status: "success",
                    user: userProfile
                })
            )
        })

}


// Exportar acciones
module.exports = {
    testUser,
    signup,
    login,
    profile
};
