document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logoutButton");
    const logoutDialog = document.getElementById("logoutDialog");
    const cancelLogoutX = document.getElementById("cancelLogoutX");
    const cancelLogout = document.getElementById("cancelLogout");
    const confirmLogout = document.getElementById("confirmLogout");

    if (logoutButton && logoutDialog) {
        logoutButton.addEventListener("click", () => {
            logoutDialog.showModal();
        });
    }

    if (cancelLogoutX && logoutDialog) {
        cancelLogoutX.addEventListener("click", () => {
            logoutDialog.close();
        });
    }

    if (cancelLogout && logoutDialog) {
        cancelLogout.addEventListener("click", () => {
            logoutDialog.close();
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener("click", () => {

            localStorage.removeItem("posCurrentUser");

            window.location.replace("login.html");
        });
    }
});


function checkLoginSession() {
    const currentUser = localStorage.getItem("posCurrentUser");

    if (!currentUser) {
        window.location.replace("login.html");
        return false;
    }

    return true;
}

checkLoginSession();

window.addEventListener("pageshow", () => {
    checkLoginSession();
});