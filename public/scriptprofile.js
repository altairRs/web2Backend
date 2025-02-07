document.addEventListener("DOMContentLoaded", async () => {
    const twoFAForm = document.getElementById("2fa-form");
    const toggle2FAButton = document.getElementById("toggle2FA");
    const securitySection = document.getElementById("security-question-section");
    const twoFAStatus = document.getElementById("twoFAStatus");

    try {
        const response = await fetch("/api/user/profile", { credentials: "include" });

        if (!response.ok) {
            const errorText = await response.text(); // Read error response
            throw new Error(`Failed to fetch profile: ${errorText}`);
        }

        const user = await response.json();

        if (twoFAStatus) {
            twoFAStatus.innerText = user.is2FAEnabled
                ? "✅ Two-Factor Authentication is ENABLED"
                : "❌ Two-Factor Authentication is DISABLED";
        }

        if (toggle2FAButton) {
            toggle2FAButton.innerText = user.is2FAEnabled ? "Disable 2FA" : "Enable 2FA";
            securitySection.style.display = user.is2FAEnabled ? "none" : "block";

            toggle2FAButton.addEventListener("click", async () => {
                try {
                    if (user.is2FAEnabled) {
                        await update2FA(false);
                    } else {
                        securitySection.style.display = "block"; // Show security question form
                    }
                } catch (error) {
                    console.error("Error updating 2FA:", error);
                    alert(error.message);
                }
            });
        }

        if (twoFAForm) {
            twoFAForm.addEventListener("submit", async (event) => {
                event.preventDefault();
                await enable2FA();
            });
        }

    } catch (error) {
        console.error("Error loading profile:", error);
    }
});

/** Function to enable 2FA */
async function enable2FA() {
    const securityQuestion = document.getElementById("security-question").value;
    const securityAnswer = document.getElementById("security-answer").value;

    try {
        const response = await fetch("/enable-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ securityQuestion, securityAnswer }),
            credentials: "include",
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to enable 2FA");

        alert("✅ 2FA enabled successfully!");
        location.reload();
    } catch (error) {
        console.error("Error enabling 2FA:", error);
        alert(error.message);
    }
}

/** Function to disable 2FA */
async function update2FA(isEnabled) {
    try {
        const response = await fetch("/update-2fa", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is2FAEnabled: isEnabled }),
            credentials: "include",
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Failed to update 2FA");

        alert(isEnabled ? "✅ 2FA enabled successfully!" : "❌ 2FA disabled successfully!");
        location.reload();
    } catch (error) {
        console.error("Error updating 2FA:", error);
        alert(error.message);
    }
}




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
        console.log("Raw Response from Server:", textResponse);

        // Try parsing JSON only if it's valid
        try {
            const user = JSON.parse(textResponse);
            if (response.ok) {
                document.getElementById("profile-img").src = user.profilePicture || "profile-placeholder.png";
            } else {
                console.error("Error fetching profile:", user.message);
            }
        } catch (jsonError) {
            console.error("Failed to parse JSON. Server returned HTML instead:", jsonError);
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
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
}



