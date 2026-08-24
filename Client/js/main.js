const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const addToCartBtns = document.querySelectorAll(".menu-add-to-cart");
const cartBox = document.querySelector(".product-box");
const taxBox = document.getElementById("tax");
const totalBox = document.getElementById("total");
const subTotalBox = document.getElementById("subtotal");
const cartLink = document.querySelector(".cart-link");
const checkoutTotalBox = document.getElementById("checkout-total");

updateCartCount();
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

addToCartBtns.forEach((button) => {
  button.addEventListener("click", () => {
    //event.preventDefault();
    const product = {
      name: button.dataset.name,
      price: Number(button.dataset.price),
      quantity: 1,
    };

    const existingProduct = cart.find((item) => item.name === product.name);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push(product);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log(product);
    updateCartCount();
  });
});

if (cartBox) {
  renderCart();
  updateCartTotals();
  setQtyBtns();
}

function updateCartCount() {
  const cartCount = cart.reduce((total, product) => {
    return total + product.quantity;
  }, 0);

  cartLink.textContent = `Cart (${cartCount})`;
}

function updateCartTotals() {
  let subTotal = 0;
  const taxRate = 0.75;
  cart.forEach((product) => {
    subTotal += product.price * product.quantity;
    console.log(product);
  });

  let tax = taxRate * subTotal;
  let total = subTotal + tax;
  subTotalBox.textContent = `${subTotal} kr`;
  taxBox.textContent = `${tax} kr`;
  totalBox.textContent = `${total} kr`;
  console.log(subTotal);
}

function renderCart() {
  if (!cartBox) return;
  cartBox.innerHTML = "";
  cart.forEach((product) => {
    cartBox.innerHTML += `
<div class="cart-box-container">
    <div class="cart-box-product">
    <p>${product.name}</p>
    </div>
    <div class="cart-btns">
    <div class="cart-price">${product.price * product.quantity} kr</div>
    <div class="cart-qty">
                  <button class="qty-btn minus-btn" data-name="${product.name}">−</button>
                  <input
                  data-name="${product.name}"
                    class="numinput"
                    type="number"
                    value="${product.quantity}"
                    min="1"
                    max="10"
                    readonly
                  />
                  <button class="qty-btn plus-btn" data-name="${product.name}">+</button>
    </div>
                </div>
                </div>`;
  });
}

function setQtyBtns() {
  const increaseBtns = document.querySelectorAll(".qty-btn.plus-btn");
  const decreaseBtns = document.querySelectorAll(".qty-btn.minus-btn");

  increaseBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.dataset.name;
      const product = cart.find((item) => item.name === productName);
      if (!product) return;
      if (product.quantity < 10) {
        product.quantity++;

        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        updateCartTotals();
        updateCartCount();
        setQtyBtns();
      }
    });
  });
  decreaseBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.dataset.name;
      const product = cart.find((item) => item.name === productName);
      if (!product) return;
      if (product.quantity > 1) {
        product.quantity--;

        localStorage.setItem("cart", JSON.stringify(cart));
      } else {
        const productIndex = cart.findIndex(
          (item) => item.name === productName,
        );
        cart.splice(productIndex, 1);
      }
      renderCart();
      setQtyBtns();
      updateCartTotals();
      updateCartCount();
    });
  });
}
