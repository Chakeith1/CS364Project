//File:register.js
// used by register.html
// send username, email, password and role to backend
// -- backend creates salt and hashed passowrd
// -- then tries to insert into database

// File: register.js
// Handles user registration by submitting form data to the backend

console.log("Register Script Loaded.");

async function register(event) {
  console.log("here we are in register.js");
  event.preventDefault(); // Prevent default form submission

  const form = document.getElementById("register-form");
  const formData = new FormData(form);

  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    address: {
      street: formData.get("street"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      country: formData.get("country")
    }
  };

  const jsonBody = JSON.stringify(userData);

  try {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // for session cookies
      body: jsonBody
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log("Registration successful:");
      console.log(result);
      alert(`User ${userData.name} registered successfully.`);
      window.location.href = "login.html";
    } else {
      console.error("Registration failed:", result.message);
      alert(result.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred during registration. Please try again.");
  }
}

