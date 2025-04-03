const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

console.log(db);

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  db.query("SELECT 1+1").on("result", function (row) {
    console.log(row);
  });

  console.log("Connected to MySQL database.");
});

module.exports = db;
