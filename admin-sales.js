const adminSalesItems = document.getElementById("adminSalesItems");

const removeShiftDialog = document.getElementById("removeShiftDialog");
const cancelRemoveShiftX = document.getElementById("cancelRemoveShiftX");
const cancelRemoveShift = document.getElementById("cancelRemoveShift");
const confirmRemoveShift = document.getElementById("confirmRemoveShift");

let pendingShiftId = null;

const REMOVED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function readStorage(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null ? fallback : value;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
    return readStorage("posCurrentUser", null);
}

function isAdmin() {
    const user = getCurrentUser();
    return Boolean(user && user.role === "admin");
}

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
}

function formatDateTime(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unavailable";
    }

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatShiftDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function getShiftHistory() {
    const history = readStorage("posShiftHistory", []);
    return Array.isArray(history) ? history : [];
}

function getSalesRecords() {
    const records = readStorage("posSalesRecords", []);
    return Array.isArray(records) ? records : [];
}

function getActiveShift() {
    return readStorage("posActiveShift", null);
}

function calculateTotal(transactions) {
    return transactions.reduce(function(sum, transaction) {
        return sum + Number(transaction.total || 0);
    }, 0);
}

function cleanExpiredRemovedShifts() {
    const cutoff = Date.now() - REMOVED_RETENTION_MS;
    const history = getShiftHistory();

    const remaining = history.filter(function(shift) {
        if (!shift.removedAt) {
            return true;
        }

        const removedTime = new Date(shift.removedAt).getTime();


        if (Number.isNaN(removedTime)) {
            return true;
        }

        return removedTime > cutoff;
    });

    if (remaining.length !== history.length) {
        writeStorage("posShiftHistory", remaining);
    }
}

function renderTransaction(transaction) {
    const row = document.createElement("div");
    row.className = "history-transaction-row";

    const details = document.createElement("div");
    details.className = "history-transaction-details";

    const number = document.createElement("strong");
    number.textContent =
        "Transaction #" + (transaction.transactionNumber ?? "—");

    const products = document.createElement("p");
    products.textContent = (transaction.items || []).map(function(item) {
        return item.name + " (" + item.quantity + "x)";
    }).join(", ") || "No product details available.";

    details.append(number, products);

    const amount = document.createElement("strong");
    amount.className = "history-transaction-amount";
    amount.textContent = formatMoney(transaction.total);

    row.append(details, amount);
    return row;
}

function renderShift(shift, fallbackTransactions) {
    const card = document.createElement("article");
    card.className = "history-card admin-shift-card";

    if (shift.removedAt) {
        card.classList.add("removed-shift");
    }

    const date = document.createElement("h3");
    date.className = "history-date";
    date.textContent = formatShiftDate(shift.startTime);
    card.appendChild(date);

    if (shift.removedAt) {
        const notice = document.createElement("div");
        notice.className = "removed-shift-notice";
        notice.textContent = "This shift was removed by the admin.";
        card.appendChild(notice);
    }

    const overview = document.createElement("div");
    overview.className = "history-overview";

    const details = document.createElement("div");
    details.className = "history-details";

    const staff = document.createElement("p");
    staff.className = "history-staff";
    staff.textContent = "Staff: " + (shift.staff || "Unknown staff");

    const times = document.createElement("div");
    times.className = "history-times";

    const startBox = document.createElement("div");
    startBox.className = "history-time-box";

    const startLabel = document.createElement("span");
    startLabel.textContent = "Start";

    const startValue = document.createElement("strong");
    startValue.textContent = formatDateTime(shift.startTime);

    startBox.append(startLabel, startValue);

    const endBox = document.createElement("div");
    endBox.className = "history-time-box";

    const endLabel = document.createElement("span");
    endLabel.textContent = "End";

    const endValue = document.createElement("strong");
    endValue.textContent = shift.endTime
        ? formatDateTime(shift.endTime)
        : "In progress";

    endBox.append(endLabel, endValue);
    times.append(startBox, endBox);
    details.append(staff, times);

    const totalBox = document.createElement("div");
    totalBox.className = "history-total";

    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Shift sales";

    const transactions = Array.isArray(shift.transactions)
        ? shift.transactions
        : fallbackTransactions;

    const totalValue = document.createElement("strong");
    const shiftTotal = shift.total !== undefined && shift.total !== null
        ? Number(shift.total)
        : calculateTotal(transactions);

    totalValue.textContent = formatMoney(shiftTotal);

    totalBox.append(totalLabel, totalValue);
    overview.append(details, totalBox);
    card.appendChild(overview);

    const transactionDetails = document.createElement("details");
    transactionDetails.className = "history-transactions";

    const summary = document.createElement("summary");
    summary.textContent = "View transactions (" + transactions.length + ")";
    transactionDetails.appendChild(summary);

    const transactionList = document.createElement("div");
    transactionList.className = "history-transaction-list";

    if (transactions.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-sales";
        empty.textContent = "No completed transactions recorded for this shift.";
        transactionList.appendChild(empty);
    } else {
        transactions.forEach(function(transaction) {
            transactionList.appendChild(renderTransaction(transaction));
        });
    }

    transactionDetails.appendChild(transactionList);
    card.appendChild(transactionDetails);

    if (shift.status !== "active" && !shift.removedAt && shift.id) {
        const actions = document.createElement("div");
        actions.className = "shift-admin-actions";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-shift-button";
        removeButton.textContent = "Remove shift";

        removeButton.addEventListener("click", function() {
            pendingShiftId = shift.id;
            removeShiftDialog.showModal();
        });

        actions.appendChild(removeButton);
        card.appendChild(actions);
    }

    return card;
}

