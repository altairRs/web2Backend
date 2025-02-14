document.addEventListener("DOMContentLoaded", async () => {
    const enable2FAButton = document.getElementById("toggle2FA");
    const disable2FAButton = document.getElementById("disabling2FA");
    const twoFAStatus = document.getElementById("twoFAStatus");

    // Fetch current 2FA status
    async function fetch2FAStatus() {
        try {
            const response = await fetch("/api/user/profile", { credentials: "include" });
            const user = await response.json();

            if (!response.ok) throw new Error(user.message || "Failed to fetch 2FA status");

            update2FAUI(user.is2FAEnabled);
        } catch (error) {
            console.error("Error fetching 2FA status:", error);
        }
    }

    // Update UI based on 2FA status
    function update2FAUI(is2FAEnabled) {
        twoFAStatus.innerText = is2FAEnabled
            ? "✅ Two-Factor Authentication is ENABLED"
            : "❌ Two-Factor Authentication is DISABLED";

        enable2FAButton.style.display = is2FAEnabled ? "none" : "inline-block";
        disable2FAButton.style.display = is2FAEnabled ? "inline-block" : "none";
    }

    // Enable 2FA
    enable2FAButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/enable-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to enable 2FA");

            alert("✅ 2FA has been enabled.");
            location.reload(); // 🔄 Refresh the page to apply changes
        } catch (error) {
            console.error("Error enabling 2FA:", error);
            alert(error.message);
        }
    });

    // Disable 2FA
    disable2FAButton.addEventListener("click", async () => {
        try {
            const response = await fetch("/api/disable-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to disable 2FA");

            alert("❌ 2FA has been disabled.");
            location.reload(); // 🔄 Refresh the page to apply changes
        } catch (error) {
            console.error("Error disabling 2FA:", error);
            alert(error.message);
        }
    });

    await fetch2FAStatus();
});



        


async function fetchUserData() {
    try {
        const response = await fetch('/api/user', { credentials: 'include' }); // Include cookies
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const user = await response.json();

        document.getElementById('username').innerText = user.name;
        document.getElementById('userEmail').innerText = user.email;
        document.getElementById('twoFAStatus').innerText = user.is2FAEnabled ? "Enabled" : "Disabled";

        if (user.github) {
            document.getElementById('githubLink').href = `https://github.com/${user.github}`;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

fetchUserData();

document.getElementById('changePasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch('/api/update-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        alert(data.message);
    } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password: " + error.message);
    }
});


async function uploadProfilePicture() {
    const fileInput = document.getElementById('profile-picture');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file!");
        return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
        const response = await fetch("/api/update-profile-picture", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("profile-img").src = data.imageUrl;
            alert("Profile picture updated successfully!");
        } else {
            alert("Error updating profile picture: " + data.message);
        }
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("An error occurred while uploading.");
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch("/api/get-profile", { credentials: "include" });

        // Read response as text first
        const textResponse = await response.text();


        // Try parsing JSON only if the response is not HTML
        if (textResponse.startsWith("<!DOCTYPE html")) {
            throw new Error("Server returned an HTML page instead of JSON. Check your backend.");
        }

        const user = JSON.parse(textResponse);

        if (response.ok) {
            document.getElementById("profile-img").src = user.profilePicture || "profile-placeholder.png";
        } else {
            console.error("Error fetching profile:", user.message);
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}


// Call function when page loads
document.addEventListener("DOMContentLoaded", fetchUserProfile);


if (window.location.pathname.endsWith(".html")) {
    window.history.replaceState(null, "", window.location.pathname.replace(".html", ""));
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/api/auth/check", { credentials: "include" });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = "/login.html"; // Redirect if not logged in
        }
    } catch (error) {
        console.error("Error checking authentication:", error);
        window.location.href = "/login.html";
    }
});

// Logout (No changes, kept for completeness)
function logout() {
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
        .then(response => response.json())
        .then(data => {
            window.location.href = data.redirect; // Redirect to login
        })
        .catch(error => console.error("Logout failed:", error));
};  




