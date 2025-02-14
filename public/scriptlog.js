document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // Redirect to the URL specified in the response
            window.location.href = data.redirect;
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/auth/check", { credentials: "include" });
        const data = await response.json();

        if (data.authenticated) {
            window.location.href = "/home.html"; // Redirect to home if already logged in
        }
    } catch (error) {
        console.error("Error checking authentication:", error);
    }
});

if (window.location.pathname.endsWith(".html")) {
    window.history.replaceState(null, "", window.location.pathname.replace(".html", ""));
}
