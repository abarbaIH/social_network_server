const validator = require("validator")

const validate = (params) => {
    let firstName =
        !validator.isEmpty(params.firstName) &&
        validator.isLength(params.firstName, { min: 3, max: undefined }) &&
        validator.isAlpha(params.firstName, "es-ES")
    let lastName =
        !validator.isEmpty(params.lastName) &&
        validator.isLength(params.lastName, { min: 3, max: undefined }) &&
        validator.isAlpha(params.lastName, "es-ES")
    let nickName =
        !validator.isEmpty(params.nickName) &&
        validator.isLength(params.nickName, { min: 2, max: undefined })
    let email =
        !validator.isEmpty(params.email) &&
        validator.isEmail(params.email)
    let password =
        !validator.isEmpty(params.password)

    if (params.bio) {
        let bio =
            validator.isLength(params.bio, { min: undefined, max: 255 })
        if (!bio) {
            throw new Error("No se ha superado la validación")
        } else {
            console.log("validación superada")
        }
    }


    if (!firstName || !lastName || !nickName || !email || !password) {
        throw new Error("No se ha superado la validación")
    } else {
        console.log("validación superada")
    }
}

module.exports = validate
