const API_BASE = window.API_BASE || "http://localhost:5000/api";
const cart = JSON.parse(localStorage.getItem("cart") || "[]");
const cartBox = document.querySelector(".product-box");
const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");

const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

revealElements.forEach((element) => {
  observer.observe(element);
});

if (userButton && userDropdown) {
  userButton.addEventListener("click", (event) => {
    event.stopPropagation();
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
}

const storedUser = JSON.parse(localStorage.getItem("bakeryUser") || "null");

if (userDropdown) {
  if (storedUser) {
    userDropdown.innerHTML = `
      <div class="user-info">
        <strong id="user-name">${storedUser.name}</strong>
        <p id="user-email">${storedUser.email}</p>
      </div>
      <hr />
      <a href="#" class="user-links">Account Settings</a>
      <a href="#" class="user-links">Orders</a>
      <a href="#" class="logout">Log Out</a>
    `;

    const logoutLink = userDropdown.querySelector(".logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("bakeryUser");
        window.location.href = "Home.html";
      });
    }
  } else {
    userDropdown.innerHTML = `
      <div class="user-info">
        <strong id="user-name">Guest</strong>
        <p id="user-email">Log in to continue</p>
      </div>
      <hr />
      <a href="login.html" class="user-links">Log In</a>
      <a href="signup.html" class="user-links">Create Account</a>
    `;
  }
}

const taxBox = document.getElementById("tax");
const totalBox = document.getElementById("total");
const subTotalBox = document.getElementById("subtotal");
const cartLink = document.querySelector(".cart-link");
const menuOptions = document.getElementById("menu_container");
const track = document.getElementById("imageTrack");
let products = [];

const fetchJson = async (path, options) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body;
};
const productImage = (product) =>
  product.image || "Images/products/IMG_0979.JPG";
const money = (value) => `${Number(value).toFixed(2).replace(/\.00$/, "")} kr`;

function productCard(product) {
  return `<div class="menu-box"><div class="menu-box-div" data-product-id="${product._id}" onclick="if (!event.target.closest('.menu-add-to-cart')) location.href='Product details.html?product=${product._id}'"><div class="menu-box-img"><img src="./${productImage(product)}" alt="${product.name}"></div><div class="menu-box-txt"><span class="menu-box-name">${product.name}</span><span class="menu-box-price">${money(product.price)}</span></div><button class="menu-add-to-cart" type="button" data-product-id="${product._id}">Add to Cart</button></div></div>`;
}
function renderProducts(list, container = menuOptions) {
  if (container)
    container.innerHTML =
      list.map(productCard).join("") || "<p>No products available.</p>";
}
function setMenuHeader(button) {
  const header = document.querySelector(".menu-header");
  if (header && button) header.textContent = button.textContent.trim();
}
function MenuOptions(button) {
  setMenuHeader(button);
  renderProducts(products);
}
function Category(button) {
  setMenuHeader(button);
  const category = button.dataset.category;
  renderProducts(
    products.filter(
      (product) => product.category?.name?.toLowerCase() === category,
    ),
  );
}
window.MenuOptions = MenuOptions;
window.Category = Category;

async function loadProducts() {
  try {
    const result = await fetchJson("/products?limit=100");
    products = result.products;
    if (menuOptions) renderProducts(products);
    document.querySelectorAll(".home-menu-list").forEach((section) => {
      const category = section.id.replace("-menu-home", "").replace("-", "");
      const container = section.querySelector(".menu-container");
      if (container)
        renderProducts(
          products
            .filter(
              (product) => product.category?.name?.toLowerCase() === category,
            )
            .slice(0, 4),
          container,
        );
    });
    await initializeProductDetails();
  } catch (error) {
    if (menuOptions)
      menuOptions.innerHTML = `<p role="alert">${error.message}. Start the backend and run the seed command.</p>`;
  }
}
async function initializeProductDetails() {
  const details = document.querySelector(".product-body");
  const productId = new URLSearchParams(location.search).get("product");
  if (!details || !productId) return;
  try {
    const { product } = await fetchJson(`/products/${productId}`);
    details.querySelector(".product-img").src = `./${productImage(product)}`;
    details.querySelector(".product-img").alt = product.name;
    details.querySelector(".product-name").textContent = product.name;
    details.querySelector(".product-desc").textContent =
      product.description || "Freshly baked to order.";
    details.querySelector(".product-price").textContent = money(product.price);
    details.querySelector(".add-to-cart").dataset.productId = product._id;
    details.querySelector(".product-qty input").value =
      cart.find((item) => item.product === product._id)?.quantity || 0;
    document.title = product.name;
  } catch (error) {
    details.querySelector(".product-name").textContent = error.message;
  }
}