function renderAdminSales() {
    if (!adminSalesItems) return;

    if (!isAdmin()) {
        window.location.replace("login.html");
        return;
    }

    const user = getCurrentUser();
    const staffName = document.getElementById("staffName");

    if (staffName) {
        staffName.textContent =
            "Admin: " + (user.name || user.username || "admin");
    }

    cleanExpiredRemovedShifts();
    adminSalesItems.replaceChildren();

    const history = getShiftHistory();
    const salesRecords = getSalesRecords();
    const activeShift = getActiveShift();

    const shifts = history.map(function(shift) {
        return { ...shift };
    });

    if (
        activeShift &&
        activeShift.id &&
        activeShift.status === "active" &&
        !shifts.some(function(shift) {
            return shift.id === activeShift.id;
        })
    ) {
        const activeTransactions = salesRecords.filter(function(record) {
            return record.shiftId === activeShift.id;
        });

        shifts.push({
            ...activeShift,
            transactions: activeTransactions,
            total: calculateTotal(activeTransactions),
            status: "active"
        });
    }

    shifts.sort(function(a, b) {
        return new Date(b.startTime || 0) - new Date(a.startTime || 0);
    });

    if (shifts.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-sales";
        empty.textContent = "No staff shifts have been recorded yet.";
        adminSalesItems.appendChild(empty);
        return;
    }

    shifts.forEach(function(shift) {
        const transactions = Array.isArray(shift.transactions)
            ? shift.transactions
            : salesRecords.filter(function(record) {
                return record.shiftId === shift.id;
            });

        adminSalesItems.appendChild(renderShift(shift, transactions));
    });
}

function closeRemoveDialog() {
    if (removeShiftDialog && removeShiftDialog.open) {
        removeShiftDialog.close();
    }

    pendingShiftId = null;
}

function removeSelectedShift() {
    if (!isAdmin()) {
        alert("Only an admin can remove a shift.");
        closeRemoveDialog();
        return;
    }

    if (!pendingShiftId) {
        closeRemoveDialog();
        return;
    }

    const history = getShiftHistory();
    const index = history.findIndex(function(shift) {
        return shift.id === pendingShiftId;
    });

    if (index === -1) {
        closeRemoveDialog();
        renderAdminSales();
        alert("The shift could not be found. Please refresh and try again.");
        return;
    }

    const shift = history[index];

    if (shift.status === "active") {
        closeRemoveDialog();
        alert("An active shift cannot be removed.");
        return;
    }

    if (!shift.removedAt) {
        const user = getCurrentUser();

        history[index] = {
            ...shift,
            removedAt: new Date().toISOString(),
            removedByAdmin: true,
            removedBy: user.name || user.username || "admin"
        };

        writeStorage("posShiftHistory", history);
    }

    closeRemoveDialog();
    renderAdminSales();
}

if (cancelRemoveShiftX) {
    cancelRemoveShiftX.addEventListener("click", closeRemoveDialog);
}

if (cancelRemoveShift) {
    cancelRemoveShift.addEventListener("click", closeRemoveDialog);
}

if (confirmRemoveShift) {
    confirmRemoveShift.addEventListener("click", removeSelectedShift);
}

if (removeShiftDialog) {
    removeShiftDialog.addEventListener("click", function(event) {
        if (event.target === removeShiftDialog) {
            closeRemoveDialog();
        }
    });
}

window.addEventListener("storage", function(event) {
    if (
        event.key === "posShiftHistory" ||
        event.key === "posSalesRecords" ||
        event.key === "posActiveShift" ||
        event.key === "posCurrentUser"
    ) {
        renderAdminSales();
    }
});

window.addEventListener("focus", renderAdminSales);

document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
        renderAdminSales();
    }
});

renderAdminSales();
