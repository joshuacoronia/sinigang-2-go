function renderStock() {
    const stock = getInventory();
    const grid = document.getElementById("stockGrid");

    if (!grid) return;

    grid.replaceChildren();

    let lowCount = 0;
    let outCount = 0;

    Object.entries(stock).forEach(([name, quantity]) => {
        const card = document.createElement("article");
        card.className = "stock-card";

        const isOut = quantity <= 0;
        const isLow = quantity <= LOW_STOCK_THRESHOLD;

        if (isOut) {
            card.classList.add("out");
            outCount++;
        } else if (isLow) {
            card.classList.add("low");
            lowCount++;
        }

        const productName = document.createElement("h4");
        productName.textContent = name;

        const quantityNumber = document.createElement("p");
        quantityNumber.className = "quantity";
        quantityNumber.textContent = quantity;

        const quantityLabel = document.createElement("p");
        quantityLabel.className = "quantity-label";
        quantityLabel.textContent = "Items remaining";

        if (isLow) {
            const mark = document.createElement("span");
            mark.className = "warning-mark";
            mark.textContent = "!";
            mark.setAttribute("aria-label", "Low stock warning");
            card.appendChild(mark);
        }

        card.append(
            productName,
            quantityNumber,
            quantityLabel,
        );

        grid.appendChild(card);
    });

    document.getElementById("totalProducts").textContent =
        Object.keys(stock).length;

    document.getElementById("lowStockCount").textContent =
        lowCount;

    document.getElementById("outOfStockCount").textContent =
        outCount;

    const alert = document.getElementById("stockAlert");
    const message = document.getElementById("stockAlertMessage");

    alert.hidden = lowCount === 0 && outCount === 0;

    if (outCount > 0) {
        message.textContent =
            `${outCount} product(s) are out of stock.`;
    } else if (lowCount > 0) {
        message.textContent =
            `${lowCount} product(s) have low stock.`;
    }

    updateStockWarning();
}

renderStock();

window.addEventListener("storage", function(event) {
    if (event.key === STOCK_KEY) {
        renderStock();
    }
});

window.addEventListener("focus", renderStock);
