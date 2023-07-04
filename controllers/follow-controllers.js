// Importar modelos
const Follow = require('./../models/Follow.model');
const User = require('./../models/User.model');

// importara servicio
const followService = require('../services/followService') // servicio que hemos montado para identificar ids de usuarios que se siguen entre sí

// Importar dependencias
const mongoosePaginate = require('mongoose-paginate-v2');

// Acciones de prueba
const testFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controllers/follow-controllers.js"
    });
};

// Acción de Seguir
const saveFollow = (req, res) => {
    // Conseguir los datos del body (es decir del usuario al que queremos seguir)
    const followedId = req.body.followed;

    // Sacar id del usuario registrado
    const followerId = req.user.id;

    // Crear objeto completo usando el modelo Follow
    const userToFollow = new Follow({
        user: followerId,
        followed: followedId
    });

    // Guardar el objeto en la base de datos
    userToFollow.save()
        .then(followStored => {
            return res.status(200).send({
                status: success,
                message: "seguimiento guardado correctamente",
                follow: followStored,
            });
        })
        // Registar eñ error
        .catch(error => {
            return res.status(500).send({
                status: "error",
                message: "Se ha producido un error"
            });
        });
};

// Acción de dejar de seguir

const deleteFollow = (req, res) => {
    // Recoger el id del usuario identificado
    const followerId = req.user.id;

    // Recoger el id del usuario que quiero dejar de seguir
    const followedId = req.params.id;

    // Encontrar las coincidencias con un find
    Follow.findOneAndDelete({ "user": followerId, "followed": followedId })
        .then(followDeleted => {
            if (followDeleted) {
                return res.status(200).send({
                    message: "El usuario ha dejado de seguir correctamente.",
                    followDeleted
                });
            } else {
                return res.status(404).send({
                    message: "El usuario a dejar de seguir no existe o no está siendo seguido."
                });
            }
        })
        .catch(error => {
            return res.status(500).send({
                status: "error",
                message: "Se ha producido un error al intentar dejar de seguir al usuario."
            });
        });
};

// Acción de listado de usuarios que estoy siguiendo

const followingList = async (req, res) => {
    // Recoger el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si llegar el id por parámetro de la url (en caso de llegar es el que tiene la prioridad)
    if (req.params.id) userId = userId

    // Comprobar si me llega la página de la url (1 por defecto pero si llega por url, tiene prioridad)
    let page = 1
    if (req.params.page) page = parseInt(req.params.page)

    // Cuántos usuarios por página 
    const itemsPerPage = 5

    //Le marcamos el skip para que muestre sólo los elementos en cada pagina
    const skip = (page - 1) * itemsPerPage;

    try {
        const usersFollowingList = await Follow.find({ user: userId })
            .populate("user followed", "-password -role -__v -email")
            .skip(skip)
            .limit(itemsPerPage);

        const totalCount = await Follow.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // esto lo sacamos del servicio que exporta con el metodo followUsersIds dos consultas following y followers, con eso tenemos a quién seguimos y quién nos sigue
        const followUserIds = await followService.followUsersIds(req.user.id);


        res.status(200).send({
            status: "success",
            message: "Se ha obtenido el listado de usuarios que estás siguiendo",
            usersFollowingList,
            totalPages,
            user_following: followUserIds.followingClean,
            users_follow_me: followUserIds.followersClean
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Se ha producido un error al intentar obtener el listado."
        });
    }
};

// Acción de listado de usuarios que me siguen

const followersList = async (req, res) => {
    // Recoger el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si llegar el id por parámetro de la url (en caso de llegar es el que tiene la prioridad)
    if (req.params.id) userId = userId

    // Comprobar si me llega la página de la url (1 por defecto pero si llega por url, tiene prioridad)
    let page = 1
    if (req.params.page) page = parseInt(req.params.page)

    // Cuántos usuarios por página 
    const itemsPerPage = 5

    //Le marcamos el skip para que muestre sólo los elementos en cada pagina
    const skip = (page - 1) * itemsPerPage;

    try {
        const usersFollowingList = await Follow.find({ followed: userId })
            .populate("user", "-password -role -__v -email")
            .skip(skip)
            .limit(itemsPerPage);

        const totalCount = await Follow.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        // esto lo sacamos del servicio que exporta con el metodo followUsersIds dos consultas following y followers, con eso tenemos a quién seguimos y quién nos sigue
        const followUserIds = await followService.followUsersIds(req.user.id);


        res.status(200).send({
            status: "success",
            message: "Se ha obtenido el listado de usuarios que me siguen",
            usersFollowingList,
            totalPages,
            user_following: followUserIds.followingClean,
            users_follow_me: followUserIds.followersClean
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Se ha producido un error al intentar obtener el listado."
        });
    }
}

// Exportar acciones
module.exports = {
    testFollow,
    saveFollow,
    deleteFollow,
    followingList,
    followersList
};

