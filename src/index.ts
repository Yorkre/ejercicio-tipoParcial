import express from "express";
import libraryRoutes from "./routes/library.routes.js"; // RECUERDA: Siempre extensión .js en ESM

const app = express();

// CRÍTICO: Este middleware intercepta las peticiones y transforma el Body (texto crudo) en un objeto JSON (req.body).
// Si se te olvida esta línea, req.body será 'undefined' y los POST/PATCH fallarán.
app.use(express.json()); 

// Monta todas las rutas definidas en library.routes.ts colgando del prefijo "/api".
// Ejemplo: /authors se convierte en /api/authors.
app.use("/api", libraryRoutes); 

// Levanta el servidor en el puerto 3000.
app.listen(3000, () => {
    console.log("API de la Biblioteca funcionando en el puerto 3000");
});