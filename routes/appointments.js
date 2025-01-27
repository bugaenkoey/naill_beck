const express = require("express");
const db = require("../models/db.js");

const router = express.Router();

router.get("/", (req, res) => {
  const query = "SELECT * FROM appointments";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

router.get("/master/:master_id", (req, res) => {
  const { master_id } = req.params;
  const query = "SELECT * FROM appointments WHERE master_id = ?";
  db.execute(query, [master_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

router.post("/", (req, res) => {
  const { client_id, master_id, date_time, service_id } = req.body;
  const serviceQuery = "SELECT duration FROM services WHERE id = ?";
  db.execute(serviceQuery, [service_id], (err, serviceResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (serviceResults.length === 0) {
      return res.status(400).json({ message: "Service not found" });
    }

    const serviceDuration = serviceResults[0].duration;
    const startTime = new Date(date_time);
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

    const conflictQuery = `
      SELECT * FROM appointments 
      WHERE master_id = ? 
      AND ((date_time BETWEEN ? AND ?) 
      OR (? BETWEEN date_time AND DATE_ADD(date_time, INTERVAL ? MINUTE)))
    `;
    db.execute(
      conflictQuery,
      [master_id, startTime, endTime, startTime, serviceDuration],
      (err, conflictResults) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (conflictResults.length > 0) {
          return res.status(400).json({ message: "Time slot already booked" });
        }

        const query =
          "INSERT INTO appointments (client_id, master_id, date_time, service_id) VALUES (?, ?, ?, ?)";
        db.execute(
          query,
          [client_id, master_id, startTime, service_id],
          (err, results) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            res
              .status(201)
              .json({ message: "Appointment created successfully" });
          }
        );
      }
    );
  });
});

router.get("/details", (req, res) => {
  const query = `
    SELECT 
      users.username AS client,
      masters.specialty AS master_specialty,
      appointments.date_time,
      services.name AS service_name,
      services.duration,
      services.price
    FROM 
      appointments
    JOIN 
      users ON appointments.client_id = users.id
    JOIN 
      masters ON appointments.master_id = masters.id
    JOIN 
      services ON appointments.service_id = services.id
  `;
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
