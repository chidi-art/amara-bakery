const API_BASE = window.API_BASE || "https://amara-bakery-2.onrender.com/api";
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
      <a href="order-history.html" class="user-links">Orders</a>
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
        headers: { "Content-Type": "application/json" },
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
const productImage = (product) => {
  const image = product.image || "Images/products/IMG_0979.JPG";
  return /^https?:\/\//i.test(image) || image.startsWith("/")
    ? image
    : `./${image}`;
};
const money = (value) => `${Number(value).toFixed(2).replace(/\.00$/, "")} kr`;

function calculateCartPricing(items = cart) {
  const cookieUnits = { classic: [], signature: [] };
  let subtotal = 0;

  items.forEach((item) => {
    const product = products.find((entry) => entry._id === item.product);
    const type = item.cookieType || product?.cookieType;
    if (type && Object.hasOwn(cookieUnits, type)) {
      for (let count = 0; count < item.quantity; count += 1) {
        cookieUnits[type].push(Number(item.price) || 0);
      }
    } else {
      subtotal += (Number(item.price) || 0) * item.quantity;
    }
  });

  const bundleSummary = [];
  for (const [type, bundlePrice] of Object.entries({
    classic: 50,
    signature: 55,
  })) {
    const prices = cookieUnits[type].sort((left, right) => right - left);
    const bundleCount = Math.floor(prices.length / 3);
    subtotal +=
      bundleCount * bundlePrice +
      prices.slice(bundleCount * 3).reduce((sum, price) => sum + price, 0);
    if (bundleCount) {
      bundleSummary.push(
        `${bundleCount} ${type} bundle${bundleCount === 1 ? "" : "s"} (3 each): ${money(bundleCount * bundlePrice)}`,
      );
    }
  }
  return { subtotal, bundleSummary: bundleSummary.join(" · ") };
}
window.calculateCartPricing = calculateCartPricing;

