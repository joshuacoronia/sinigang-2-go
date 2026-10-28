const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const checkoutButton = document.getElementById("checkoutButton");

const orderDialog = document.getElementById("orderDialog");
const paymentDialog = document.getElementById("paymentDialog");
const successDialog = document.getElementById("successDialog");

const orderSummary = document.getElementById("orderSummary");
const orderTotal = document.getElementById("orderTotal");
const paymentTotal = document.getElementById("paymentTotal");

const amountPaid = document.getElementById("amountPaid");
const paymentError = document.getElementById("paymentError");

let currentTotal = 0;

function formatMoney(amount) {
    return amount.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}

function getCart() {
    return JSON.parse(localStorage.getItem("posCart")) || {};
}

function saveCart(cart) {
    localStorage.setItem("posCart", JSON.stringify(cart));
}


function getSalesRecords() {
    try {
        const records = JSON.parse(
            localStorage.getItem("posSalesRecords")
        );

        return Array.isArray(records) ? records : [];
    } catch (error) {
        return [];
    }
}

function getLoggedInStaffName() {
    const currentUser = localStorage.getItem("posCurrentUser");

    if (!currentUser) return "Unknown staff";

    try {
        const user = JSON.parse(currentUser);

        if (typeof user === "string") {
            return user;
        }

        return user.username || user.name || user.staffName || "Unknown staff";
    } catch (error) {
        
        return currentUser;
    }
}


function recordCompletedTransaction(cart, total) {
    const records = getSalesRecords();

    const lastNumber = records.reduce(function(max, record) {
        return Math.max(
            max,
            Number(record.transactionNumber) || 0
        );
    }, 0);

    const purchasedItems = Object.entries(cart).map(
        function([name, item]) {
            return {
                name: name,
                price: Number(item.price),
                quantity: Number(item.quantity)
            };
        }
    );

    let activeShift = null;

    try {
        activeShift = JSON.parse(
            localStorage.getItem("posActiveShift") || "null"
        );
    } catch (error) {
        activeShift = null;
    }

    const transaction = {
        transactionNumber: lastNumber + 1,
        items: purchasedItems,
        total: Number(total.toFixed(2)),
        date: new Date().toISOString(),
        staff: activeShift?.staff || getLoggedInStaffName(),
        shiftId: activeShift?.id || null
    };

    records.push(transaction);

    localStorage.setItem(
        "posSalesRecords",
        JSON.stringify(records)
    );
}

function calculateTotal(cart) {
    return Object.values(cart).reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0);
}


function renderCart() {
    const cart = getCart();

    cartItems.replaceChildren();

    const products = Object.entries(cart);

    if (products.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cart";
        emptyMessage.textContent = "No products added yet.";
        cartItems.appendChild(emptyMessage);
    }

    products.forEach(function([name, item]) {

        const row = document.createElement("div");
        row.className = "cart-row";

        const info = document.createElement("div");
        info.className = "product-info";

        const title = document.createElement("h3");
        title.textContent = name;

        const unitPrice = document.createElement("p");
        unitPrice.textContent = formatMoney(item.price) + " each";

        info.append(title, unitPrice);

        const right = document.createElement("div");
        right.className = "cart-right";

        const quantity = document.createElement("span");
        quantity.className = "quantity";
        quantity.textContent = item.quantity + "x";

        const subtotal = document.createElement("span");
        subtotal.className = "item-subtotal";
        subtotal.textContent = formatMoney(
            item.price * item.quantity
        );

        const minusButton = document.createElement("button");
        minusButton.type = "button";
        minusButton.className = "remove-button";
        minusButton.textContent = "−";
        minusButton.setAttribute(
            "aria-label",
            "Remove one " + name
        );

        minusButton.addEventListener("click", function() {
            const updatedCart = getCart();

            if (!updatedCart[name]) return;

            updatedCart[name].quantity -= 1;

            if (updatedCart[name].quantity <= 0) {
                delete updatedCart[name];
            }

            saveCart(updatedCart);
            renderCart();
        });

        right.append(minusButton, quantity, subtotal);
        row.append(info, right);
        cartItems.appendChild(row);
    });

    currentTotal = calculateTotal(cart);
    cartTotal.textContent = formatMoney(currentTotal);
}

