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

    const apiBase = window.API_BASE || "http://localhost:5000/api";
    const request = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
    };
    if (form.id === "signupForm") {
      request.name = form.querySelector("#signupName")?.value.trim();
    }

    validationMessage.style.color = "#2b2b2b";
    validationMessage.textContent = "Checking your details...";
    fetch(
      `${apiBase}/auth/${form.id === "signupForm" ? "register" : "login"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
    )
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || "Unable to continue");
        return body;
      })
      .then((body) => {
        localStorage.setItem("bakeryToken", body.token);
        localStorage.setItem(
          "bakeryUser",
          JSON.stringify({
            ...body.user,
            name: `${body.user.firstName || ""} ${body.user.lastName || ""}`.trim(),
          }),
        );
        validationMessage.textContent =
          form.id === "signupForm"
            ? "Account created. Redirecting..."
            : "Login successful. Redirecting...";
        setTimeout(() => {
          window.location.href =
            body.user.role === "admin" ? "admin.html" : "Home.html";
        }, 500);
      })
      .catch((error) => {
        validationMessage.style.color = "#bd3d2e";
        validationMessage.textContent = error.message;
      });
  });
});