function productCard(product) {
  const displayPrice = product.breadOptions?.length
    ? `From ${money(product.price)}`
    : money(product.price);
  return `<div class="menu-box"><div class="menu-box-div" data-product-id="${product._id}" onclick="if (!event.target.closest('.menu-add-to-cart')) location.href='Product details.html?product=${product._id}'"><div class="menu-box-img"><img src="${productImage(product)}" alt="${product.name}"></div><div class="menu-box-txt"><span class="menu-box-name">${product.name}</span><span class="menu-box-price">${displayPrice}</span></div><button class="menu-add-to-cart" type="button" data-product-id="${product._id}">Add to Cart</button></div></div>`;
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
function productMatchesCategory(product, category) {
  const productCategory = product.category?.name?.toLowerCase();
  if (category === "special") {
    return product.isSpecial || productCategory === "special";
  }
  return productCategory === category;
}
function MenuOptions(button) {
  setMenuHeader(button);
  renderProducts(products);
}
function Category(button) {
  setMenuHeader(button);
  const category = button.dataset.category;
  renderProducts(
    products.filter((product) => productMatchesCategory(product, category)),
  );
}
function updateCategoryVisibility() {
  document
    .querySelectorAll(".category-links button[data-category]")
    .forEach((button) => {
      const category = button.dataset.category.toLowerCase();
      const hasProducts = products.some((product) =>
        productMatchesCategory(product, category),
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
    let cartChanged = false;
    cart.forEach((item) => {
      const product = products.find((entry) => entry._id === item.product);
      const cookieType =
        product?.category?.name?.toLowerCase() === "cookie"
          ? product.cookieType
          : undefined;
      if (item.cookieType !== cookieType) {
        if (cookieType) item.cookieType = cookieType;
        else delete item.cookieType;
        cartChanged = true;
      }
    });
    if (cartChanged) saveCart();
    updateCategoryVisibility();
    if (menuOptions) renderProducts(products);
    document.querySelectorAll(".home-menu-list").forEach((section) => {
      const category = section.id.replace("-menu-home", "").replace("-", "");
      const container = section.querySelector(".menu-container");
      const categoryProducts = products.filter((product) =>
        productMatchesCategory(product, category),
      );
      section.hidden = categoryProducts.length === 0;
      if (container) renderProducts(categoryProducts.slice(0, 4), container);
    });
    await initializeProductDetails();
    renderCart();
    updateCartTotals();
    window.dispatchEvent(new Event("cartpricingupdated"));
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
    details.querySelector(".product-img").src = productImage(product);
    details.querySelector(".product-img").alt = product.name;
    details.querySelector(".product-name").textContent = product.name;
    details.querySelector(".product-desc").textContent =
      product.description || "Freshly baked to order.";
    details.querySelector(".product-price").textContent = money(product.price);
    const addButton = details.querySelector(".add-to-cart");
    const optionField = details.querySelector("#bread-option-field");
    const optionSelect = details.querySelector("#bread-option");
    const breadOptions = product.breadOptions || [];
    const isBread = product.category?.name?.toLowerCase() === "bread";
    addButton.dataset.productId = product._id;
    addButton.textContent = "Add to Cart";
    delete addButton.dataset.breadOption;
    delete addButton.dataset.optionsMissing;
    if (isBread) {
      optionField.hidden = false;
      if (!breadOptions.length) {
        optionSelect.innerHTML =
          '<option value="">Sizes not configured</option>';
        optionSelect.disabled = true;
        addButton.dataset.optionsMissing = "true";
        addButton.textContent = "Options not set";
        details.querySelector(".product-price").textContent =
          "Loaf prices not set";
      } else {
        optionSelect.disabled = false;
        optionSelect.innerHTML = breadOptions
          .map(
            (option) =>
              `<option value="${option.key}">${option.label} - ${money(option.price)}</option>`,
          )
          .join("");
        const updateBreadSelection = () => {
          const option = breadOptions.find(
            (item) => item.key === optionSelect.value,
          );
          if (!option) return;
          addButton.dataset.breadOption = option.key;
          details.querySelector(".product-price").textContent = money(
            option.price,
          );
          details.querySelector(".product-qty input").value =
            cart.find(
              (item) =>
                item.product === product._id && item.breadOption === option.key,
            )?.quantity || 0;
        };
        optionSelect.addEventListener("change", updateBreadSelection);
        updateBreadSelection();
      }
    } else {
      optionField.hidden = true;
      optionSelect.disabled = false;
      delete addButton.dataset.breadOption;
      details.querySelector(".product-qty input").value =
        cart.find((item) => item.product === product._id)?.quantity || 0;
    }
    const isCookie = product.category?.name?.toLowerCase() === "cookie";
    details.querySelector("#cookie-bundle-note").hidden = !isCookie;
    document.title = product.name;
  } catch (error) {
    details.querySelector(".product-name").textContent = error.message;
  }
}

let carouselIndex = 0;
let carouselSlides = [];
function Carousel2() {
  if (!track) return;
  if (!carouselSlides.length) {
    track.replaceChildren();
    return;
  }
  track.innerHTML = `<img src="${carouselSlides[carouselIndex].image}" class="img1" alt="${carouselSlides[carouselIndex].alt || "Bakery selection"}">`;
}
function carousel_left() {
  if (!carouselSlides.length) return;
  carouselIndex =
    (carouselIndex + carouselSlides.length - 1) % carouselSlides.length;
  Carousel2();
}
function carousel_right() {
  if (!carouselSlides.length) return;
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
    carouselSlides = response.ok
      ? (body.slides || []).map((slide) => ({
          image:
            /^https?:\/\//i.test(slide.image) || slide.image.startsWith("/")
              ? slide.image
              : `./${slide.image}`,
          alt: slide.alt || "Bakery selection",
        }))
      : [];
  } catch (error) {
    carouselSlides = [];
  }
  carouselIndex = 0;
  Carousel2();
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
  if (button.dataset.optionsMissing) return;
  if (product.breadOptions?.length && !button.dataset.breadOption) {
    window.location.href = `Product details.html?product=${product._id}`;
    return;
  }
  const selectedBreadOption = product.breadOptions?.find(
    (option) => option.key === button.dataset.breadOption,
  );
  const quantity = Math.max(
    1,
    Math.min(
      10,
      Number(button.closest(".product-body")?.querySelector("input")?.value) ||
        1,
    ),
  );
  const existing = cart.find(
    (item) =>
      item.product === product._id &&
      item.breadOption === selectedBreadOption?.key,
  );
  if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
  else
    cart.push({
      product: product._id,
      name: selectedBreadOption
        ? `${product.name} (${selectedBreadOption.label})`
        : product.name,
      price: selectedBreadOption?.price ?? product.price,
      image: productImage(product),
      quantity,
      ...(product.cookieType ? { cookieType: product.cookieType } : {}),
      ...(selectedBreadOption ? { breadOption: selectedBreadOption.key } : {}),
    });
  saveCart();
  button.textContent = "Added";
  setTimeout(() => {
    button.textContent = "Add to Cart";
  }, 1000);
}
function updateCartTotals() {
  if (!subTotalBox) return;
  const { subtotal, bundleSummary } = calculateCartPricing();
  subTotalBox.textContent = money(subtotal);
  totalBox.textContent = money(subtotal);
  const bundleRow = document.getElementById("cookie-bundle-summary");
  if (bundleRow) {
    bundleRow.hidden = !bundleSummary;
    bundleRow.querySelector("span:last-child").textContent = bundleSummary;
  }
}
function renderCart() {
  if (!cartBox) return;
  if (!cart.length) {
    cartBox.innerHTML = `
      <div class="empty-cart-state">
        <img src="./Images/emptycart.png" alt="Empty cart illustration" />
        <p>Your cart is empty.</p>
      </div>
    `;
    return;
  }

  cartBox.innerHTML = cart
    .map(
      (item) =>
        `<div class="cart-box-container"><a class="cart-box-product" href="Product details.html?product=${item.product}"><img src="${productImage(item)}" alt="${item.name}"><p>${item.name}</p></a><div class="cart-btns"><div class="cart-price">${money(item.price * item.quantity)}</div><div class="cart-qty"><button class="qty-btn minus-btn" data-product-id="${item.product}" data-bread-option="${item.breadOption || ""}">-</button><input class="numinput" type="number" value="${item.quantity}" readonly><button class="qty-btn plus-btn" data-product-id="${item.product}" data-bread-option="${item.breadOption || ""}">+</button></div></div></div>`,
    )
    .join("");
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
      const breadOption =
        productDetails.querySelector(".add-to-cart")?.dataset.breadOption ||
        undefined;
      const item = cart.find(
        (entry) =>
          entry.product === productId && entry.breadOption === breadOption,
      );
      if (item) {
        if (quantity === 0) cart.splice(cart.indexOf(item), 1);
        else item.quantity = quantity;
        saveCart();
      }
      return;
    }
    const breadOption = quantityButton.dataset.breadOption || undefined;
    const item = cart.find(
      (entry) =>
        entry.product === quantityButton.dataset.productId &&
        entry.breadOption === breadOption,
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
