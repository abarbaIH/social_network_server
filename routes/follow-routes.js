const express = require("express")
const router = express.Router()
const FollowController = require('./../controllers/follow-controllers')
const checkAuth = require('../middlewares/auth')

// Definir rutas
router.get("/test-follow", FollowController.testFollow)
router.post("/saveFollow", checkAuth.auth, FollowController.saveFollow)
router.delete("/deleteFollow/:id", checkAuth.auth, FollowController.deleteFollow)
router.get("/followingList/:id?/:page?", checkAuth.auth, FollowController.followingList)
router.get("/followersList/:id?/:page?", checkAuth.auth, FollowController.followersList)

// Exportar el router
module.exports = router