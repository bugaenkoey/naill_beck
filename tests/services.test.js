const request = require("supertest");
// const app = require("../app"); // Якщо ти експортнеш Express app з app.js
const { app, server, db } = require("../app");

describe("Services API", () => {
  it("should get all services", async () => {
    const res = await request(app).get("/services");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  }, 1000);

  it("should create a new service", async () => {
    const newService = {
      name: "Педикюр-4",
      duration: 60,
      price: 300,
    };

    const res = await request(app).post("/services").send(newService);
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("Service created successfully");
  }, 1000);
});

// Закриття серверу після тестів
// afterAll(() => {
//   server.close();
//   db.end(); // Закриття MySQL-з'єднання
// });

afterAll(async () => {
  await db.end();
});
