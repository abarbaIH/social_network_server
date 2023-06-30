const express = require("express")
const router = express.Router()
const FollowController = require('./../controllers/follow-controllers')

// Definir rutas
router.get("/test-follow", FollowController.testFollow)

// Exportar el router
module.exports = router