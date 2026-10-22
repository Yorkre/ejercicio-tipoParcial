import { Router } from "express";
import { 
    getAuthors, getAuthorWithID, createAuthor, deleteAuthor, changeAuthor,
    getBooks, getBookWithID, createBook, deleteBook,
    addBookToAuthor 
} from "../controllers/library.controller.js";

const router = Router();

// --- RUTAS DE AUTORES ---
router.get("/authors", getAuthors);           // Leer todos
router.get("/authors/:id", getAuthorWithID);  // Leer uno (el :id es un parámetro dinámico)
router.post("/authors", createAuthor);        // Crear uno nuevo
router.delete("/authors/:id", deleteAuthor);  // Borrar por ID
router.patch("/authors/:id", changeAuthor);   // Actualizar por ID (el profesor usa PATCH para esto)

// --- RUTAS DE LIBROS ---
router.get("/books", getBooks);
router.get("/books/:id", getBookWithID);
router.post("/books", createBook);
router.delete("/books/:id", deleteBook);

// --- RUTA RELACIONAL ---
// Captura dos parámetros: el ID del autor y el ID del libro que queremos inyectarle.
router.put("/authors/:authorId/books/:bookId", addBookToAuthor);

export default router;