const express = require("express");
const db = require("../models/db.js");

const router = express.Router();

router.post("/", (req, res) => {
  const { name, duration, price } = req.body;
  const query = "INSERT INTO services (name, duration, price) VALUES (?, ?, ?)";
  db.execute(query, [name, duration, price], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Service created successfully" });
  });
});

router.get("/", (req, res) => {
  const query = "SELECT * FROM services";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

router.post("/assign", (req, res) => {
  const { master_id, service_id } = req.body;
  const query =
    "INSERT INTO master_services (master_id, service_id) VALUES (?, ?)";
  db.execute(query, [master_id, service_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res
      .status(201)
      .json({ message: "Service assigned to master successfully" });
  });
});

module.exports = router;
