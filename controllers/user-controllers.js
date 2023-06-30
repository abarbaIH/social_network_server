// Importar dependencias y módulos
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const jwt = require('./../services/jwt');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    const userParams = req.body;

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
        let hashedPassword = await bcrypt.hash(userParams.password, 10);
        userParams.password = hashedPassword;

        // Crear objeto de usuario con los datos validados
        const userToSave = new User(userParams);

        // Guardar usuario en la base de datos
        userToSave.save().then((userStored) => {
            // Retornar el resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored
            });
        });
    })
        .catch(error => {
            return (
                res.status(500).send({
                    status: "error",
                    message: "se ha producido un error de registro",
                })
            )
        })
};

// LOGIN DE USUARIOS
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

    // Buscar en la base de datos si existe el usuario
    User
        .findOne({ email: userParams.email })
        .then(async (user) => {
            if (!user) return res.status(404).send({ status: "error", message: "No existe usuario" });

            // Comprobar la contraseña
            const pwd = bcrypt.compareSync(userParams.password, user.password);
            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "Contraseña incorrecta"
                });
            }

            // Generar el token JWT
            const token = jwt.createToken(user);

            // Retornar los datos del usuario
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

// PERFIL DE USUARIO
const profile = (req, res) => {
    // Recibir el parámetro de id de usuario por URL
    const user_id = req.params.user_id;

    // Consulta para obtener los datos del usuario
    User.findById(user_id)
        .select({ password: 0, role: 0 })
        .then(async (userProfile) => {
            if (!userProfile) {
                return res.status(404).send({
                    status: "error",
                    message: "Usuario no encontrado"
                });
            }
            // Retornar el resultado
            return res.status(200).send({
                status: "success",
                user: userProfile
            });

        });

};

// LISTA DE USUARIOS PAGINADA
const list = (req, res) => {
    // Controlar la página en la que estamos a través de la URL
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    let itemsPerPage = 5;

    User.paginate({}, { page, limit: itemsPerPage, sort: '_id' }, (err, users) => {
        if (err) {
            return res.status(500).send({
                status: 'error',
                message: 'Error en la consulta de usuarios',
                error: err
            });
        }

        return res.status(200).send({
            status: 'success',
            message: 'Ya tenemos la lista de usuarios',
            page: users.page,
            itemsPerPage: users.limit,
            total: users.totalDocs,
            usersList: users.docs,
            pages: users.totalPages
        });
    });
};

const update = (req, res) => {

    // Recoger info del usuario a actualizar
    const userIdentity = req.user // datos del usuario registrado
    const userToUpdate = req.body // datos que nos envía en la petición por body

    // Eliminar los campos sobrantes
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    delete userToUpdate.avatar

    // Comprobar si el usuario ya existe
    User.find({
        $or: [
            { email: userToUpdate.email },
            { nickName: userToUpdate.nickName }
        ]
    }).then(async (users) => {

        let userIsset = false
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true
        })

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        // Si me llega la password, cifrarla de nuevo
        if (userToUpdate.password) {
            let hashedPassword = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = hashedPassword;
        }
        // Buscar y actualizar el usuario con la nueva info
        User
            .findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })
            .then(userUpdated => {
                // Si no llega usuario
                if (!userUpdated) {
                    return (
                        res.status(500).send({
                            status: "error",
                            message: "se ha producido un error en la actualización",
                        })
                    )
                }
                // Retornar usuario actualizado
                return (
                    res.status(200).send({
                        status: "success",
                        message: "se han actualizado los datos de usuario correctamente",
                        user: userUpdated
                    })
                )
            })
            .catch(error => {
                return (
                    res.status(500).send({
                        status: "error",
                        message: "se ha producido un error en la actualización",
                    })
                )
            })

    });

}

const upload = (req, res) => {
    return (
        res.status(200).send({
            status: "success",
            message: "subida de imagenes",
            user: req.user,
            file: req.file,
            files: req.files
        })
    )
}


// Exportar acciones
module.exports = {
    testUser,
    signup,
    login,
    profile,
    list,
    update,
    upload
};
