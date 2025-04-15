// server.js
const express = require("express");
const crypto = require("crypto");
const session = require("express-session");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // set to true in production with HTTPS
}));

// ========================
// 🔐 REGISTER ROUTE
// ========================
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");

  try {
    await pool.query(
      "INSERT INTO users (username, email, hash, salt, role) VALUES ($1, $2, $3, $4, $5)",
      [username, email, hash, salt, role || "user"]
    );
    res.status(200).json({ message: "Registered!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user", error: err });
  }
});

// ========================
// 🔐 LOGIN ROUTE
// ========================
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = (await pool.query("SELECT * FROM users WHERE username = $1", [username])).rows[0];

    if (!user) return res.status(401).json({ message: "Login failed" });

    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, "sha512").toString("hex");
    if (hash !== user.hash) return res.status(401).json({ message: "Invalid password" });

    req.session.user = { username: user.username, role: user.role };
    res.status(200).json({ message: "Logged in!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ========================
// ✅ CHECK AUTH
// ========================
app.get("/check-auth", (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

// ========================
// 🚪 LOGOUT
// ========================
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logged out" });
});

// ========================
// 🚀 START SERVER
// ========================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


app.post("/api/checkout", async (req, res) => {
  const { cart } = req.body;
  const user = req.session.user;

  if (!user) return res.status(401).json({ success: false, message: "Not logged in" });

  try {
    const userRes = await pool.query("SELECT user_id, address_id FROM users WHERE email = $1", [user.email]);
    const { user_id, address_id } = userRes.rows[0];

    // Start transaction
    await pool.query("BEGIN");

    const orderRes = await pool.query(
      "INSERT INTO orders (user_id, total_amount) VALUES ($1, 0) RETURNING order_id",
      [user_id]
    );
    const order_id = orderRes.rows[0].order_id;

    for (const [productName, quantity] of Object.entries(cart)) {
      const productRes = await pool.query("SELECT * FROM products WHERE name = $1", [productName]);
      const product = productRes.rows[0];
      if (!product) throw new Error(`Product not found: ${productName}`);

      const limitRes = await pool.query(
        "SELECT total_purchased FROM purchaselimits WHERE address_id = $1 AND product_id = $2",
        [address_id, product.product_id]
      );

      const alreadyPurchased = limitRes.rows[0]?.total_purchased || 0;
      if (alreadyPurchased + quantity > 2) {
        throw new Error(`Cannot purchase more than 2 of ${productName}`);
      }

      // Update purchase limit
      if (limitRes.rows.length > 0) {
        await pool.query(
          "UPDATE purchaselimits SET total_purchased = total_purchased + $1 WHERE address_id = $2 AND product_id = $3",
          [quantity, address_id, product.product_id]
        );
      } else {
        await pool.query(
          "INSERT INTO purchaselimits (address_id, product_id, total_purchased) VALUES ($1, $2, $3)",
          [address_id, product.product_id, quantity]
        );
      }

      // Add to orderitems
      await pool.query(
        "INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order_id, product.product_id, quantity, product.price]
      );
    }

    await pool.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Checkout error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});
