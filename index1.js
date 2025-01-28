const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database.");
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/users", (req, res) => {
  const query = "SELECT * FROM users";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Хешування паролю
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.execute(query, [username, hashedPassword], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "User registered successfully" });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ?";
  db.execute(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    // console.log(user);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("password: ", isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  });
});

app.get("/masters", (req, res) => {
  const query = "SELECT * FROM masters";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

app.post("/register-master", (req, res) => {
  const { user_id, specialty } = req.body;
  const query = "INSERT INTO masters (user_id, specialty) VALUES (?, ?)";
  db.execute(query, [user_id, specialty], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Master registered successfully" });
  });
});

// Маршрут для отримання всіх записів до майстрів
app.get("/appointments", (req, res) => {
  const query = "SELECT * FROM appointments";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

app.get("/appointments/master/:master_id", (req, res) => {
  const { master_id } = req.params;
  const query = "SELECT * FROM appointments WHERE master_id = ?";
  db.execute(query, [master_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

app.post("/appointments", (req, res) => {
  const { client_id, master_id, date_time, service_id } = req.body;

  // Отримати тривалість послуги
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

    // Перевірка на конфлікти в розкладі
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

        // Додавання запису до бази даних
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

// Маршрут для додавання запису до майстра
// app.post("/appointments", (req, res) => {
//   const { client_id, master_id, date_time } = req.body;
//   const query =
//     "INSERT INTO appointments (client_id, master_id, date_time) VALUES (?, ?, ?)";
//   db.execute(query, [client_id, master_id, date_time], (err, results) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.status(201).json({ message: "Appointment created successfully" });
//   });
// });

// Маршрут для додавання послуг
app.post("/services", (req, res) => {
  const { name, duration, price } = req.body;
  const query = "INSERT INTO services (name, duration, price) VALUES (?, ?, ?)";
  db.execute(query, [name, duration, price], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Service created successfully" });
  });
});

// Маршрут для отримання всіх послуг
app.get("/services", (req, res) => {
  const query = "SELECT * FROM services";
  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

// Маршрут для прив'язки послуги до майстра
app.post("/master-services", (req, res) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
