/*document.addEventListener("DOMContentLoaded", async () => {
    const twoFAForm = document.getElementById("2fa-form");
    const toggle2FAButton = document.getElementById("toggle2FA");
    const securitySection = document.getElementById("security-question-section");

    try {
        const response = await fetch("/api/user/profile", { credentials: "include" });
        const user = await response.json();

        if (!response.ok) throw new Error(user.message);

        document.getElementById("twoFAStatus").innerText = user.is2FAEnabled ? 
            "✅ Two-Factor Authentication is ENABLED" : 
            "❌ Two-Factor Authentication is DISABLED";

        toggle2FAButton.innerText = user.is2FAEnabled ? "Disable 2FA" : "Enable 2FA";

        if (!user.is2FAEnabled) {
            securitySection.style.display = "block"; // Show security question only when enabling 2FA
        }

        twoFAForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const securityQuestion = document.getElementById("security-question").value;
            const securityAnswer = document.getElementById("security-answer").value;

            const response = await fetch("/verify-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ securityQuestion, securityAnswer }),
            });

            const result = await response.json();
            if (response.ok) {
                alert("2FA enabled successfully!");
                location.reload();
            } else {
                alert(result.message);
            }
        });

    } catch (error) {
        console.error("Error loading profile:", error);
    }
});*/


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
        const user = await response.json();

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





