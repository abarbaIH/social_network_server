// Importar Modelos 
const User = require('../models/User.model');
const Follow = require('../models/Follow.model');
const Publication = require('../models/Publication.model');


// importar dependencias
const bcrypt = require('bcrypt'); // es una libreria de node para hashear passwords
const mongoosePaginate = require('mongoose-paginate-v2'); // es una libreria de node para paginar
const fs = require("fs") // es una libreria de node para elimnar archivos...
const path = require("path") // es una librería para crar path absolutos

// Importar servicios
const jwt = require('./../services/jwt'); // es un servicio que hemos montado para sacar tokens
const followService = require('./../services/followService')


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

            // Añadir info de folloginf que viene del service
            const followInfo = await followService.followThisUser(req.user.id, user_id)
            // Retornar el resultado
            return res.status(200).send({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            });

        });

};

const list = async (req, res) => {
    let page = 1;
    if (req.params.page) {
        page = parseInt(req.params.page);
    }

    let itemsPerPage = 5;

    try {
        const users = await new Promise((resolve, reject) => {
            User.paginate({}, { page, limit: itemsPerPage, sort: '_id' }, (err, users) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            });
        });

        const followUserIds = await followService.followUsersIds(req.user.id);

        return res.status(200).send({
            status: 'success',
            message: 'Ya tenemos la lista de usuarios',
            page: users.page,
            itemsPerPage: users.limit,
            total: users.totalDocs,
            usersList: users.docs,
            pages: users.totalPages,
            user_following: followUserIds.followingClean,
            users_follow_me: followUserIds.followersClean
        });
    } catch (err) {
        return res.status(500).send({
            status: 'error',
            message: 'Error en la consulta de usuarios',
            error: err
        });
    }
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
            // si no llega elimnarla (eviatmos que se nos sobreescriba sobre la pasa de datos en vacío)
        } else {
            delete userToUpdate.password
        }

        // Buscar y actualizar el usuario con la nueva info
        User
            .findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })
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

    // Recoger el fichero de imagen y comprobar que existe

    if (!req.file) {
        return (
            res.status(404).send({
                status: "error",
                message: "la petición no incluye el archivo de imagen"
            })
        )
    }

    // Conseguir el nombre del archivo

    const fileOriginalName = req.file.originalname

    // Sacar extensión del archivo
    const fileSplit = fileOriginalName.split("\.")
    const fileExtension = fileSplit[1]

    // Comporbar si es correcta la extensión
    if (fileExtension != "png" && fileExtension != "jpg" && fileExtension != "jpeg" && fileExtension != "gif") {

        // Si no es correcta, borrar el archivo
        const filePath = req.file.path // esta sería la ruta donde está el archivo
        fs.unlinkSync(filePath) // es un método de la librería fs para borrar archivos

        // Sacar respuesta negativa
        return (
            res.status(404).send({
                status: "error",
                message: "extensión del fichero subido inválida"
            })
        )
    }

    // Si es correcta, añadir el archivo a la db
    User
        .findByIdAndUpdate({ _id: req.user.id }, { avatar: req.file.filename }, { new: true })
        .then(userUpdated => {

            // Si no llega usuario
            if (!userUpdated) {
                return (
                    res.status(500).send({
                        status: "error",
                        message: "se ha producido un error en la subida del avatar",
                    })
                )
            }

            // Retornar respuesta si ha ido todo bien
            return (
                res.status(200).send({
                    status: "success",
                    message: "añadida la imagen al usuario",
                    user: userUpdated,
                    file: req.file,
                })
            )

        })

}

const avatar = (req, res) => {

    // Sacar el parámetro de la url
    const fileUrl = req.params.file //tal ccomo indica la url de la ruta

    // Montar el path del archivo
    const filePath = (`../social_network_server/uploads/avatars/${fileUrl}`)


    // Comprobar si el archivo existe (con el metodo stat de fs)
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return (
                res.status(404).send({
                    status: "error",
                    message: "no existe la imagen",
                    exists,
                    error
                })
            )
        }

        // Si existe, retornaremos un archivo
        return (
            res.sendFile(path.resolve(filePath)) // path.resolve, nos devuelve una ruta absoluta
        )
    })
}


const counter = async (req, res) => {
    let userId = req.user.user_id
    if (req.params.user_id) userId = req.params.user_id
    try {
        const following = await Follow.count({ "user": userId })
        const followed = await Follow.count({ "followed": userId })
        const publications = await Publication.count({ "user": userId })
        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        })
    }
    catch (error) {
        return res.status(500).send({
            status: "error",
            message: "ha fallado el contador"
        })
    }
}


// Exportar acciones
module.exports = {
    testUser,
    signup,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counter
};
