const notification = document.getElementById("notification");

let notificationTimer;

renderProductCards(false);

function updateAddButtons() {
    const stock = getInventory();

    document.querySelectorAll(".add-button").forEach(function(button) {
        const foodName = button.dataset.name;

        if (!(foodName in stock)) {
            button.disabled = false;
            button.textContent = "+ Add";
            return;
        }

        const outOfStock = Number(stock[foodName]) <= 0;

        button.disabled = outOfStock;
        button.textContent = outOfStock ? "Out of Stock" : "+ Add";
    });
}

updateAddButtons();

document.addEventListener("click", function(event) {
    const button = event.target.closest(".add-button");

    if (!button) return;

    const foodName = button.dataset.name;
    const foodPrice = Number(button.dataset.price);
    const stock = getInventory();

    if (foodName in stock && Number(stock[foodName]) <= 0) {
        updateAddButtons();
        return;
    }

    let cart = JSON.parse(localStorage.getItem("posCart")) || {};

    if (cart[foodName]) {
        cart[foodName].quantity += 1;
    } else {
        cart[foodName] = {
            price: foodPrice,
            quantity: 1
        };
    }

    localStorage.setItem("posCart", JSON.stringify(cart));

    notification.textContent = foodName + " was added!";
    notification.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(function() {
        notification.classList.remove("show");
    }, 2000);
});

window.addEventListener("storage", function(event) {
    if (event.key === PRODUCT_KEY) {
        renderProductCards(false);
        updateAddButtons();
    }

    if (event.key === "posStock") {
        updateAddButtons();
    }
});
