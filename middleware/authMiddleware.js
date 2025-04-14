const jwt = require("jsonwebtoken");
// const secretKey = "your_secret_key";

const secretKey = process.env.JWT_SECRET_KEY;

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Отримання токена
  if (!token)
    return res.status(401).json({ message: "Необхідно залогінитися" });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: "Недійсний токен" });
    req.user = user; // Додаємо `user` до запиту
    next();
  });
}

module.exports = authenticateToken;
