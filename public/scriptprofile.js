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
