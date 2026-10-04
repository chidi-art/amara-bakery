const API_BASE = window.API_BASE || "https://amara-backend-9mht.onrender.com/api";
const message = document.getElementById("validationMessage");
const params = new URLSearchParams(window.location.search);

const showMessage = (text, error = false) => {
  message.textContent = text;
  message.style.color = error ? "#bd3d2e" : "#2b2b2b";
};

const forgotForm = document.getElementById("forgotPasswordForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) return showMessage("Please enter your email address.", true);
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message || "Unable to send reset link");
      showMessage(body.message);
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}

const resetForm = document.getElementById("resetPasswordForm");
if (resetForm) {
  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password.length < 6)
      return showMessage("Password must be at least 6 characters long.", true);
    if (password !== confirmPassword)
      return showMessage("Passwords do not match.", true);
    if (!params.get("token"))
      return showMessage("This reset link is invalid or expired.", true);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.get("token"), password }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.message || "Unable to reset password");
      showMessage(body.message);
      resetForm.reset();
    } catch (error) {
      showMessage(error.message, true);
    }
  });
}
