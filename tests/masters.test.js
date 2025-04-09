const request = require("supertest");
const { app, server, db } = require("../app");

describe("Masters API", () => {
  it("should get all masters", async () => {
    const res = await request(app).get("/masters");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  }, 10000);

  it("should register a new master", async () => {
    const newMaster = {
      user_id: 1,
      specialty: "Манікюр",
    };

    const res = await request(app).post("/masters/register").send(newMaster);
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("Master registered successfully");
  }, 10000);

  it("should return error for missing fields in registration", async () => {
    const res = await request(app).post("/masters/register").send({});
    expect(res.statusCode).toEqual(500); // Або 400, якщо ти змінюєш перевірку
  }, 10000);
});

// Закриття серверу та MySQL-з'єднання після тестів
// afterAll(() => {
//   server.close();
//   db.end();
// });

afterAll(async () => {
  await db.end();
});
