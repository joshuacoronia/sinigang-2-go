(function () {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const savedUser = localStorage.getItem("posCurrentUser");

    if (!savedUser) {
        window.location.replace("login.html");
        return;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        localStorage.removeItem("posCurrentUser");
        window.location.replace("login.html");
        return;
    }

    if (!user || !user.name) {
        localStorage.removeItem("posCurrentUser");
        window.location.replace("login.html");
        return;
    }

    const role = String(user.role || "staff").toLowerCase();

    if (role === "admin") {
        if (
            currentPage !== "admin.html" &&
            currentPage !== "admin-stock.html" &&
            currentPage !== "admin-sales.html"
        ) {
            window.location.replace("admin.html");
            return;
        }

        const adminName = document.getElementById("staffName");

        if (adminName) {
            adminName.textContent = "Admin: " + user.name;
        }

        return;
    }

    if (
        currentPage === "admin.html" ||
        currentPage === "admin-stock.html" ||
        currentPage === "admin-sales.html"
    ) {
        window.location.replace("index.html");
        return;
    }

    const staffName = document.getElementById("staffName");
    const navbar =
        document.getElementById("navbar") ||
        document.querySelector(".navbar");

    const shiftGate = document.getElementById("shiftGate");
    const mainContent =
        document.getElementById("mainContent") ||
        document.querySelector(".main-content");

    const startShiftButton =
        document.getElementById("startShiftButton");

    if (staffName) {
        staffName.textContent = "Staff: " + user.name;
    }

    const isHomePage =
        currentPage === "index.html" ||
        currentPage === "home.html" ||
        currentPage === "admin-sales.html";

    if (!isHomePage) {
        if (localStorage.getItem("posShiftStatus") !== "active") {
            window.location.replace("index.html");
        }
        return;
    }

    function showShiftScreen() {
        if (shiftGate) shiftGate.classList.remove("hidden");
        if (navbar) navbar.classList.add("hidden");
        if (mainContent) mainContent.classList.add("hidden");
    }

    function showPOS() {
        if (shiftGate) shiftGate.classList.add("hidden");
        if (navbar) navbar.classList.remove("hidden");
        if (mainContent) mainContent.classList.remove("hidden");
    }

    function updateScreen() {
        if (localStorage.getItem("posShiftStatus") === "active") {
            showPOS();
        } else {
            showShiftScreen();
        }
    }

    updateScreen();

    if (startShiftButton) {
        startShiftButton.addEventListener("click", function (event) {
            event.preventDefault();

            if (localStorage.getItem("posShiftStatus") === "active") {
                showPOS();
                return;
            }

            const newShift = {
                id: "shift-" + Date.now(),
                staff: user.name,
                startTime: new Date().toISOString(),
                endTime: null,
                status: "active"
            };

            localStorage.setItem(
                "posActiveShift",
                JSON.stringify(newShift)
            );

            localStorage.setItem("posShiftStatus", "active");

            updateScreen();
        });
    }
})();
