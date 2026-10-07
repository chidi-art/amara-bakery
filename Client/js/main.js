const API_BASE = window.API_BASE || "https://amara-backend-9mht.onrender.com/api";
const cart = JSON.parse(localStorage.getItem("cart") || "[]");
const cartBox = document.querySelector(".product-box");
const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("bakeryToken") || ""}`,
});

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
        <strong id="user-name">${escapeHtml(storedUser.name)}</strong>
        <p id="user-email">${escapeHtml(storedUser.email)}</p>
      </div>
      <hr />
      <a href="order-history.html" class="user-links">Orders</a>
      ${
        storedUser.role === "admin"
          ? '<a href="admin.html" class="user-links">Admin page</a>'
          : ""
      }
      <button type="button" class="user-links account-settings">Settings</button>
      <a href="#" class="logout">Log Out</a>
    `;

    const logoutLink = userDropdown.querySelector(".logout");
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("bakeryUser");
        localStorage.removeItem("bakeryToken");
        window.location.href = "index.html";
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

if (storedUser && userDropdown) {
  const settingsButton = userDropdown.querySelector(".account-settings");
  const settingsOverlay = document.createElement("div");
  settingsOverlay.className = "account-overlay";
  settingsOverlay.hidden = true;
  settingsOverlay.innerHTML = `
    <div class="account-backdrop" data-close-settings></div>
    <aside class="account-panel" role="dialog" aria-modal="true" aria-labelledby="account-settings-title" tabindex="-1">
      <header class="account-panel-header">
        <div><p class="account-panel-eyebrow">Your account</p><h2 id="account-settings-title">Settings</h2></div>
        <button type="button" class="account-close" aria-label="Close settings">&times;</button>
      </header>
      <div class="account-actions">
        <button type="button" class="account-action" id="edit-profile-name">Edit profile name</button>
        <button type="button" class="account-action" id="show-password-form">Change password</button>
      </div>
      <p class="account-status" id="account-feedback" aria-live="polite"></p>
      <form id="profile-settings-form" class="account-form" hidden>
        <h3>Profile name</h3>
        <label for="profile-full-name">Full name</label>
        <input id="profile-full-name" name="name" type="text" value="${escapeHtml(storedUser.name)}" autocomplete="name" required>
        <button type="submit" class="account-submit">Save name</button>
        <button type="button" class="account-cancel-edit" data-cancel-form="profile-settings-form">Cancel</button>
        <p class="account-status" id="profile-settings-status" aria-live="polite"></p>
      </form>
      <form id="password-settings-form" class="account-form" hidden>
        <h3>Change password</h3>
        <label for="current-password">Current password</label>
        <input id="current-password" name="currentPassword" type="password" autocomplete="current-password" required>
        <label for="new-password">New password</label>
        <input id="new-password" name="newPassword" type="password" autocomplete="new-password" minlength="6" required>
        <label for="confirm-password">Confirm new password</label>
        <input id="confirm-password" name="confirmPassword" type="password" autocomplete="new-password" minlength="6" required>
        <button type="submit" class="account-submit">Update password</button>
        <button type="button" class="account-cancel-edit" data-cancel-form="password-settings-form">Cancel</button>
        <p class="account-status" id="password-settings-status" aria-live="polite"></p>
      </form>
      ${
        storedUser.role === "admin"
          ? ""
          : '<button type="button" class="account-delete-trigger">Delete account</button>'
      }
    </aside>
    <div class="delete-confirm-overlay" hidden>
      <div class="delete-confirm-backdrop"></div>
      <section class="delete-confirm-box" role="alertdialog" aria-modal="true" aria-labelledby="delete-confirm-title" aria-describedby="delete-confirm-description" tabindex="-1">
        <h2 id="delete-confirm-title">Delete your account?</h2>
        <p id="delete-confirm-description">This permanently deletes your account. This action cannot be undone.</p>
        <p class="account-status" id="delete-account-status" aria-live="polite"></p>
        <div class="delete-confirm-actions">
          <button type="button" class="account-cancel-delete">Cancel</button>
          <button type="button" class="account-confirm-delete">Delete account</button>
        </div>
      </section>
    </div>
  `;
  document.body.append(settingsOverlay);

  const closeButton = settingsOverlay.querySelector(".account-close");
  const accountActions = settingsOverlay.querySelector(".account-actions");
  const confirmOverlay = settingsOverlay.querySelector(
    ".delete-confirm-overlay",
  );
  const profileForm = settingsOverlay.querySelector("#profile-settings-form");
  const passwordForm = settingsOverlay.querySelector("#password-settings-form");
  const resetAccountForms = () => {
    profileForm.hidden = true;
    passwordForm.hidden = true;
    profileForm.reset();
    passwordForm.reset();
    settingsOverlay.querySelector("#profile-full-name").value =
      JSON.parse(localStorage.getItem("bakeryUser") || "null")?.name || "";
    accountActions.hidden = false;
    settingsOverlay.querySelector("#edit-profile-name").hidden = false;
    settingsOverlay.querySelector("#show-password-form").hidden = false;
  };
  const showAccountForm = (form, trigger) => {
    settingsOverlay.querySelector("#account-feedback").textContent = "";
    form.hidden = false;
    trigger.hidden = true;
    accountActions.hidden = true;
    form.querySelector("input").focus();
  };
  settingsOverlay
    .querySelector("#edit-profile-name")
    .addEventListener("click", (event) =>
      showAccountForm(profileForm, event.currentTarget),
    );
  settingsOverlay
    .querySelector("#show-password-form")
    .addEventListener("click", (event) =>
      showAccountForm(passwordForm, event.currentTarget),
    );
  settingsOverlay.querySelectorAll("[data-cancel-form]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = settingsOverlay.querySelector(
        `#${button.dataset.cancelForm}`,
      );
      form.hidden = true;
      form.reset();
      if (form === profileForm) {
        form.querySelector("#profile-full-name").value =
          JSON.parse(localStorage.getItem("bakeryUser") || "null")?.name || "";
      }
      form.querySelector(".account-status").textContent = "";
      accountActions.hidden = false;
      settingsOverlay
        .querySelector(`#${button.dataset.cancelForm === "profile-settings-form" ? "edit-profile-name" : "show-password-form"}`)
        .hidden = false;
    });
  });
  const closeSettings = () => {
    resetAccountForms();
    settingsOverlay.hidden = true;
    confirmOverlay.hidden = true;
    document.body.classList.remove("account-panel-open");
    settingsButton.focus();
  };
  settingsButton.addEventListener("click", () => {
    userDropdown.classList.remove("show");
    resetAccountForms();
    settingsOverlay.querySelector("#account-feedback").textContent = "";
    settingsOverlay.hidden = false;
    document.body.classList.add("account-panel-open");
    closeButton.focus();
  });
  closeButton.addEventListener("click", closeSettings);
  settingsOverlay.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-settings")) closeSettings();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !settingsOverlay.hidden) {
      if (!confirmOverlay.hidden) confirmOverlay.hidden = true;
      else closeSettings();
    }
  });

  settingsOverlay
    .querySelector("#profile-settings-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = settingsOverlay.querySelector("#profile-settings-status");
      const name = new FormData(event.currentTarget).get("name").trim();
      const parts = name.split(/\s+/);
      if (parts.length < 2) {
        status.textContent = "Enter your first and last name.";
        return;
      }
      const submitButton = event.currentTarget.querySelector(
        'button[type="submit"]',
      );
      submitButton.disabled = true;
      status.textContent = "Saving...";
      try {
        const { user } = await fetchJson("/users/me", {
          method: "PUT",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: parts.shift(),
            lastName: parts.join(" "),
          }),
        });
        const updatedUser = {
          ...storedUser,
          ...user,
          name: `${user.firstName} ${user.lastName}`.trim(),
        };
        localStorage.setItem("bakeryUser", JSON.stringify(updatedUser));
        settingsOverlay.querySelector("#profile-full-name").value =
          updatedUser.name;
        userDropdown.querySelector("#user-name").textContent =
          updatedUser.name;
        settingsOverlay.querySelector("#account-feedback").textContent =
          "Name updated.";
        profileForm.hidden = true;
        accountActions.hidden = false;
        settingsOverlay.querySelector("#edit-profile-name").hidden = false;
      } catch (error) {
        status.textContent = error.message;
      } finally {
        submitButton.disabled = false;
      }
    });

  settingsOverlay
    .querySelector("#password-settings-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const status = settingsOverlay.querySelector(
        "#password-settings-status",
      );
      const values = Object.fromEntries(new FormData(form));
      if (values.newPassword !== values.confirmPassword) {
        status.textContent = "The new passwords do not match.";
        return;
      }
      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      status.textContent = "Updating...";
      try {
        const response = await fetchJson("/users/me/password", {
          method: "PUT",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        form.reset();
        settingsOverlay.querySelector("#account-feedback").textContent =
          response.message;
        form.hidden = true;
        accountActions.hidden = false;
        settingsOverlay.querySelector("#show-password-form").hidden = false;
      } catch (error) {
        status.textContent = error.message;
      } finally {
        submitButton.disabled = false;
      }
    });

  const deleteTrigger = settingsOverlay.querySelector(
    ".account-delete-trigger",
  );
  if (deleteTrigger) {
    deleteTrigger.addEventListener("click", () => {
      settingsOverlay.querySelector("#delete-account-status").textContent = "";
      confirmOverlay.hidden = false;
      settingsOverlay.querySelector(".delete-confirm-box").focus();
    });
    settingsOverlay
      .querySelector(".account-cancel-delete")
      .addEventListener("click", () => {
        confirmOverlay.hidden = true;
        deleteTrigger.focus();
      });
    settingsOverlay
      .querySelector(".account-confirm-delete")
      .addEventListener("click", async (event) => {
        const confirmButton = event.currentTarget;
        const status = settingsOverlay.querySelector("#delete-account-status");
        confirmButton.disabled = true;
        status.textContent = "Deleting account...";
        try {
          await fetchJson("/users/me", {
            method: "DELETE",
            headers: authHeaders(),
          });
          localStorage.removeItem("bakeryToken");
          localStorage.removeItem("bakeryUser");
          window.location.href = "index.html";
        } catch (error) {
          status.textContent = error.message;
          confirmButton.disabled = false;
        }
      });
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
          `<div class="review-box"><div class="review-txt"><span class="review-stars" aria-label="${review.rating} out of 5 stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span><p>${escapeHtml(review.comment)}</p></div><div class="reviewer"><div class="reviewer-avatar"></div><p>${escapeHtml(`${review.user?.firstName || ""} ${review.user?.lastName || ""}`.trim() || "Customer")}</p></div></div>`,
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
          "Content-Type": "application/json",
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
  const needsCatalog =
    menuOptions ||
    document.querySelector(".home-menu-list") ||
    cartBox ||
    totalBox ||
    subTotalBox;
  if (!needsCatalog) {
    await initializeProductDetails();
    return;
  }
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
      menuOptions.innerHTML = `<p class="product-load-error" role="alert">Unable to load bakery products. Check your connection or try again shortly.</p>`;
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
