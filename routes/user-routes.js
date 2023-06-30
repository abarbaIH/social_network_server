const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user-controllers");
const checkAuth = require('../middlewares/auth')

// Definir rutas
router.get("/test-user", checkAuth.auth, UserController.testUser);
router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.get("/profile/:user_id", checkAuth.auth, UserController.profile);



// Exportar el router
module.exports = router;

