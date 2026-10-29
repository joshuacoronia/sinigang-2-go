const endShiftButton = document.getElementById("endShiftButton");
const endshiftDialog = document.getElementById("endshiftDialog");

const cancelEndShift = document.getElementById("cancelEndShift");
const cancelShiftButton = document.getElementById("cancelShiftButton");
const confirmEndShift = document.getElementById("confirmEndShift");

const shiftEndedDialog = document.getElementById("shiftEndedDialog");
const closeShiftSummary = document.getElementById("closeShiftSummary");
const confirmShiftSummary = document.getElementById("confirmShiftSummary");

const historyButton = document.getElementById("historyButton");
const historyDialog = document.getElementById("historyDialog");
const historyList = document.getElementById("historyList");
const closeHistoryX = document.getElementById("closeHistoryX");
const closeHistoryButton = document.getElementById("closeHistoryButton");

const salesItems = document.getElementById("salesItems");

function formatMoney(amount) {
    return Number(amount || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
    });
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

function renderSalesRecords() {
    if (!salesItems) return;

    salesItems.replaceChildren();

    const allRecords = getSalesRecords();

    const salesTotal = document.getElementById("salesTotal");
    if (salesTotal) {
        const grandTotal = allRecords.reduce(function(sum, record) {
            return sum + Number(record.total || 0);
        }, 0);

        salesTotal.textContent = formatMoney(grandTotal);
    }

    const records = [...allRecords].sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    if (records.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-sales";
        emptyMessage.textContent = "No completed transactions yet.";
        salesItems.appendChild(emptyMessage);
        return;
    }

    records.forEach(function(record) {
        const card = document.createElement("div");
        card.className = "transaction-card";

        const left = document.createElement("div");
        left.className = "transaction-left";

        const number = document.createElement("h3");
        number.className = "transaction-number";
        number.textContent = "Transaction #" + record.transactionNumber;

        const products = document.createElement("p");
        products.className = "transaction-products";
        products.textContent = (record.items || []).map(function(item) {
            return item.name + " (" + item.quantity + "x)";
        }).join(", ");

        left.append(number, products);

        const right = document.createElement("div");
        right.className = "transaction-right";

        const date = document.createElement("p");
        date.className = "transaction-date";

        const parsedDate = new Date(record.date);
        date.textContent = Number.isNaN(parsedDate.getTime())
            ? "Date unavailable"
            : parsedDate.toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            });

        const total = document.createElement("p");
        total.className = "transaction-total";
        total.textContent = formatMoney(record.total);

        right.append(date, total);
        card.append(left, right);
        salesItems.appendChild(card);
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Unavailable";

    return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatShiftDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Unavailable";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function showShiftSummary(shift, transactions) {
    document.getElementById("summaryShiftDate").textContent =
        formatShiftDate(shift.startTime);

    document.getElementById("summaryShiftStaff").textContent =
        shift.staff || "Unknown staff";

    document.getElementById("summaryShiftStart").textContent =
        formatDateTime(shift.startTime);

    document.getElementById("summaryShiftEnd").textContent =
        formatDateTime(shift.endTime);

    const transactionList =
        document.getElementById("shiftTransactionList");

    transactionList.replaceChildren();

    transactions.forEach(function(transaction) {
        const row = document.createElement("div");
        row.className = "shift-transaction-row";

        const details = document.createElement("div");
        details.className = "shift-transaction-details";

        const title = document.createElement("strong");
        title.textContent =
            "Transaction #" + transaction.transactionNumber;

        const products = document.createElement("p");
        products.textContent = (transaction.items || []).map(function(item) {
            return item.name + " (" + item.quantity + "x)";
        }).join(", ");

        details.append(title, products);

        const amount = document.createElement("strong");
        amount.className = "shift-transaction-amount";
        amount.textContent = formatMoney(transaction.total);

        row.append(details, amount);
        transactionList.appendChild(row);
    });

    if (transactions.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No completed transactions during this shift.";
        empty.className = "empty-sales";
        transactionList.appendChild(empty);
    }

    const total = transactions.reduce(function(sum, transaction) {
        return sum + Number(transaction.total || 0);
    }, 0);

    document.getElementById("summaryShiftTotal").textContent =
        formatMoney(total);

    shiftEndedDialog.showModal();
}

endShiftButton.addEventListener("click", function() {
    endshiftDialog.showModal();
});

cancelEndShift.addEventListener("click", function() {
    endshiftDialog.close();
});

cancelShiftButton.addEventListener("click", function() {
    endshiftDialog.close();
});


function getShiftHistory() {
    try {
        const history = JSON.parse(
            localStorage.getItem("posShiftHistory") || "[]"
        );

        return Array.isArray(history) ? history : [];
    } catch (error) {
        return [];
    }
}

