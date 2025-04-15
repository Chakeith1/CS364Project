document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".menuItem");
    const sliderItems = document.querySelectorAll(".sliderItem");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const selectedBrand = item.getAttribute("data-brand");

            sliderItems.forEach(card => {
                const cardBrand = card.getAttribute("data-brand");

                if (selectedBrand === "all" || cardBrand === selectedBrand) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const sliderItems = document.querySelectorAll(".sliderItem");
  
    if (searchBar) {
      searchBar.addEventListener("input", () => {
        const searchTerm = searchBar.value.toLowerCase();
  
        sliderItems.forEach(item => {
          const title = item.querySelector(".sliderTitle").textContent.toLowerCase();
          if (title.includes(searchTerm)) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    }
  });

  const cart = JSON.parse(localStorage.getItem("cart")) || {};

  document.querySelectorAll(".BuyButton").forEach((button) => {
    button.addEventListener("click", (e) => {
      const item = e.target.closest(".sliderItem");
      const title = item.querySelector(".sliderTitle").innerText;
      const price = parseFloat(item.querySelector(".sliderPrice").innerText.replace("$", ""));
  
      if (!cart[title]) {
        cart[title] = { quantity: 1, price: price };
      } else if (cart[title].quantity < 2) {
        cart[title].quantity++;
      } else {
        alert("Limit reached: You can only buy 2 of this GPU.");
        return;
      }
  
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${title} added to cart. Total: ${cart[title].quantity}`);
    });
  });

