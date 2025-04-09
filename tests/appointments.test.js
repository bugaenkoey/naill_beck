const request = require("supertest");
const { app, server, db } = require("../app");

describe("Appointments API", () => {
  it("should get all appointments", async () => {
    const res = await request(app).get("/appointments");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  }, 1000);

  it("should get appointments by master ID", async () => {
    const masterId = 1; // Замініть на існуючий master_id
    const res = await request(app).get(`/appointments/master/${masterId}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  }, 1000);

  //   it("should create a new appointment", async () => {
  //     const newAppointment = {
  //       client_id: 1,
  //       master_id: 1,
  //       date_time: "2025-04-12T14:00:00",
  //       service_id: 1,
  //     };

  //     const res = await request(app).post("/appointments").send(newAppointment);
  //     expect(res.statusCode).toEqual(201);
  //     expect(res.body.message).toBe("Appointment created successfully");
  //   }, 1000);

  //   it("should return error if service ID does not exist", async () => {
  //     const res = await request(app).post("/appointments").send({
  //       client_id: 1,
  //       master_id: 2,
  //       date_time: "2025-04-12T15:00:00",
  //       service_id: 9999, // Неправильний ID послуги
  //     });
  //     expect(res.statusCode).toEqual(400);
  //     expect(res.body.message).toBe("Service not found");
  //   }, 1000);

  //   it("should return error if appointment time slot is already booked", async () => {
  //     const res = await request(app).post("/appointments").send({
  //       client_id: 1,
  //       master_id: 2,
  //       date_time: "2025-04-12T14:00:00", // Час, який вже заброньований
  //       service_id: 3,
  //     });
  //     expect(res.statusCode).toEqual(400);
  //     expect(res.body.message).toBe("Time slot already booked");
  //   }, 1000);

  it("should get appointment details", async () => {
    const res = await request(app).get("/appointments/details");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  }, 1000);
});

// Закриття серверу та БД після тестів
// afterAll(() => {
//   server.close();
//   db.end();
// });

afterAll(async () => {
  await db.end();
});