function renderShiftHistory() {
    historyList.replaceChildren();

    const history = getShiftHistory().sort(function(a, b) {
        return new Date(b.startTime) - new Date(a.startTime);
    });

    if (history.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-sales";
        empty.textContent = "No completed shifts in history yet.";
        historyList.appendChild(empty);
        return;
    }

    history.forEach(function(shift) {
        const card = document.createElement("article");
        card.className = "history-card";

        if (shift.removedAt) {
    card.classList.add("removed-shift");

    const notice = document.createElement("div");
    notice.className = "removed-shift-notice";
    notice.textContent = "This shift was removed by the admin.";

    card.appendChild(notice);
    }

        const date = document.createElement("h3");
        date.className = "history-date";
        date.textContent = formatShiftDate(shift.startTime);
        card.appendChild(date);

        const overview = document.createElement("div");
        overview.className = "history-overview";

        const left = document.createElement("div");
        left.className = "history-details";

        const staff = document.createElement("p");
        staff.className = "history-staff";
        staff.textContent = "Staff: " + (shift.staff || "Unknown staff");

        const times = document.createElement("div");
        times.className = "history-times";

        const timeIn = document.createElement("div");
        timeIn.className = "history-time-box";

        const timeInLabel = document.createElement("span");
        timeInLabel.textContent = "Time-in";

        const timeInValue = document.createElement("strong");
        timeInValue.textContent = formatDateTime(shift.startTime);

        timeIn.append(timeInLabel, timeInValue);

        const timeOut = document.createElement("div");
        timeOut.className = "history-time-box";

        const timeOutLabel = document.createElement("span");
        timeOutLabel.textContent = "Time-out";

        const timeOutValue = document.createElement("strong");
        timeOutValue.textContent = formatDateTime(shift.endTime);

        timeOut.append(timeOutLabel, timeOutValue);
        times.append(timeIn, timeOut);
        left.append(staff, times);

        const right = document.createElement("div");
        right.className = "history-total";

        const totalLabel = document.createElement("span");
        totalLabel.textContent = "Total sales";

        const totalValue = document.createElement("strong");
        totalValue.textContent = formatMoney(shift.total);

        right.append(totalLabel, totalValue);
        overview.append(left, right);
        card.appendChild(overview);

        const transactionDetails = document.createElement("details");
        transactionDetails.className = "history-transactions";

        const summary = document.createElement("summary");
        const transactions = Array.isArray(shift.transactions)
            ? shift.transactions
            : [];

        summary.textContent =
            "View transactions (" + transactions.length + ")";

        transactionDetails.appendChild(summary);

        const transactionList = document.createElement("div");
        transactionList.className = "history-transaction-list";

        if (transactions.length === 0) {
            const emptyTransactions = document.createElement("p");
            emptyTransactions.textContent =
                "No completed transactions recorded for this shift.";
            transactionList.appendChild(emptyTransactions);
        }

        transactions.forEach(function(transaction) {
            const row = document.createElement("div");
            row.className = "history-transaction-row";

            const details = document.createElement("div");
            details.className = "history-transaction-details";

            const number = document.createElement("strong");
            number.textContent =
                "Transaction #" + transaction.transactionNumber;

            const products = document.createElement("p");
            products.textContent = (transaction.items || []).map(
                function(item) {
                    return item.name + " (" + item.quantity + "x)";
                }
            ).join(", ");

            details.append(number, products);

            const amount = document.createElement("strong");
            amount.className = "history-transaction-amount";
            amount.textContent = formatMoney(transaction.total);

            row.append(details, amount);
            transactionList.appendChild(row);
        });

        transactionDetails.appendChild(transactionList);
        card.appendChild(transactionDetails);
        historyList.appendChild(card);
    });
}

function openSalesHistory() {
    renderShiftHistory();
    historyDialog.showModal();
}

function closeSalesHistory() {
    if (historyDialog.open) {
        historyDialog.close();
    }
}

historyButton.addEventListener("click", openSalesHistory);
closeHistoryX.addEventListener("click", closeSalesHistory);
closeHistoryButton.addEventListener("click", closeSalesHistory);


confirmEndShift.addEventListener("click", function() {
    let activeShift = null;

    try {
        activeShift = JSON.parse(
            localStorage.getItem("posActiveShift") || "null"
        );
    } catch (error) {
        activeShift = null;
    }

    if (!activeShift || activeShift.status !== "active") {
        endshiftDialog.close();
        alert("No active shift was found. Please return to the Home page.");
        window.location.replace("index.html");
        return;
    }

    activeShift.endTime = new Date().toISOString();
    activeShift.status = "ended";

    const transactions = getSalesRecords().filter(function(record) {
        return record.shiftId === activeShift.id;
    });

    const shiftTotal = transactions.reduce(function(sum, transaction) {
        return sum + Number(transaction.total || 0);
    }, 0);

    const shiftHistory = getShiftHistory();

    shiftHistory.push({
        ...activeShift,
        transactions: transactions,
        total: shiftTotal
    });

    localStorage.setItem(
        "posShiftHistory",
        JSON.stringify(shiftHistory)
    );

    localStorage.setItem(
        "posActiveShift",
        JSON.stringify(activeShift)
    );

    localStorage.setItem("posShiftStatus", "ended");

    localStorage.setItem("posSalesRecords", JSON.stringify([]));

    renderSalesRecords();

    endshiftDialog.close();

    showShiftSummary(activeShift, transactions);
});


function closeSummaryAndReturnHome() {
    if (shiftEndedDialog.open) {
        shiftEndedDialog.close();
    }

    // Home displays the Start Shift screen because the shift has ended.
    window.location.replace("index.html");
}

closeShiftSummary.addEventListener(
    "click",
    closeSummaryAndReturnHome
);

confirmShiftSummary.addEventListener(
    "click",
    closeSummaryAndReturnHome
);

window.addEventListener("storage", function(event) {
    if (event.key === "posSalesRecords") {
        renderSalesRecords();
    }
});

renderSalesRecords();
