//file: auth.js
 
const crypto = require("crypto");
const db = require("./db");

async function login(req, res) {
  const { email, password } = req.body;
  console.log(`Login attempt: ${email}`);

  try {
    const user = (await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    )).rows[0];

    if (!user) return res.status(401).json({ message: "User not found." });

    const attemptedHash = crypto.pbkdf2Sync(password, "staticSalt", 1000, 64, "sha512").toString("hex");

    if (attemptedHash !== user.password_hash)
      return res.status(401).json({ message: "Invalid password." });

    req.session.user = { user_id: user.user_id, name: user.name };
    res.json({ message: "Logged in" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

function ensureAdmin(req, res, next) {
  console.log("checking authroization ... ");
  console.log(`${req.session.user}`);
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

//module.exports = { register, login, ensureAdmin };
module.exports = { login, ensureAdmin };

