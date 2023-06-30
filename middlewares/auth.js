// Importar modulos
const jwt = require("jwt-simple")
const moment = require("moment")

// Importar clave secreta
const libjwt = require('../services/jwt')
const secret = libjwt.secret

// Middleware de autenticación
exports.auth = (req, res, next) => {

    // Comprobar si me llega la cabecera de autenticación
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "la petición no contiene la cabecera de autenticacion",
        }
        )
    }

    // Limpiar el token de comillas
    const token = req.headers.authorization.replace(/['"]+/g, '')

    // Decodificar el token
    try {
        const payload = jwt.decode(token, secret)

        // Comprobar expiración del token
        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "El Token ha expirado",
                error
            })
        }
        // Agregar datos de usuario a la request
        req.user = payload

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        })
    }

    // Ejecutar la siguiente acción
    next()

}

