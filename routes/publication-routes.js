const express = require("express")
const router = express.Router()
const multer = require('multer')
const PublicationController = require('./../controllers/publication-controllers')
const checkAuth = require('../middlewares/auth')

// Cconfiguración de subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../social_network_server/uploads/publicationFile")
    },
    filename: (req, file, cb) => {
        cb(null, "pub-" + Date.now() + "-" + file.originalname)
    }
})

// Crear el middleware con multer
const uploads = multer({ storage })

// Definir rutas
router.get("/test-publication", PublicationController.testPublication)
router.post("/savePublication", checkAuth.auth, PublicationController.savePublication)
router.get("/publicationDetails/:id", checkAuth.auth, PublicationController.publicationDetails)
router.delete("/deletePublication/:id", checkAuth.auth, PublicationController.deletePublication)
router.get("/userPublicationList/:id/:page?", checkAuth.auth, PublicationController.userPublicationList)
router.post("/uploadPublicationFile/:id", [checkAuth.auth, uploads.single("file0")], PublicationController.uploadPublicationFile);
router.get("/showPublicationFile/:file", PublicationController.showPublicationFile);
router.get("/followingPublicationList/:page?", checkAuth.auth, PublicationController.followingPublicationList)



// Exportar el router
module.exports = router