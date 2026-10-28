const PRODUCT_KEY = "posProducts";

const DEFAULT_PRODUCTS = [
    { name: "Sinigang na Salmon Head", price: 399, category: "menu" },
    { name: "Sinigang na Hipon", price: 350, category: "menu" },
    { name: "Sinigang na Ulo/Panga", price: 399, category: "menu" },
    { name: "Sinigang na Beef w/ watermelon", price: 399, category: "menu" },
    { name: "Sinigang na Pampano", price: 450, category: "menu" },
    { name: "Sinigang na Liempo", price: 350, category: "menu" },
    { name: "Rice", price: 15, category: "addons" },
    { name: "Patis na Chili Mansi", price: 100, category: "addons" }
];

function getProducts() {
    const saved = localStorage.getItem(PRODUCT_KEY);

    if (saved === null) {
        localStorage.setItem(
            PRODUCT_KEY,
            JSON.stringify(DEFAULT_PRODUCTS)
        );

        return DEFAULT_PRODUCTS.map(product => ({ ...product }));
    }

    try {
        const products = JSON.parse(saved);

        if (!Array.isArray(products)) {
            throw new Error("Invalid product list");
        }

        return products;
    } catch (error) {
        localStorage.setItem(
            PRODUCT_KEY,
            JSON.stringify(DEFAULT_PRODUCTS)
        );

        return DEFAULT_PRODUCTS.map(product => ({ ...product }));
    }
}

function saveProducts(products) {
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(products));
}

function createProductCard(product, isAdmin) {
    const card = document.createElement("div");
    card.className = "menu-card";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = "₱" + Number(product.price).toLocaleString("en-PH");

    card.append(name, price);

    if (!isAdmin) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "add-button";
        button.dataset.name = product.name;
        button.dataset.price = product.price;
        button.textContent = "+ Add";

        card.appendChild(button);
    } else {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-product-button";
        removeButton.dataset.name = product.name;
        removeButton.textContent = "Remove";

        card.appendChild(removeButton);
    }

    return card;
}

function renderProductCards(isAdmin) {
    const menuGrid = document.getElementById("menuGrid");
    const addonsGrid = document.getElementById("addonsGrid");

    if (!menuGrid || !addonsGrid) return;

    menuGrid.replaceChildren();
    addonsGrid.replaceChildren();

    const products = getProducts();

    products.forEach(function(product) {
        const card = createProductCard(product, isAdmin);

        if (product.category === "addons") {
            addonsGrid.appendChild(card);
        } else {
            menuGrid.appendChild(card);
        }
    });

    if (isAdmin) {
        menuGrid.appendChild(createAddProductCard("menu"));
        addonsGrid.appendChild(createAddProductCard("addons"));
    }
}

function createAddProductCard(category) {
    const card = document.createElement("div");
    card.className = "menu-card add-product-card";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "add-product-trigger";
    button.dataset.category = category;
    button.setAttribute(
        "aria-label",
        category === "menu" ? "Add menu product" : "Add add-on"
    );

    const plus = document.createElement("span");
    plus.className = "add-product-plus";
    plus.textContent = "+";

    const label = document.createElement("span");
    label.textContent = "Add";

    button.append(plus, label);
    card.appendChild(button);

    return card;
}
