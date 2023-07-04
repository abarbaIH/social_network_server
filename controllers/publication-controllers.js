// Importar modelos
const Follow = require('./../models/Follow.model');
const User = require('./../models/User.model');
const Publication = require('./../models/Publication.model')

// Importar Servicios
const followService = require('./../services/followService')

// Importar dependencias
const fs = require("fs") // es una libreria de node para elimnar archivos...
const path = require("path") // es una librería para crar path absolutos

// Acciones de prueba
const testPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controllers/publication-controllers.js"
    })
}

// Guardar Publicacion
const savePublication = (req, res) => {

    // Recoger datos del body
    const publicationData = req.body

    // Recoger los datos del usuario identificado
    const publicaterId = req.user.id;

    // Comprobar si no llegan y damos  respuesta negativa
    if (!publicationData.text) {
        return (
            res.status(400).send({
                status: "error",
                message: "debes enviar el texto de la publicación"
            })
        )
    }

    // Creamos el objeto del modelo
    const newPublication = new Publication(publicationData)
    newPublication.user = publicaterId

    // Guardamos el objeto en db
    newPublication.save()
        .then(publicationStored => {

            // recoger respuesta si ha ido todo ok
            return res.status(200).send({
                status: "succes",
                message: "publicación guardado correctamente",
                publicationStored
            });
        })
        // Registar eñ error
        .catch(error => {
            return res.status(500).send({
                status: "error",
                message: "Se ha producido un error en el registro de la publicación"
            });
        });


}

// Sacar detalles de una publicación
const publicationDetails = (req, res) => {

    // Sacar id de publicación de URL
    const publicationId = req.params.id

    // Sacar un find con el id de la url
    Publication
        .findById(publicationId)
        .then(publicationStored => {

            // comprobar si no existe
            if (!publicationStored) {
                return res.status(404).send({
                    status: "error",
                    message: "Publicacion no encontrada no encontrado"
                });
            }
            // Retornar el resultado
            return res.status(200).send({
                status: "success",
                message: "detalles publicación encontrados correctamente",
                publication: publicationStored
            });

        });
}


// Listar todas las publicaciones de los usuarios que sigo
const userPublicationList = async (req, res) => {

    // Sacar el id de usuario de la url
    const userId = req.params.id

    // Controlar la pagina
    let page = 1
    if (req.params.page) page = req.params.page

    // Cuántos usuarios por página 
    const itemsPerPage = 5

    //Le marcamos el skip para que muestre sólo los elementos en cada pagina
    const skip = (page - 1) * itemsPerPage;

    // Find, populate, ordenar, paginar

    try {
        const publicacionList = await Publication.find({ user: userId })
            .populate("user", "-password -role -__v -email")
            .sort("-created_at") // ordena las publicaciones de menor a mayor
            .skip(skip)
            .limit(itemsPerPage);

        // sacamos el total de publicaciones
        const totalPublications = await Publication.countDocuments({ user: userId });

        // sacamos el total de paginas
        const totalPages = Math.ceil(totalPublications / itemsPerPage);

        // retornamos la respuesta

        res.status(200).send({
            status: "success",
            message: "Se ha obtenido el listado de publicaciones del usuario",
            publicacionList,
            totalPages,
            totalPublications
        });
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Se ha producido un error al intentar obtener el listado."
        });
    }

}

// Listar publicaciones de un usuario en concreto




// Eliminar publicaciones

const deletePublication = (req, res) => {
    // Recoger el id del usuario identificado
    const indntificateId = req.user.id;

    // Recoger el id de la publicacion de la url
    const publicationId = req.params.id;

    // Encontrar las coincidencias con un find
    Publication.findOneAndDelete({ "user": indntificateId, "_id": publicationId })
        .then(publicationDeleted => {
            if (publicationDeleted) {
                return res.status(200).send({
                    message: "La publicación se eliminó correctamente.",
                    publicationDeleted
                });
            } else {
                return res.status(404).send({
                    message: "El usuario no está autorizado en eliminar la publicación o ésta ya no existe."
                });
            }
        })
        .catch(error => {
            return res.status(500).send({
                status: "error",
                message: "Se ha producido un error al intentar eliminar la publicación."
            });
        });
};

// Subir ficheros (imagenes)

const uploadPublicationFile = (req, res) => {

    // Sacar publicationId de la url
    const publicationId = req.params.id

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
    Publication
        .findByIdAndUpdate(publicationId, { file: req.file.filename }, { new: true })
        .then(publicationUpdated => {

            // Si no llega usuario
            if (!publicationUpdated) {
                return (
                    res.status(500).send({
                        status: "error",
                        message: "se ha producido un error en la subida del archivo",
                    })
                )
            }

            // Retornar respuesta si ha ido todo bien
            return (
                res.status(200).send({
                    status: "success",
                    message: "añadido fichero",
                    publication: publicationUpdated,
                    file: req.file,
                })
            )

        })
        .catch(error => {
            return res.status(500).send({
                status: "error",
                message: "se ha producido un error en la subida del archivo",
            });
        });

}

// Devolver ficheros  (imagenes)

const showPublicationFile = (req, res) => {

    // Sacar el parámetro de la url
    const fileUrl = req.params.file //tal ccomo indica la url de la ruta

    // Montar el path del archivo
    const filePath = (`../social_network_server/uploads/publicationFile/${fileUrl}`)


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

// Listado de publicaciones de los usuarios que sigo

const followingPublicationList = async (req, res) => {

    // Sacar la pagina actual
    let page = 1
    if (req.params.page) page = req.params.page

    // Establecer numero de elementos por pagina
    itemsPerPage = 5

    const skip = (page - 1) * itemsPerPage;

    // Sacar un array de _ids usuarios a los que seguimos
    try {
        const myFollows = await followService.followUsersIds(req.user.id)

        // hacer un find a publicaciones en los que se encuentren los _ids del array anterior, ordenar y paginar
        const publications =
            await Publication
                .find({
                    user: myFollows.followingClean
                })
                .populate("user", "-password -role -__v -email")
                .sort("-created_at")
                .skip(skip)
                .limit(itemsPerPage);

        // sacamos el total de publicaciones
        const totalPublications = await publications.length

        // sacamos el total de paginas
        const totalPages = Math.ceil(totalPublications / itemsPerPage);

        return (
            res.status(200).send({
                status: "success",
                message: "followingPublicationList",
                myFollows: myFollows.followingClean,
                publications,
                totalPublications,
                page,
                totalPages
            })
        )

    }
    catch (error) {
        res.status(500).send({
            status: "error",
            message: "no se han listado las publicaciones",
        })
    }

}

// Exportar acciones
module.exports = {
    testPublication,
    savePublication,
    publicationDetails,
    userPublicationList,
    deletePublication,
    uploadPublicationFile,
    showPublicationFile,
    followingPublicationList
}