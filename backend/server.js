//file: server.js
 
const express = require("express");
const crypto = require('crypto');
const session = require("express-session");
const pool = require('./db');
const auth = require("./auth");
require("dotenv").config();

const app = express();
const saltRounds = 10;

app.use(express.json());

// Manual CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost"); // allow from your frontend
  res.header("Access-Control-Allow-Credentials", "true");        // allow session cookies
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // short-circuit preflight request
  }

  next();
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false} // would be set to true if using HTTPS
  })
);

// app.post("/register", auth.register);
app.post("/register", async (req, res) => {
  const { name, email, password, address } = req.body;

  // Generate password hash
  const password_hash = crypto.pbkdf2Sync(password, "staticSalt", 1000, 64, "sha512").toString("hex");

  try {
    // Step 1: Insert address first
    const addrResult = await pool.query(
      `INSERT INTO addresses (street, city, state, zip_code, country)
       VALUES ($1, $2, $3, $4, $5) RETURNING address_id`,
      [address.street, address.city, address.state, address.zip, address.country]
    );
    const address_id = addrResult.rows[0].address_id;

    // Step 2: Insert user with that address
    const userResult = await pool.query(
      `INSERT INTO users (user_id, email, password_hash, name, address_id)
       VALUES (DEFAULT, $1, $2, $3, $4) RETURNING user_id`,
      [email, password_hash, name, address_id]
    );

    res.json({ success: true, user_id: userResult.rows[0].user_id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

app.post("/login", auth.login);

app.get("/users", auth.ensureAdmin, async (req, res) => {
  console.log("in GET /users");
  const result = await pool.query("SELECT username, email, role FROM users");
  console.log(`GET /users rows: ${result.rows}`);
  res.json(result.rows);
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

app.get("/session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
