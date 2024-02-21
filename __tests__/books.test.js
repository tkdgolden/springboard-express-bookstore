const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

process.env.NODE_ENV = 'test';

let b1 = {
    isbn: "0691161519",
    amazon_url: "http://a.co/eobPtX2",
    author: "Matthew Lane",
    language: "english",
    pages: 264,
    publisher: "Princeton University Press",
    title: "Power-Up: Unlocking Hidden Math in Vide",
    year: 2017
};
let b2 = {
    isbn: "0691161520",
    amazon_url: "http://a.co/eosdfads",
    author: "John Doe",
    language: "french",
    pages: 222,
    publisher: "Albertsons University Press",
    title: "Once Upon a Time",
    year: 2020
  }

describe("Books Route Tests", function () {
    beforeEach(async function () {
        await db.query("DELETE FROM books");

        await Book.create(b1);
    });

    test("get all", async function () {
        let response = await request(app).get("/books");

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ books: [b1] });
    });

    test("get one", async function () {
        let response = await request(app).get(`/books/${b1.isbn}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ book: b1 });
    });

    test("error get nonexistant book", async function () {
        let response = await request(app).get(`/books/1234`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({"error": {"message": "There is no book with an isbn '1234", "status": 404}, "message": "There is no book with an isbn '1234"});
    });

    test("delete book", async function () {
        let response = await request(app).delete(`/books/${b1.isbn}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "Book deleted" });
        const isThere = await Book.findAll();
        expect(isThere).toEqual([]);
    });

    test("error delete nonexistant book", async function () {
        let response = await request(app).delete(`/books/1234`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({"error": {"message": "There is no book with an isbn '1234", "status": 404}, "message": "There is no book with an isbn '1234"});
    });

    test("post book", async function () {
        let response = await request(app).post("/books").send({
            book: b2
          });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ book : b2 });
    });

    test("error post missing isbn", async function () {
        let response = await request(app).post("/books").send({
            book: {
                amazon_url: "http://a.co/eobPtX2",
                author: "Matthew Lane",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Power-Up: Unlocking Hidden Math in Vide",
                year: 2017
              }
          });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(expect.objectContaining({ message: ["instance.book requires property \"isbn\""]}));
    });

    test("put book", async function () {
        let response = await request(app).put(`/books/${b1.isbn}`).send({
            amazon_url: "http://a.co/eosdfads",
            author: "John Doe",
            language: "french",
            pages: 222,
            publisher: "Albertsons University Press",
            title: "Once Upon a Time",
            year: 2020
          });

        expect(response.statusCode).toBe(200);
        expect(response.body.book).toEqual(expect.objectContaining({ language: "french" }));
    });

    test("error put nonexitent book", async function () {
        let response = await request(app).put(`/books/1234`).send({
            book: {
                amazon_url: "http://a.co/eobPtX2",
                author: "Matthew Lane",
                language: "english",
                pages: 264,
                publisher: "Princeton University Press",
                title: "Power-Up: Unlocking Hidden Math in Vide",
                year: 2017
              }
          });

        expect(response.statusCode).toBe(404);
    });

});

afterAll(async function () {
    await db.end();
});