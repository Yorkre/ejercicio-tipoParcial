// src/models/library.model.ts

// Tipos Literales (Union Types): Restringen los valores posibles. 
// Si en el examen te piden que un estado sea "Activo" o "Inactivo", lo defines así.
export type Genre = "Fantasy" | "SciFi" | "Mystery" | "Programming";
export type Format = "Hardcover" | "Paperback" | "Ebook";

export type BookT = {
    id: number;
    title: string;
    genre: Genre;
    format: Format;
};

export type AuthorT = {
    id: number;
    name: string;
    // Relaciones: El profesor exige redundancia de datos.
    books: BookT[];             // Almacena TODOS los libros asignados al autor.
    fantasyBooks: BookT[];      // Sub-lista calculada: Solo libros de fantasía.
    programmingBooks: BookT[];  // Sub-lista calculada: Solo libros de programación.
};