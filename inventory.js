const STOCK_KEY = "posStock";
const LOW_STOCK_THRESHOLD = 5;

const DEFAULT_STOCK = {
    "Sinigang na Salmon Head": 10,
    "Sinigang na Hipon": 10,
    "Sinigang na Ulo/Panga": 10,
    "Sinigang na Beef w/ watermelon": 10,
    "Sinigang na Pampano": 10,
    "Sinigang na Liempo": 10,
    "Patis na Chili Mansi": 10
};

function getInventory() {
    let savedStock = {};

    try {
        savedStock = JSON.parse(
            localStorage.getItem(STOCK_KEY) || "{}"
        );

        if (
            !savedStock ||
            typeof savedStock !== "object" ||
            Array.isArray(savedStock)
        ) {
            savedStock = {};
        }
    } catch (error) {
        savedStock = {};
    }

    const stock = {
        ...DEFAULT_STOCK,
        ...savedStock
    };

    const savedProducts = localStorage.getItem("posProducts");

    if (savedProducts !== null) {
        try {
            const products = JSON.parse(savedProducts);

            if (Array.isArray(products)) {
                const synchronizedStock = {};

                products.forEach(function(product) {
                    if (!product || !product.name) return;

                    const name = product.name;

                    if (name.toLowerCase() === "rice") {
                        return;
                    }

                    synchronizedStock[name] =
                        Object.prototype.hasOwnProperty.call(stock, name)
                            ? Math.max(0, Number(stock[name]) || 0)
                            : 10;
                });

                saveInventory(synchronizedStock);
                return synchronizedStock;
            }
        } catch (error) {
        }
    }

    saveInventory(stock);
    return stock;
}

function saveInventory(stock) {
    localStorage.setItem(STOCK_KEY, JSON.stringify(stock));
}

function hasEnoughStock(cart) {
    const stock = getInventory();

    return Object.entries(cart).every(function([name, item]) {
        if (!(name in stock)) return true;

        return Number(item.quantity) <= Number(stock[name]);
    });
}

function deductInventory(cart) {
    const stock = getInventory();

    Object.entries(cart).forEach(function([name, item]) {
        if (name in stock) {
            stock[name] = Math.max(
                0,
                Number(stock[name]) - Number(item.quantity)
            );
        }
    });

    saveInventory(stock);
    updateStockWarning();
}

function updateStockWarning() {
    const stock = getInventory();

    const hasLowStock = Object.values(stock).some(function(quantity) {
        return Number(quantity) <= LOW_STOCK_THRESHOLD;
    });

    document.querySelectorAll(".stock-link, .stocks-link").forEach(
        function(link) {
            let warning = link.querySelector(".stock-warning");

            if (hasLowStock && !warning) {
                warning = document.createElement("span");
                warning.className = "stock-warning";
                warning.textContent = " !";
                warning.setAttribute(
                    "aria-label",
                    "Low stock warning"
                );

                link.appendChild(warning);
            } else if (!hasLowStock && warning) {
                warning.remove();
            }
        }
    );
}
