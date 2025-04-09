const request = require("supertest");
// const app = require("../app"); // Якщо ти експортнеш Express app з app.js
const { app, server, db } = require("../app");

describe("Users API", () => {
  it("should get all users", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  }, 1000);

  it("should create a new users", async () => {
    const newService = { username: "Євген-007", password: "evgen@example.com" };

    const res = await request(app).post("/users/register").send(newService);
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("User registered successfully");
  }, 1000);

  it("login users", async () => {
    const login = {
      username: "Євген-007",
      password: "evgen@example.com",
    };

    const res = await request(app).post("/users/login").send(login);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Login successful");
    // console.log("Login successful");
  }, 1000);
});

// Закриття серверу після тестів
afterAll(() => {
  server.close();
  /*
});

afterAll(() => {
    */
  db.end(); // Закриття MySQL-з'єднання
});
