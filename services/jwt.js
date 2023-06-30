// importar dependencias
const jwt = require("jwt-simple")
const moment = require("moment")

// Calve secreta para generar el token
const secret = "SECRET_KEY_social_network_project_2023_React"

// funcion para generar token
const createToken = (user) => {

    const payload = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        email: user.email,
        role: user.role,
        nickName: user.nickName,
        avatar: user.avatar,
        iat: moment().unix(),
        exp: moment().add(10, "days").unix()
    }

    // devolver un jwt token codificado
    return jwt.encode(payload, secret)

}

module.exports = {
    secret,
    createToken
}