function renderOrderSummary() {
    const cart = getCart();

    orderSummary.replaceChildren();

    Object.entries(cart).forEach(function([name, item]) {

        const row = document.createElement("div");
        row.className = "summary-row";

        const product = document.createElement("span");
        product.textContent =
            name + " (" + item.quantity + "x)";

        const price = document.createElement("span");
        price.textContent = formatMoney(
            item.price * item.quantity
        );

        row.append(product, price);
        orderSummary.appendChild(row);
    });

    currentTotal = calculateTotal(cart);

    orderTotal.textContent = formatMoney(currentTotal);
    paymentTotal.textContent = formatMoney(currentTotal);
}

checkoutButton.addEventListener("click", function() {

    const cart = getCart();

    if (Object.keys(cart).length === 0) {
        alert("Please add products before checking out.");
        return;
    }

    renderOrderSummary();
    orderDialog.showModal();
});

document.getElementById("cancelOrder")
    .addEventListener("click", function() {
        orderDialog.close();
    });


document.getElementById("confirmOrder")
    .addEventListener("click", function() {

        if (Object.keys(getCart()).length === 0) {
            orderDialog.close();
            renderCart();
            return;
        }

        renderOrderSummary();
        orderDialog.close();

        amountPaid.value = "";
        paymentError.textContent = "";

        paymentDialog.showModal();
        amountPaid.focus();
    });

document.querySelectorAll("[data-close]").forEach(function(button) {

    button.addEventListener("click", function() {
        const dialogId = button.dataset.close;
        document.getElementById(dialogId).close();
    });

});

document.getElementById("cancelPayment")
    .addEventListener("click", function() {
        paymentDialog.close();
    });

function processPayment() {
    const payment = Number(amountPaid.value);

    if (
        amountPaid.value.trim() === "" ||
        !Number.isFinite(payment) ||
        payment < 0 ||
        Math.round(payment * 100) < Math.round(currentTotal * 100)
    ) {
        paymentError.textContent =
            "Insufficient payment. Please input amount again.";
        amountPaid.focus();
        return;
    }

    const cart = getCart();

    if (Object.keys(cart).length === 0) {
        paymentError.textContent = "Your cart is empty.";
        return;
    }

    if (!hasEnoughStock(cart)) {
        paymentError.textContent =
            "Insufficient stock. Please update the order.";
        return;
    }

    deductInventory(cart);

    recordCompletedTransaction(cart, currentTotal);

    paymentError.textContent = "";

    const change = Math.round(
        (payment - currentTotal) * 100
    ) / 100;

    document.getElementById("successTotal").textContent =
        formatMoney(currentTotal);

    document.getElementById("successPaid").textContent =
        formatMoney(payment);

    document.getElementById("successChange").textContent =
        formatMoney(change);

    paymentDialog.close();
    successDialog.showModal();
}

document.getElementById("confirmPayment")
    .addEventListener("click", processPayment);

amountPaid.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        processPayment();
    }

    const cart = JSON.parse(localStorage.getItem("posCart")) || {};

if (!hasEnoughStock(cart)) {
    paymentError.textContent = "Insufficient stock. Please update the order.";
    return;
}

});

document.getElementById("finishTransaction")
    .addEventListener("click", function() {

        successDialog.close();

        saveCart({});
        renderCart();

        currentTotal = 0;
    });

window.addEventListener("storage", function(event) {
    if (event.key === "posCart") {
        renderCart();
    }
});

window.addEventListener("focus", function() {
    renderCart();
});

renderCart();
