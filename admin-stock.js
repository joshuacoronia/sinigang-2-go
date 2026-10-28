function renderAdminStock() {
    const stock = getInventory();
    const grid = document.getElementById("stockGrid");

    if (!grid) return;

    grid.replaceChildren();

    let lowCount = 0;
    let outCount = 0;

    Object.entries(stock).forEach(function ([name, quantity]) {
        const amount = Math.max(0, Number(quantity) || 0);
        const card = document.createElement("article");
        card.className = "stock-card";

        const isOut = amount === 0;
        const isLow = amount > 0 && amount <= LOW_STOCK_THRESHOLD;

        if (isOut) {
            card.classList.add("out");
            outCount++;
        } else if (isLow) {
            card.classList.add("low");
            lowCount++;
        }

        const productName = document.createElement("h4");
        productName.textContent = name;

        if (isLow || isOut) {
            const mark = document.createElement("span");
            mark.className = "warning-mark";
            mark.textContent = "!";
            mark.setAttribute("aria-label", "Low stock warning");
            card.appendChild(mark);
        }

        const controls = document.createElement("div");
        controls.className = "admin-stock-controls";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.className = "stock-adjust-button";
        decreaseButton.textContent = "−";
        decreaseButton.setAttribute("aria-label", "Decrease " + name + " stock");
        decreaseButton.disabled = amount <= 0;

        const quantityNumber = document.createElement("p");
        quantityNumber.className = "quantity";
        quantityNumber.textContent = amount;

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.className = "stock-adjust-button";
        increaseButton.textContent = "+";
        increaseButton.setAttribute("aria-label", "Increase " + name + " stock");

        const quantityLabel = document.createElement("p");
        quantityLabel.className = "quantity-label";
        quantityLabel.textContent = "left";

        decreaseButton.addEventListener("click", function () {
            adjustStock(name, -1);
        });

        increaseButton.addEventListener("click", function () {
            adjustStock(name, 1);
        });

        controls.append(
            decreaseButton,
            quantityNumber,
            increaseButton,
            quantityLabel
        );

        card.append(productName, controls);
        grid.appendChild(card);
    });

    document.getElementById("totalProducts").textContent =
        Object.keys(stock).length;

    document.getElementById("lowStockCount").textContent = lowCount;
    document.getElementById("outOfStockCount").textContent = outCount;

    const alert = document.getElementById("stockAlert");
    const message = document.getElementById("stockAlertMessage");

    alert.hidden = lowCount === 0 && outCount === 0;

    if (outCount > 0) {
        message.textContent = `${outCount} product(s) are out of stock.`;
    } else if (lowCount > 0) {
        message.textContent = `${lowCount} product(s) have low stock.`;
    } else {
        message.textContent = "";
    }

    updateStockWarning();
}

function adjustStock(productName, change) {
    const stock = getInventory();

    if (!Object.prototype.hasOwnProperty.call(stock, productName)) {
        return;
    }

    const currentQuantity = Math.max(
        0,
        Number(stock[productName]) || 0
    );

    stock[productName] = Math.max(0, currentQuantity + change);

    saveInventory(stock);
    renderAdminStock();
}

renderAdminStock();

window.addEventListener("storage", function (event) {
    if (
        event.key === STOCK_KEY ||
        event.key === "posProducts"
    ) {
        renderAdminStock();
    }
});

window.addEventListener("focus", renderAdminStock);