import type { Request, Response } from "express";
import { 
    authors, books, 
    changeAuthors, changeBooks, 
    nextAuthorId, nextBookId, 
    incrementAuthorId, incrementBookId, 
    updateAuthorCategoryLists 
} from "../data/library.data.js";
import type { AuthorT, BookT, Genre, Format } from "../models/library.model.js";


// ===================== AUTORES =====================

export const getAuthors = (req: Request, res: Response) => {
    res.json(authors); // Devuelve el array completo en formato JSON (Status 200 implícito)
}

// Función auxiliar (Patrón del profesor): Busca un elemento y, si no existe, emite directamente el error HTTP 404.
const findAuthor = (id: number, res: Response) => {
    const author = authors.find(x => x.id === id);
    if (!author) {
        res.status(404).json({ message: "no author" });
        return; // Retorna undefined para detener el flujo en la función padre
    }
    return author;
}

export const getAuthorWithID = (req: Request, res: Response) => {
    const id = Number(req.params.id); // Extrae el :id de la URL y lo convierte a número
    const author = findAuthor(id, res); // Delega la búsqueda y el error 404
    if (author) {
        res.json(author); // Si existe, lo devuelve
    }
}

export const createAuthor = (req: Request, res: Response) => {
    const { name } = req.body; // Extrae la propiedad 'name' del JSON enviado por el cliente

    // Validación de seguridad: Verifica que exista, sea un string y no esté vacío.
    if (!name || typeof name !== "string" || name.trim() === "") {
        res.status(400).json({ message: "Nombre obligatorio" });
        return;
    }

    // Construye el nuevo objeto respetando el tipado estricto AuthorT
    const nuevoAuthor: AuthorT = {
        id: nextAuthorId, // Usa el contador global
        name: name.trim(),
        books: [],            // Inicializa las relaciones vacías
        fantasyBooks: [],
        programmingBooks: []
    };

    incrementAuthorId(); // Sube el contador para el próximo POST
    changeAuthors([...authors, nuevoAuthor]); // Recrea el array esparciendo el anterior (...) y añadiendo el nuevo

    res.status(201).json(nuevoAuthor); // 201 = Recurso Creado
}

export const changeAuthor = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const author = findAuthor(id, res);

    if (author) {
        // Spread operator: Mezcla las propiedades antiguas del autor con las nuevas que vengan en req.body
        const updatedAuthor = { ...author, ...req.body };
        // Mapea el array: Si el ID coincide, inyecta el objeto actualizado. Si no, deja el original.
        changeAuthors(authors.map(x => x.id === id ? updatedAuthor : x));
        res.json({ message: "Autor actualizado", author: updatedAuthor });
    } else {
        res.status(400).json({ message: "No se pudo actualizar" }); // Fallback de error
    }
}

export const deleteAuthor = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const author = findAuthor(id, res);

    if (author) {
        // .filter() devuelve todos los autores MENOS el que coincide con el ID a borrar
        changeAuthors(authors.filter(x => x.id !== id));
        res.json({ message: "Autor eliminado" });
    } else {
        res.status(400).json({ message: "No se pudo eliminar" });
    }
}


// ===================== LIBROS =====================
// Sigue la misma estructura básica que Autores, con validaciones extra.

export const getBooks = (req: Request, res: Response) => { res.json(books); }

const findBook = (id: number, res: Response) => {
    const book = books.find(x => x.id === id);
    if (!book) {
        res.status(404).json({ message: "no book sorry" });
        return;
    }
    return book;
}

export const getBookWithID = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const book = findBook(id, res);
    if (book) res.json(book);
}

export const createBook = (req: Request, res: Response) => {
    const { title, genre, format } = req.body;

    // Validación de Type Guard: Garantiza que no inyecten géneros no contemplados en el modelo
    const validGenres: Genre[] = ["Fantasy", "SciFi", "Mystery", "Programming"];
    if (!genre || !validGenres.includes(genre)) {
        res.status(400).json({ message: "Genre no válido" });
        return;
    }

    const validFormats: Format[] = ["Hardcover", "Paperback", "Ebook"];
    if (!format || !validFormats.includes(format)) {
        res.status(400).json({ message: "Format no válido" });
        return;
    }

    const nuevoBook: BookT = { id: nextBookId, title, genre, format };

    incrementBookId();
    changeBooks([...books, nuevoBook]);
    res.status(201).json(nuevoBook);
}

export const deleteBook = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const book = findBook(id, res);

    if (book) {
        // 1. Borra el libro del array global de libros
        changeBooks(books.filter(x => x.id !== id));

        // 2. BORRADO EN CASCADA (Crucial para el examen)
        // Si el libro desaparece, hay que arrancarlo de todos los autores que lo posean.
        authors.forEach(author => {
            // Filtramos la lista principal de libros del autor para excluir el borrado
            author.books = author.books.filter(b => b.id !== id);
            // Re-ejecutamos la función auxiliar para que los arrays de géneros se actualicen solos
            updateAuthorCategoryLists(author);
        });

        res.json({ message: "Libro eliminado" });
    } else {
        res.status(400).json({ message: "No se pudo eliminar" });
    }
}


// ===================== RELACIÓN (AÑADIR LIBRO A AUTOR) =====================
// Endpoint compuesto (PUT /authors/:authorId/books/:bookId)

export const addBookToAuthor = (req: Request, res: Response) => {
    // 1. Extraer ambos IDs de los parámetros de la URL
    const authorId = Number(req.params.authorId);
    const bookId = Number(req.params.bookId);

    // 2. Validar que ambos recursos existen de forma independiente
    const author = findAuthor(authorId, res);
    if (!author) return; // Si falla, findAuthor ya ha enviado el res.status(404)

    const book = findBook(bookId, res);
    if (!book) return;

    // 3. Evitar duplicidad: .some() devuelve true si el libro ya está dentro del autor
    const yaExiste = author.books.some(b => b.id === bookId);
    if (yaExiste) {
        res.status(400).json({ message: "El libro ya está en este autor" });
        return;
    }

    // 4. Inserción: Se añade el objeto del libro a la lista principal del autor
    author.books.push(book);
    
    // 5. Recalcular sub-listas: El libro inyectado se clasifica automáticamente por su género
    updateAuthorCategoryLists(author);

    res.json({
        message: "Libro añadido correctamente",
        author: author // Devuelve el autor para verificar visualmente que las sub-listas se han llenado
    });
}