//file: dashboard.js
// used by dashboard.html to fetch users from the database
// and udpate HTML table with user data

async function fetchUsers() {
    const response = await fetch("/api/users", { credentials: "include" });
    const users = await response.json();

    if (response.ok) {
        const userTable = document.getElementById("userList");
        userTable.innerHTML = "";

        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.is_admin ? "Yes" : "No"}</td>`;
            userTable.appendChild(row);
        });

    } else {
        alert("Unauthorized access!"); // Optional: remove later
        window.location.href = "../index.html";
    }
}

fetchUsers();

