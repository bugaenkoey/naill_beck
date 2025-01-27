const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const db = require("./models/db.js");

// Підключення маршрутів
const userRoutes = require("./routes/users.js");
const masterRoutes = require("./routes/masters");
const appointmentRoutes = require("./routes/appointments.js");
const serviceRoutes = require("./routes/services");

app.use("/users", userRoutes);
app.use("/masters", masterRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/services", serviceRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// export default app;
