const express = require("express")
const router = express.Router()
const PublicationController = require('./../controllers/publication-controllers')

// Definir rutas
router.get("/test-publication", PublicationController.testPublication)

// Exportar el router
module.exports = router