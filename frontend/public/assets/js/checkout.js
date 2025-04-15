document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "{}");
    const list = document.getElementById("checkoutList");
    const totalDisplay = document.getElementById("total");
    const confirmBtn = document.getElementById("confirm");
  
    if (!list || !totalDisplay || !confirmBtn) return;
  
    let total = 0;
    list.innerHTML = "";
  
    for (const [name, item] of Object.entries(cart)) {
      const line = document.createElement("li");
      line.textContent = `${name} — Qty: ${item.quantity} @ $${item.price}`;
      list.appendChild(line);
      total += item.quantity * item.price;
    }
  
    totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
  
    confirmBtn.addEventListener("click", async () => {
      const res = await fetch("http://localhost:3000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cart }),
      });
  
      const result = await res.json();
      if (result.success) {
        alert("Purchase complete!");
        localStorage.removeItem("cart");
        window.location.href = "website.html";
      } else {
        alert("Purchase failed: " + result.message);
      }
    });
  });