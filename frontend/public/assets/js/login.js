//file: login.js
// used by login.html to log a user in

async function login(event) {
    event.preventDefault();
  
    const formData = new FormData(document.getElementById("login-form"));
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password")
    };
  
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert("Logged in successfully.");
        window.location.href = "website.html";
      } else {
        alert(result.message || "Login failed.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again.");
    }
  }
