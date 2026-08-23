const minusBtn = document.querySelector(".qty-btn.minus-btn");
const plusBtn = document.querySelector(".qty-btn.plus-btn");
const outputBox = document.querySelectorAll(".numinput");

plusBtn.addEventListener("click", () => {
  if (Number(outputBox.value) < 10) {
    outputBox.value = Number(outputBox.value) + 1;
  }
});

minusBtn.addEventListener("click", () => {
  if (Number(outputBox.value) > 0) {
    outputBox.value = Number(outputBox.value) - 1;
  }
});
