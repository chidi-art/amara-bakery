document.addEventListener("DOMContentLoaded", () => {
  const form =
    document.getElementById("loginForm") ||
    document.getElementById("signupForm");
  const validationMessage = document.getElementById("validationMessage");

  if (!form || !validationMessage) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validationMessage.textContent = "";
    validationMessage.style.color = "#f88f22";

    const inputs = Array.from(form.querySelectorAll("input"));
    const emptyField = inputs.find((input) => !input.value.trim());

    if (emptyField) {
      const fieldName = emptyField.placeholder || "field";
      validationMessage.textContent = `Please enter your ${fieldName.toLowerCase()}.`;
      emptyField.focus();
      return;
    }

    const emailInput = form.querySelector('input[type="email"]');
    const emailIsValid =
      emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());

    if (!emailIsValid) {
      validationMessage.textContent = "Please enter a valid email address.";
      emailInput.focus();
      return;
    }

    const passwordInput = form.querySelector('input[type="password"]');
    if (passwordInput && passwordInput.value.trim().length < 6) {
      validationMessage.textContent =
        "Password must be at least 6 characters long.";
      passwordInput.focus();
      return;
    }

    const userName =
      form.id === "signupForm"
        ? form.querySelector("#signupName")?.value.trim() || "Bakery Customer"
        : "Bakery Customer";

    const user = {
      name: userName,
      email: emailInput.value.trim(),
    };

    localStorage.setItem("bakeryUser", JSON.stringify(user));
    validationMessage.style.color = "#2b2b2b";
    validationMessage.textContent =
      form.id === "signupForm"
        ? "Account created. Redirecting…"
        : "Login successful. Redirecting…";

    setTimeout(() => {
      window.location.href = "Home.html";
    }, 500);
  });
});
