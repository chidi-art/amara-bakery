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
      <a href="#" class="user-links delete-account">Delete Account</a>
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

    const deleteAccountLink = userDropdown.querySelector(".delete-account");
    if (deleteAccountLink) {
      deleteAccountLink.addEventListener("click", async (event) => {
        event.preventDefault();
        if (!window.confirm("Delete your account permanently?")) return;

        try {
          await fetchJson("/users/me", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("bakeryToken")}`,
            },
          });
          localStorage.removeItem("bakeryToken");
          localStorage.removeItem("bakeryUser");
          window.location.href = "Home.html";
        } catch (error) {
          window.alert(error.message || "Unable to delete account.");
        }
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
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );

async function loadReviews() {
  const container = document.getElementById("review-container");
  if (!container) return;
  try {
    const { reviews } = await fetchJson("/reviews");
    const reviewSection = document.getElementById("review");
    if (reviewSection) reviewSection.hidden = reviews.length === 0;
    container.innerHTML = reviews
      .map(
        (review) =>
          `<div class="review-box"><div class="review-txt"><p>${escapeHtml(review.comment)}</p><span>${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div><div class="reviewer"><div class="reviewer-avatar"></div><p>${escapeHtml(`${review.user?.firstName || ""} ${review.user?.lastName || ""}`.trim() || "Customer")}</p></div></div>`,
      )
      .join("");
  } catch (error) {
    const reviewSection = document.getElementById("review");
    if (reviewSection) reviewSection.hidden = true;
    container.innerHTML = "";
  }
}

function setupReviewForm() {
  const form = document.getElementById("review-form");
  if (!form) return;
  const nameInput = document.getElementById("name");
  if (nameInput && storedUser) nameInput.value = storedUser.name || "";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("review-message");
    if (!localStorage.getItem("bakeryToken")) {
      message.textContent = "Please log in before leaving a review.";
      return;
    }
    try {
      await fetchJson("/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("bakeryToken")}`,
        },
        body: JSON.stringify({
          rating: Number(document.getElementById("rating").value),
          comment: document.getElementById("comment").value.trim(),
        }),
      });
      form.reset();
      if (nameInput && storedUser) nameInput.value = storedUser.name || "";
      message.textContent = "Thank you. Your review is awaiting approval.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.getElementById("contact-message");
    try {
      await fetchJson("/messages", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          subject: form.subject.value.trim(),
          message: form.message.value.trim(),
        }),
      });
      form.reset();
      message.textContent = "Message sent successfully.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
}
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
function updateCategoryVisibility() {
  document
    .querySelectorAll(".category-links button[data-category]")
    .forEach((button) => {
      const category = button.dataset.category.toLowerCase();
      const hasProducts = products.some(
        (product) => product.category?.name?.toLowerCase() === category,
      );
      const categoryItem = button.closest("li");
      if (categoryItem) categoryItem.hidden = !hasProducts;
    });
}
window.MenuOptions = MenuOptions;
window.Category = Category;

async function loadProducts() {
  try {
    const result = await fetchJson("/products?limit=100");
    products = result.products;
    updateCategoryVisibility();
    if (menuOptions) renderProducts(products);
    document.querySelectorAll(".home-menu-list").forEach((section) => {
      const category = section.id.replace("-menu-home", "").replace("-", "");
      const container = section.querySelector(".menu-container");
      const categoryProducts = products.filter(
        (product) => product.category?.name?.toLowerCase() === category,
      );
      section.hidden = categoryProducts.length === 0;
      if (container) renderProducts(categoryProducts.slice(0, 4), container);
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
let carouselSlides = [
  { image: "Images/carosel_images/herone.png", alt: "Bakery selection" },
  { image: "Images/carosel_images/first__.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download0.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download1.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download2.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download3.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download4.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download5.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download6.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download7.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download8.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download9.jpeg", alt: "Bakery selection" },
  { image: "Images/carosel_images/download10.jpeg", alt: "Bakery selection" },
];
const defaultCarouselImages = [
  "herone.png",
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
    track.innerHTML = `<img src="${carouselSlides[carouselIndex].image}" class="img1" alt="${carouselSlides[carouselIndex].alt || "Bakery selection"}">`;
}
function carousel_left() {
  carouselIndex =
    (carouselIndex + carouselSlides.length - 1) % carouselSlides.length;
  Carousel2();
}
function carousel_right() {
  carouselIndex = (carouselIndex + 1) % carouselSlides.length;
  Carousel2();
}
window.carousel_left = carousel_left;
window.carousel_right = carousel_right;
Carousel2();
setInterval(carousel_right, 10000);

async function loadCarouselSlides() {
  if (!track) return;
  try {
    const response = await fetch(`${API_BASE}/carousel`);
    const body = await response.json();
    if (response.ok && body.slides?.length) {
      carouselSlides = body.slides.map((slide) => ({
        image:
          /^https?:\/\//i.test(slide.image) || slide.image.startsWith("/")
            ? slide.image
            : `./${slide.image}`,
        alt: slide.alt || "Bakery selection",
      }));
      carouselIndex = 0;
      Carousel2();
    }
  } catch (error) {
    carouselSlides = defaultCarouselImages.map((image) => ({
      image: `Images/carosel_images/${image}`,
      alt: "Bakery selection",
    }));
  }
}
loadCarouselSlides();
loadReviews();
setupReviewForm();
setupContactForm();

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
updateCartCount();
renderCart();
updateCartTotals();
loadProducts();
