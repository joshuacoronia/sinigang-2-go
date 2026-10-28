document.addEventListener("DOMContentLoaded", function () {
    const currentUser = JSON.parse(
        localStorage.getItem("posCurrentUser") || "null"
    );

    if (!currentUser || currentUser.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    const adminName = document.getElementById("adminName");

    if (adminName) {
        adminName.textContent =
            "Admin: " + (currentUser.name || currentUser.username);
    }

    
const accountSuccessDialog = document.getElementById(
    "accountSuccessDialog"
);

const accountSuccessMessage = document.getElementById(
    "accountSuccessMessage"
);

function showAccountSuccess(role) {
    accountSuccessMessage.textContent =
        role === "staff"
            ? "Staff account was successfully created"
            : "Admin account was successfully created";

    accountSuccessDialog.showModal();
}

function closeAccountSuccess() {
    accountSuccessDialog.close();
}

document.getElementById("closeAccountSuccessX")
    .addEventListener("click", closeAccountSuccess);

document.getElementById("confirmAccountSuccess")
    .addEventListener("click", closeAccountSuccess);


    const defaultUsernames = ["staff", "admin"];

    function readAccounts() {
        try {
            const accounts = JSON.parse(
                localStorage.getItem("posAccounts") || "[]"
            );

            if (!Array.isArray(accounts)) {
                throw new Error("Saved accounts must be an array.");
            }

            return accounts;
        } catch (error) {
            console.error("Unable to read accounts:", error);
            return null;
        }
    }

    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = "account-message " + type;
    }

    function createAccount(options) {
        const {
            form,
            nameInput,
            usernameInput,
            passwordInput,
            confirmInput,
            messageElement,
            role
        } = options;

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            messageElement.textContent = "";
            messageElement.className = "account-message";

            const name = nameInput.value.trim();
            const username = usernameInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmInput.value;

            if (!name || !username || !password || !confirmPassword) {
                showMessage(
                    messageElement,
                    "Please complete all fields.",
                    "error"
                );
                return;
            }

            if (!/^[a-z0-9._-]+$/.test(username)) {
                showMessage(
                    messageElement,
                    "Use only letters, numbers, periods, underscores, or hyphens in the username.",
                    "error"
                );
                return;
            }

            if (password.length < 5) {
                showMessage(
                    messageElement,
                    "The password must contain at least 5 characters.",
                    "error"
                );
                return;
            }

            if (password !== confirmPassword) {
                showMessage(
                    messageElement,
                    "The passwords do not match.",
                    "error"
                );
                confirmInput.focus();
                return;
            }

            const accounts = readAccounts();

            if (accounts === null) {
                showMessage(
                    messageElement,
                    "Unable to read saved accounts. No account was created.",
                    "error"
                );
                return;
            }

            const usernameExists =
                defaultUsernames.includes(username) ||
                accounts.some(function (account) {
                    return (
                        typeof account.username === "string" &&
                        account.username.toLowerCase() === username
                    );
                });

            if (usernameExists) {
                showMessage(
                    messageElement,
                    "That username already exists. Please choose another.",
                    "error"
                );
                usernameInput.focus();
                return;
            }

            const newAccount = {
                name: name,
                username: username,
                password: password,
                role: role,
                createdAt: new Date().toISOString(),
                createdBy: currentUser.username
            };

            accounts.push(newAccount);

            try {
                localStorage.setItem(
                    "posAccounts",
                    JSON.stringify(accounts)
                );

                showMessage(
                    messageElement,
                    role === "staff"
                        ? "Staff account created successfully!"
                        : "Admin account created successfully!",
                    "success"
                );

                form.reset();
            } catch (error) {
                console.error("Unable to save account:", error);

                showAccountSuccess(role);(
                    messageElement,
                    "The account could not be saved. Check browser storage.",
                    "error"
                );
            }
        });
    }

    createAccount({
        form: document.getElementById("staffAccountForm"),
        nameInput: document.getElementById("staffFullName"),
        usernameInput: document.getElementById("staffUsername"),
        passwordInput: document.getElementById("staffPassword"),
        confirmInput: document.getElementById("staffConfirmPassword"),
        messageElement: document.getElementById("staffAccountMessage"),
        role: "staff"
    });

    createAccount({
        form: document.getElementById("adminAccountForm"),
        nameInput: document.getElementById("newAdminFullName"),
        usernameInput: document.getElementById("newAdminUsername"),
        passwordInput: document.getElementById("newAdminPassword"),
        confirmInput: document.getElementById("newAdminConfirmPassword"),
        messageElement: document.getElementById("adminAccountMessage"),
        role: "admin"
    });
});
