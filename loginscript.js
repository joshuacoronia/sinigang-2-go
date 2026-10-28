const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document
        .getElementById("username")
        .value.trim()
        .toLowerCase();

    const password = document.getElementById("password").value;

    const defaultAccounts = [
        {
            username: "staff",
            password: "12345",
            name: "staff",
            role: "staff"
        },
        {
            username: "admin",
            password: "admin123",
            name: "admin",
            role: "admin"
        }
    ];

    // Read accounts created through the Account page.
    let savedAccounts = [];

    try {
        const storedAccounts = JSON.parse(
            localStorage.getItem("posAccounts") || "[]"
        );

        if (Array.isArray(storedAccounts)) {
            savedAccounts = storedAccounts;
        }
    } catch (error) {
        console.error("Could not read saved accounts:", error);
    }

    const allAccounts = [
        ...defaultAccounts,
        ...savedAccounts
    ];

    const matchedAccount = allAccounts.find(function (account) {
        return (
            String(account.username).toLowerCase() === username &&
            account.password === password
        );
    });

    if (matchedAccount) {
        const user = {
            username: matchedAccount.username,
            name: matchedAccount.name,
            role: matchedAccount.role
        };

        localStorage.setItem(
            "posCurrentUser",
            JSON.stringify(user)
        );

        if (user.role === "admin") {
            // Admins do not inherit a staff shift.
            localStorage.removeItem("posShiftStatus");
            localStorage.removeItem("posActiveShift");

            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } else {
        errorMessage.textContent =
            "Incorrect username or password. Please try again.";

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
    }
});