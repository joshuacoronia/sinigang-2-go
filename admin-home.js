const adminUser = JSON.parse(
    localStorage.getItem("posCurrentUser") || "null"
);

if (!adminUser || adminUser.role !== "admin") {
    window.location.replace("login.html");
} else {
    document.getElementById("adminName").textContent =
        "Admin: " + adminUser.name;
}

const addProductDialog = document.getElementById("addProductDialog");
const addProductForm = document.getElementById("addProductForm");
const productNameInput = document.getElementById("productName");
const productPriceInput = document.getElementById("productPrice");
const productError = document.getElementById("productError");
const productModalTitle = document.getElementById("productModalTitle");

let selectedCategory = "menu";

renderProductCards(true);


document.addEventListener("click", function(event) {
    
const removeProductDialog = document.getElementById("removeProductDialog");
let productToRemove = null;

document.addEventListener("click", function(event) {
    const removeButton = event.target.closest(".remove-product-button");

    if (!removeButton) return;

    productToRemove = removeButton.dataset.name;
    removeProductDialog.showModal();
});

function closeRemoveDialog() {
    removeProductDialog.close();
    productToRemove = null;
}

document.getElementById("cancelRemove")
    .addEventListener("click", closeRemoveDialog);

document.getElementById("cancelRemoveX")
    .addEventListener("click", closeRemoveDialog);

removeProductDialog.addEventListener("click", function(event) {
    if (event.target === removeProductDialog) {
        closeRemoveDialog();
    }
});

document.getElementById("confirmRemove")
    .addEventListener("click", function() {
        if (!productToRemove) return;

        const name = productToRemove;

        const products = getProducts().filter(function(product) {
            return product.name !== name;
        });

        saveProducts(products);

        const stock = getInventory();
        delete stock[name];
        saveInventory(stock);

        const cart = JSON.parse(localStorage.getItem("posCart")) || {};
        delete cart[name];
        localStorage.setItem("posCart", JSON.stringify(cart));

        closeRemoveDialog();
        renderProductCards(true);

        if (typeof updateStockWarning === "function") {
            updateStockWarning();
        }
    });


    const products = getProducts().filter(function(product) {
        return product.name !== productName;
    });

    saveProducts(products);

    const stock = getInventory();
    delete stock[productName];
    saveInventory(stock);

    const cart = JSON.parse(localStorage.getItem("posCart")) || {};
    delete cart[productName];
    localStorage.setItem("posCart", JSON.stringify(cart));

    renderProductCards(true);

    if (typeof updateStockWarning === "function") {
        updateStockWarning();
    }
});


document.addEventListener("click", function(event) {
    const addButton = event.target.closest(".add-product-trigger");

    if (!addButton) return;

    selectedCategory = addButton.dataset.category;

    productModalTitle.textContent =
        selectedCategory === "menu" ? "Add Menu Product" : "Add Add-On";

    addProductForm.reset();
    productError.textContent = "";

    addProductDialog.showModal();
    productNameInput.focus();
});

document.getElementById("closeProductModal")
    .addEventListener("click", function() {
        addProductDialog.close();
    });

addProductDialog.addEventListener("click", function(event) {
    if (event.target === addProductDialog) {
        addProductDialog.close();
    }
});

addProductForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);

    productError.textContent = "";

    if (!name) {
        productError.textContent = "Please enter a product name.";
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        productError.textContent = "Please enter a valid price.";
        return;
    }

    const products = getProducts();

    const duplicate = products.some(function(product) {
        return product.name.toLowerCase() === name.toLowerCase();
    });

    if (duplicate) {
        productError.textContent =
            "A product with this name already exists.";
        return;
    }

    const newProduct = {
        name: name,
        price: price,
        category: selectedCategory
    };

    products.push(newProduct);
    saveProducts(products);

    const stock = getInventory();
    stock[name] = 10;
    saveInventory(stock);

    renderProductCards(true);

    addProductDialog.close();
    addProductForm.reset();
});

document.getElementById("logoutButton")
    .addEventListener("click", function() {
        document.getElementById("logoutDialog").showModal();
    });

document.getElementById("cancelLogout")
    .addEventListener("click", function() {
        document.getElementById("logoutDialog").close();
    });

document.getElementById("cancelLogoutX")
    .addEventListener("click", function() {
        document.getElementById("logoutDialog").close();
    });

document.getElementById("confirmLogout")
    .addEventListener("click", function() {
        localStorage.removeItem("posCurrentUser");
        window.location.replace("login.html");
    });

window.addEventListener("storage", function(event) {
    if (event.key === PRODUCT_KEY) {
        renderProductCards(true);
    }
});
