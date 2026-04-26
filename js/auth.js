(function() {
    const isLoginPage = window.location.pathname.includes('login.html');
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

    if (!isLoggedIn && !isLoginPage) {
        // Redirect to login if not logged in and not on login page
        window.location.href = 'login.html';
    }

    if (isLoggedIn && isLoginPage) {
        // Redirect to dashboard if already logged in and on login page
        window.location.href = 'index.html';
    }
})();

// Logout helper
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'login.html';
}
