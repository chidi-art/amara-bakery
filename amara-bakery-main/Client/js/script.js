const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");

userButton.addEventListener("click", () => {
  userDropdown.classList.toggle("show");
});

document.addEventListener("click", (event) => {
  if (
    !userButton.contains(event.target) &&
    !userDropdown.contains(event.target)
  ) {
    userDropdown.classList.remove("show");
  }
});