let carouselIndex = 0;
const carouselImages = [
  "first__.jpeg",
  "download0.jpeg",
  "download1.jpeg",
  "download2.jpeg",
  "download3.jpeg",
  "download4.jpeg",
  "download5.jpeg",
  "download6.jpeg",
  "download7.jpeg",
  "download8.jpeg",
  "download9.jpeg",
  "download10.jpeg",
];
function Carousel2() {
  if (track)
    track.innerHTML = `<img src="Images/carosel_images/${carouselImages[carouselIndex]}" class="img1" alt="Bakery selection">`;
}
function carousel_left() {
  carouselIndex =
    (carouselIndex + carouselImages.length - 1) % carouselImages.length;
  Carousel2();
}
function carousel_right() {
  carouselIndex = (carouselIndex + 1) % carouselImages.length;
  Carousel2();
}
window.carousel_left = carousel_left;
window.carousel_right = carousel_right;
Carousel2();
setInterval(carousel_right, 10000);

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  if (cartLink) cartLink.textContent = `Cart (${count})`;
  const checkoutLink = document.querySelector(
    '.checkout-btn[href="checkout.html"]',
  );
  if (checkoutLink) checkoutLink.classList.toggle("disabled", count === 0);
}
function addToCart(button) {
  const product = products.find(
    (item) => item._id === button.dataset.productId,
  );
  if (!product) return;
  const quantity = Math.max(
    1,
    Math.min(
      10,
      Number(button.closest(".product-body")?.querySelector("input")?.value) ||
        1,
    ),
  );
  const existing = cart.find((item) => item.product === product._id);
  if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
  else
    cart.push({
      product: product._id,
      name: product.name,
      price: product.price,
      image: productImage(product),
      quantity,
    });
  saveCart();
  button.textContent = "Added";
  setTimeout(() => {
    button.textContent = "Add to Cart";
  }, 1000);
}
function updateCartTotals() {
  if (!subTotalBox) return;
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  subTotalBox.textContent = money(subtotal);
  taxBox.textContent = money(subtotal * 0.75);
  totalBox.textContent = money(subtotal * 1.75);
}
function renderCart() {
  if (!cartBox) return;
  cartBox.innerHTML =
    cart
      .map(
        (item) =>
          `<div class="cart-box-container"><div class="cart-box-product"><img src="./${item.image}" alt="${item.name}"><p>${item.name}</p></div><div class="cart-btns"><div class="cart-price">${money(item.price * item.quantity)}</div><div class="cart-qty"><button class="qty-btn minus-btn" data-product-id="${item.product}">-</button><input class="numinput" type="number" value="${item.quantity}" readonly><button class="qty-btn plus-btn" data-product-id="${item.product}">+</button></div></div></div>`,
      )
      .join("") || "<p>Your cart is empty.</p>";
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".menu-add-to-cart, .add-to-cart");
  if (addButton) {
    event.preventDefault();
    addToCart(addButton);
    return;
  }
  const quantityButton = event.target.closest(
    ".cart-qty .qty-btn, .product-qty .qty-btn",
  );
  if (quantityButton) {
    const productDetails = quantityButton.closest(".product-body");
    if (productDetails) {
      const input = productDetails.querySelector(".product-qty input");
      const productId =
        productDetails.querySelector(".add-to-cart")?.dataset.productId;
      const currentQuantity = Number(input.value) || 0;
      const quantity = Math.max(
        0,
        Math.min(
          10,
          currentQuantity +
            (quantityButton.classList.contains("plus-btn") ? 1 : -1),
        ),
      );
      input.value = quantity;
      const item = cart.find((entry) => entry.product === productId);
      if (item) {
        if (quantity === 0) cart.splice(cart.indexOf(item), 1);
        else item.quantity = quantity;
        saveCart();
      }
      return;
    }
    const item = cart.find(
      (entry) => entry.product === quantityButton.dataset.productId,
    );
    if (!item) return;
    item.quantity += quantityButton.classList.contains("plus-btn") ? 1 : -1;
    if (item.quantity < 1) cart.splice(cart.indexOf(item), 1);
    else item.quantity = Math.min(item.quantity, 10);
    saveCart();
    renderCart();
    updateCartTotals();
  }
  if (
    userButton &&
    userDropdown &&
    !userButton.contains(event.target) &&
    !userDropdown.contains(event.target)
  )
    userDropdown.classList.remove("show");
});
if (userButton && userDropdown)
  userButton.addEventListener("click", () =>
    userDropdown.classList.toggle("show"),
  );
updateCartCount();
renderCart();
updateCartTotals();
loadProducts();
