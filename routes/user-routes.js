const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user-controllers");
const checkAuth = require('../middlewares/auth')
const multer = require('multer')

// Cconfiguración de subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../uploads/avatars")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname)
    }
})

// Crear el middleware con multar
const uploads = multer({ storage })

// Definir rutas
router.get("/test-user", checkAuth.auth, UserController.testUser);
router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.get("/profile/:user_id", checkAuth.auth, UserController.profile);
router.get("/list/:page?", checkAuth.auth, UserController.list);
router.put("/update", checkAuth.auth, UserController.update);
router.post("/upload", [checkAuth.auth, uploads.single("file0")], UserController.upload);

// Exportar el router
module.exports = router;

