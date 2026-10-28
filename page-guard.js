(function () {
    const currentPage = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const isHomePage =
        currentPage === "home.html" ||
        currentPage === "index.html" ||
        currentPage === "";

    const isAdminHome = currentPage === "admin.html";
    const isAdminStock = currentPage === "admin-stock.html";
    const isAdminSales = currentPage === "admin-sales.html";
    const isAdminAccount = currentPage === "admin-account.html"
    const isAdminPage = isAdminHome || isAdminStock || isAdminSales || isAdminAccount;

    function redirectTo(page) {
        window.location.replace(page);
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem("posCurrentUser"));
        } catch (error) {
            return null;
        }
    }

    const user = getCurrentUser();

    if (!user || !user.name) {
        localStorage.removeItem("posCurrentUser");
        redirectTo("login.html");
        return;
    }

    const role = String(user.role || "staff").toLowerCase();
    const isAdmin = role === "admin";

    if (isAdmin) {
        if (!isAdminPage) {
            redirectTo("admin.html");
            return;
        }

        const staffName = document.getElementById("staffName");
        if (staffName) {
            staffName.textContent = "Admin: " + user.name;
        }

        return;
    }

    if (isAdminPage) {
        redirectTo("home.html");
        return;
    }

    if (isHomePage) {
        return;
    }

    function checkStaffAccess() {
        const currentUser = getCurrentUser();

        if (!currentUser || !currentUser.name) {
            redirectTo("login.html");
            return;
        }

        if (String(currentUser.role || "staff").toLowerCase() === "admin") {
            redirectTo("admin.html");
            return;
        }

        if (localStorage.getItem("posShiftStatus") !== "active") {
            redirectTo("home.html");
            return;
        }

        const staffName = document.getElementById("staffName");

        if (staffName) {
            staffName.textContent = "Staff: " + currentUser.name;
        }
    }

    checkStaffAccess();

    window.addEventListener("pageshow", checkStaffAccess);

    window.addEventListener("storage", function (event) {
        if (
            event.key === "posShiftStatus" ||
            event.key === "posCurrentUser"
        ) {
            checkStaffAccess();
        }
    });
})();
