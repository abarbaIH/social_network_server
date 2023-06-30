// Acciones de prueba
const testFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controllers/follow-controllers.js"
    })
}

// Exportar acciones
module.exports = {
    testFollow
}