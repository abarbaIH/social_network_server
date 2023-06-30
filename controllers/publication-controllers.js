// Acciones de prueba
const testPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde controllers/publication-controllers.js"
    })
}

// Exportar acciones
module.exports = {
    testPublication
}