// Importar dependencias
const connection = require('./database/db-connection')
const express = require("express")
const cors = require("cors")

// Mensaje Bienvenida
console.log("API NODE para social network arrancada ")

// Conexión a BBDD
connection()

// Crear servidor Node
const app = express()
const port = 5005

// Configurar CORS
app.use(cors())

// Convertir datos del body a objetos js (tanto los JSON como los que nos lleguen en urlencoded)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cargar configuración de rutas
const UserRoutes = require('./routes/user-routes')
const PublicationRoutes = require('./routes/publication-routes')
const FollowRoutes = require('./routes/follow-routes')

app.use("/api/user", UserRoutes)
app.use("/api/publication", PublicationRoutes)
app.use("/api/follow", FollowRoutes)

// Ruta de prueba
app.get("/test-path", (req, res) => {
    return res.status(200).json(
        {
            "id": 1,
            "name": "Alvaro",
            "web": "alvaro.com"
        }
    )
})

// Poner el servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Servidor de NODE corriendo en el puerto ", port)
})