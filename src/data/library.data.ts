import type { AuthorT, BookT } from "../models/library.model.js";

// Arrays globales en memoria. Aquí "viven" los datos mientras el servidor no se reinicie.
export let authors: AuthorT[] = [];
export let books: BookT[] = [];

// Contadores globales para simular el Auto-Increment de una base de datos real.
export let nextAuthorId = 1;
export let nextBookId = 1;

// Funciones mutadoras exigidas por el profesor. 
// Sobrescriben el array global entero con una nueva versión.
export const changeAuthors = (authorsParam: AuthorT[]) => {
    authors = authorsParam;
}

export const changeBooks = (booksParam: BookT[]) => {
    books = booksParam;
}

// Funciones para avanzar los IDs tras cada creación exitosa (POST).
export const incrementAuthorId = () => {
    nextAuthorId++;
}

export const incrementBookId = () => {
    nextBookId++;
}

// EL MOTOR DEL EXAMEN: Esta función recalcula las sub-listas.
// Se debe llamar SIEMPRE que se añada o borre un libro del array principal 'books' de un autor.
export const updateAuthorCategoryLists = (author: AuthorT) => {
    // .filter() crea un array nuevo solo con los elementos que cumplan la condición.
    author.fantasyBooks = author.books.filter(b => b.genre === "Fantasy");
    author.programmingBooks = author.books.filter(b => b.genre === "Programming");
}