const API_BASE = window.API_BASE || "http://localhost:5000/api";
const token = localStorage.getItem("bakeryToken");
const storedUser = JSON.parse(localStorage.getItem("bakeryUser") || "null");
const state = {
  orders: [],
  products: [],
  categories: [],
  slides: [],
  reviews: [],
};
const selectedImages = { product: null, slide: null };
const previewUrls = { product: null, slide: null };
const statuses = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "out_for_delivery",
  "delivered",
  "completed",
  "failed",
  "cancelled",
];

const $ = (selector) => document.querySelector(selector);
const money = (value) =>
  `${Number(value || 0)
    .toFixed(2)
    .replace(/\.00$/, "")} kr`;

$("#order-status-filter").innerHTML += statuses
  .map(
    (status) =>
      `<option value="${status}">${status.replaceAll("_", " ")}</option>`,
  )
  .join("");

const imagePath = (value) =>
  /^https?:\/\//i.test(value || "") || (value || "").startsWith("/")
    ? value
    : `./${value}`;

function setImagePreview(previewSelector, value) {
  const preview = $(previewSelector);
  preview.src = value ? imagePath(value) : "";
  preview.hidden = !value;
}

function configureImageDropzone({
  zoneSelector,
  fileSelector,
  pathSelector,
  previewSelector,
  removeSelector,
  imageKey,
  messageSelector,
}) {
  const zone = $(zoneSelector);
  const fileInput = $(fileSelector);
  const pathInput = $(pathSelector);
  const preview = $(previewSelector);
  const removeButton = $(removeSelector);

  const clearSelection = () => {
    selectedImages[imageKey] = null;
    fileInput.value = "";
    if (previewUrls[imageKey]) URL.revokeObjectURL(previewUrls[imageKey]);
    previewUrls[imageKey] = null;
    preview.src = pathInput.value.trim()
      ? imagePath(pathInput.value.trim())
      : "";
    preview.hidden = !pathInput.value.trim();
    removeButton.hidden = true;
  };

  const previewImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      clearSelection();
      showMessage(messageSelector, "Choose an image file.", true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      clearSelection();
      showMessage(messageSelector, "Images must be 5MB or smaller.", true);
      return;
    }
    if (previewUrls[imageKey]) URL.revokeObjectURL(previewUrls[imageKey]);
    selectedImages[imageKey] = file;
    previewUrls[imageKey] = URL.createObjectURL(file);
    preview.src = previewUrls[imageKey];
    preview.hidden = false;
    removeButton.hidden = false;
    showMessage(messageSelector, "Image ready to upload when you save.");
  };

  pathInput.addEventListener("input", () => {
    clearSelection();
    preview.src = imagePath(pathInput.value.trim());
    preview.hidden = !pathInput.value.trim();
  });
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("is-dragging");
  });
  zone.addEventListener("dragleave", (event) => {
    if (!zone.contains(event.relatedTarget)) {
      zone.classList.remove("is-dragging");
    }
  });
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("is-dragging");
    previewImage(event.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", () => previewImage(fileInput.files[0]));
  removeButton.addEventListener("click", clearSelection);
  return { clearSelection };
}

function imageFormData(data, imageKey) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(
        key,
        Array.isArray(value) ? JSON.stringify(value) : value,
      );
    }
  });
  formData.append("image", selectedImages[imageKey]);
  return formData;
}

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ],
  );

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "Request failed");
  return body;
}

function showMessage(selector, message, error = false) {
  const element = $(selector);
  element.textContent = message;
  element.style.color = error ? "#b94335" : "";
}

function renderStatusSelect(order) {
  return `<select class="status-select" data-order-status="${order._id}">${statuses.map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${status.replaceAll("_", " ")}</option>`).join("")}</select>`;
}

function orderRow(order, compact = false) {
  const customer =
    order.customer?.name ||
    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
    "Guest customer";
  return `<tr><td class="order-id">#${escapeHtml(order._id.slice(-6).toUpperCase())}</td><td>${escapeHtml(customer)}</td>${compact ? "" : `<td>${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</td>`}<td>${money(order.totalAmount)}</td>${compact ? "" : `<td>${new Date(order.createdAt).toLocaleDateString()}</td>`}<td>${renderStatusSelect(order)}</td></tr>`;
}

function renderOrders() {
  const selectedStatus = $("#order-status-filter").value;
  const visibleOrders =
    selectedStatus === "all"
      ? state.orders
      : state.orders.filter((order) => order.status === selectedStatus);
  $("#orders-table").innerHTML = visibleOrders.length
    ? visibleOrders.map((order) => orderRow(order)).join("")
    : `<tr><td colspan="6" class="empty">${state.orders.length ? "No orders match this status." : "No orders yet."}</td></tr>`;
  $("#recent-orders").innerHTML = state.orders.slice(0, 5).length
    ? state.orders
        .slice(0, 5)
        .map((order) => orderRow(order, true))
        .join("")
    : '<tr><td colspan="4" class="empty">No orders yet.</td></tr>';
  document
    .querySelectorAll("[data-order-status]")
    .forEach((select) => select.addEventListener("change", updateOrderStatus));
}

function renderNotifications(stats) {
  const notices = [];
  if (stats.pendingOrders)
    notices.push(
      `<div class="notification"><i class="notice-dot"></i><div><strong>${stats.pendingOrders} pending order${stats.pendingOrders === 1 ? "" : "s"}</strong><span>Review the queue and set the next status.</span></div></div>`,
    );
  $("#notifications").innerHTML =
    notices.join("") || '<p class="empty">You are all caught up.</p>';
}

async function updateOrderStatus(event) {
  const order = state.orders.find(
    (item) => item._id === event.target.dataset.orderStatus,
  );
  const previous = order?.status;
  try {
    await request(`/orders/${event.target.dataset.orderStatus}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: event.target.value }),
    });
    if (order) order.status = event.target.value;
    renderOrders();
    showMessage(
      "#order-message",
      `Order status updated to ${event.target.value.replaceAll("_", " ")}.`,
    );
    await loadOverview();
  } catch (error) {
    event.target.value = previous;
    showMessage("#order-message", error.message, true);
  }
}

async function loadOverview() {
  const { stats } = await request("/admin/overview");
  $("#stat-orders").textContent = stats.orders;
  $("#stat-pending").textContent = stats.pendingOrders;
  $("#stat-products").textContent = stats.products;
  $("#stat-customers").textContent = stats.customers;
  renderNotifications(stats);
}

async function loadOrders() {
  const result = await request("/orders/all");
  state.orders = result.orders;
  renderOrders();
}

function renderReviews() {
  $("#review-list").innerHTML = state.reviews.length
    ? state.reviews
        .map(
          (review) =>
            `<article class="item-row"><div><h3>${escapeHtml(review.user ? `${review.user.firstName} ${review.user.lastName}` : "Customer")} · ${review.rating}/5</h3><p>${escapeHtml(review.comment)}</p><small>${escapeHtml(review.user?.email || "")} · ${review.approved ? "Approved" : "Awaiting approval"}</small></div><div class="item-actions"><button data-review-action="${review._id}" data-approved="${review.approved ? "false" : "true"}">${review.approved ? "Hide" : "Approve"}</button></div></article>`,
        )
        .join("")
    : '<p class="empty">No reviews submitted yet.</p>';
  document
    .querySelectorAll("[data-review-action]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        updateReview(
          button.dataset.reviewAction,
          button.dataset.approved === "true",
        ),
      ),
    );
}

async function loadReviews() {
  state.reviews = (await request("/admin/reviews")).reviews;
  renderReviews();
}

async function updateReview(id, approved) {
  try {
    await request(`/admin/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify({ approved }),
    });
    await loadReviews();
    showMessage(
      "#review-message",
      approved ? "Review approved." : "Review hidden.",
    );
  } catch (error) {
    showMessage("#review-message", error.message, true);
  }
}

function resetProductForm() {
  $("#product-form").reset();
  productImagePicker.clearSelection();
  $("#product-id").value = "";
  $("#product-available").checked = true;
  setImagePreview("#product-image-preview", "");
  $("#product-submit").textContent = "Add product";
  applyProductTypeFields();
}

function renderProducts() {
  $("#product-list").innerHTML = state.products.length
    ? state.products
        .map((product) => {
          const categoryName = product.category?.name?.toLowerCase();
          const cookieTag =
            categoryName === "cookie" && product.cookieType
              ? `<span class="product-label">${escapeHtml(product.cookieType)}</span>`
              : "";
          const specialTag =
            product.isSpecial || categoryName === "special"
              ? '<span class="product-label">Special</span>'
              : "";
          return `<article class="item-row"><img src="${escapeHtml(imagePath(product.image))}" alt="${escapeHtml(product.name)}"><div><h3>${escapeHtml(product.name)}</h3><p>${money(product.price)} · ${product.isAvailable ? "Available" : "Hidden"} ${cookieTag} ${specialTag}</p></div><div class="item-actions"><button data-edit-product="${product._id}">Edit</button><button data-delete-product="${product._id}">Delete</button></div></article>`;
        })
        .join("")
    : '<p class="empty">No products found.</p>';
  document
    .querySelectorAll("[data-edit-product]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        editProduct(button.dataset.editProduct),
      ),
    );
  document
    .querySelectorAll("[data-delete-product]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        deleteProduct(button.dataset.deleteProduct),
      ),
    );
}

async function loadProducts() {
  const [products, categories] = await Promise.all([
    request("/products/admin/all"),
    request("/categories"),
  ]);
  state.products = products.products;
  state.categories = categories.categories;
  $("#product-category").innerHTML =
    '<option value="">Choose bread or cookie</option>' +
    state.categories
      .filter((category) => category.name.toLowerCase() !== "special")
      .map(
        (category) =>
          `<option value="${category._id}">${escapeHtml(category.name)}</option>`,
      )
      .join("");
  applyProductTypeFields();
  renderProducts();
}

function updateBreadStartingPrice() {
  const prices = [
    $("#bread-single-price").value,
    $("#bread-classic-price").value,
    $("#bread-premium-price").value,
  ]
    .filter((value) => value !== "")
    .map(Number);
  if (prices.length) $("#product-price").value = Math.min(...prices);
}

function applyProductTypeFields() {
  const specialChecked = $("#product-special").checked;
  const category = state.categories.find(
    (item) => item._id === $("#product-category").value,
  );
  $("#product-category").required = !specialChecked;
  const isBread = category?.name.toLowerCase() === "bread";
  const isCookie = category?.name.toLowerCase() === "cookie";
  $("#bread-options-field").hidden = !isBread;
  $("#cookie-type-field").hidden = !isCookie;
  $("#product-price").readOnly = isBread;
  $("#product-price-label").textContent = isBread ? "Starting price" : "Price";
  document.querySelectorAll(".bread-price").forEach((input) => {
    input.required = isBread;
  });
  $("#product-cookie-type").required = isCookie;
  if (isCookie && !$("#product-cookie-type").value) {
    $("#product-cookie-type").value = "classic";
  }
  if (isBread) updateBreadStartingPrice();
}

function editProduct(id) {
  const product = state.products.find((item) => item._id === id);
  if (!product) return;
  productImagePicker.clearSelection();
  $("#product-id").value = product._id;
  $("#product-name").value = product.name;
  $("#product-price").value = product.price;
  const productCategoryId = product.category?._id || product.category;
  const productCategoryName =
    product.category?.name ||
    state.categories.find((category) => category._id === productCategoryId)
      ?.name;
  const isLegacySpecial = productCategoryName?.toLowerCase() === "special";
  $("#product-category").value = isLegacySpecial ? "" : productCategoryId;
  $("#product-special").checked = Boolean(product.isSpecial || isLegacySpecial);
  const breadOptions = product.breadOptions || [];
  $("#bread-single-price").value =
    breadOptions.find((option) => option.key === "single-serving")?.price ?? "";
  $("#bread-classic-price").value =
    breadOptions.find((option) => option.key === "classic-loaf")?.price ?? "";
  $("#bread-premium-price").value =
    breadOptions.find((option) => option.key === "premium-loaf")?.price ?? "";
  $("#product-cookie-type").value = product.cookieType || "classic";
  applyProductTypeFields();
  $("#product-image").value = product.image;
  setImagePreview("#product-image-preview", product.image);
  $("#product-description").value = product.description || "";
  $("#product-available").checked = product.isAvailable;
  $("#product-submit").textContent = "Save product";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveProduct(event) {
  event.preventDefault();
  const id = $("#product-id").value;
  if (!selectedImages.product && !$("#product-image").value.trim()) {
    showMessage("#product-message", "Choose or enter a product image.", true);
    return;
  }
  const category = state.categories.find(
    (item) => item._id === $("#product-category").value,
  );
  const isSpecial = $("#product-special").checked;
  const specialCategory = state.categories.find(
    (item) => item.name.toLowerCase() === "special",
  );
  const selectedCategory =
    category || (isSpecial ? specialCategory : undefined);
  if (!selectedCategory) {
    showMessage(
      "#product-message",
      "Choose a bread or cookie category, or mark the product Special.",
      true,
    );
    return;
  }
  const isBread = selectedCategory.name.toLowerCase() === "bread";
  const breadOptions = isBread
    ? [
        {
          key: "single-serving",
          label: "Slice / single serving",
          price: Number($("#bread-single-price").value),
        },
        {
          key: "classic-loaf",
          label: "Classic loaf",
          price: Number($("#bread-classic-price").value),
        },
        {
          key: "premium-loaf",
          label: "Premium loaf",
          price: Number($("#bread-premium-price").value),
        },
      ]
    : [];
  const product = {
    name: $("#product-name").value.trim(),
    price: isBread
      ? Math.min(...breadOptions.map((option) => option.price))
      : Number($("#product-price").value),
    category: selectedCategory._id,
    isSpecial,
    breadOptions,
    cookieType:
      selectedCategory.name.toLowerCase() === "cookie"
        ? $("#product-cookie-type").value
        : null,
    image: $("#product-image").value.trim(),
    description: $("#product-description").value.trim(),
    isAvailable: $("#product-available").checked,
  };
  try {
    await request(`/products${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: selectedImages.product
        ? imageFormData(product, "product")
        : JSON.stringify(product),
    });
    await loadProducts();
    resetProductForm();
    showMessage("#product-message", id ? "Product updated." : "Product added.");
  } catch (error) {
    showMessage("#product-message", error.message, true);
  }
}

async function deleteProduct(id) {
  if (!window.confirm("Delete this product?")) return;
  try {
    await request(`/products/${id}`, { method: "DELETE" });
    await loadProducts();
    showMessage("#product-message", "Product deleted.");
  } catch (error) {
    showMessage("#product-message", error.message, true);
  }
}

function resetSlideForm() {
  $("#carousel-form").reset();
  slideImagePicker.clearSelection();
  $("#slide-id").value = "";
  setImagePreview("#slide-image-preview", "");
  $("#slide-position").value = 0;
  $("#slide-alt").value = "Bakery selection";
  $("#slide-submit").textContent = "Add slide";
}

function renderSlides() {
  $("#slide-list").innerHTML =
    state.slides
      .map(
        (slide) =>
          `<article class="item-row"><img src="${escapeHtml(imagePath(slide.image))}" alt="${escapeHtml(slide.alt)}"><div><h3>${escapeHtml(slide.title || "Untitled slide")}</h3><p>Position ${slide.position} · ${escapeHtml(slide.image)}</p></div><div class="item-actions"><button data-edit-slide="${slide._id}">Edit</button><button data-delete-slide="${slide._id}">Delete</button></div></article>`,
      )
      .join("") || '<p class="empty">No carousel slides yet.</p>';
  document
    .querySelectorAll("[data-edit-slide]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        editSlide(button.dataset.editSlide),
      ),
    );
  document
    .querySelectorAll("[data-delete-slide]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        deleteSlide(button.dataset.deleteSlide),
      ),
    );
}

async function loadSlides() {
  state.slides = (await request("/admin/carousel")).slides;
  renderSlides();
}
function editSlide(id) {
  const slide = state.slides.find((item) => item._id === id);
  if (!slide) return;
  slideImagePicker.clearSelection();
  $("#slide-id").value = slide._id;
  $("#slide-image").value = slide.image;
  setImagePreview("#slide-image-preview", slide.image);
  $("#slide-title").value = slide.title || "";
  $("#slide-position").value = slide.position;
  $("#slide-alt").value = slide.alt || "Bakery selection";
  $("#slide-submit").textContent = "Save slide";
}
async function saveSlide(event) {
  event.preventDefault();
  const id = $("#slide-id").value;
  if (!selectedImages.slide && !$("#slide-image").value.trim()) {
    showMessage("#slide-message", "Choose or enter a carousel image.", true);
    return;
  }
  const slide = {
    image: $("#slide-image").value.trim(),
    title: $("#slide-title").value.trim(),
    position: Number($("#slide-position").value),
    alt: $("#slide-alt").value.trim(),
  };
  try {
    await request(`/admin/carousel${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: selectedImages.slide
        ? imageFormData(slide, "slide")
        : JSON.stringify(slide),
    });
    await loadSlides();
    resetSlideForm();
    showMessage(
      "#slide-message",
      id ? "Carousel slide updated." : "Carousel slide added.",
    );
  } catch (error) {
    showMessage("#slide-message", error.message, true);
  }
}
async function deleteSlide(id) {
  if (!window.confirm("Remove this carousel slide?")) return;
  try {
    await request(`/admin/carousel/${id}`, { method: "DELETE" });
    await loadSlides();
    showMessage("#slide-message", "Carousel slide removed.");
  } catch (error) {
    showMessage("#slide-message", error.message, true);
  }
}

function setView(view) {
  document
    .querySelectorAll(".view")
    .forEach((section) =>
      section.classList.toggle("active", section.id === `${view}-view`),
    );
  document
    .querySelectorAll(".nav button")
    .forEach((button) =>
      button.classList.toggle("active", button.dataset.view === view),
    );
  $("#page-title").textContent = {
    overview: "Good morning, owner.",
    orders: "Order desk",
    reviews: "Review desk",
    products: "Menu workshop",
    carousel: "Visual merchandising",
  }[view];
}

document
  .querySelectorAll(".nav button")
  .forEach((button) =>
    button.addEventListener("click", () => setView(button.dataset.view)),
  );
document
  .querySelectorAll("[data-go]")
  .forEach((button) =>
    button.addEventListener("click", () => setView(button.dataset.go)),
  );
$("#refresh-orders").addEventListener("click", loadOrders);
$("#order-status-filter").addEventListener("change", renderOrders);
$("#refresh-reviews").addEventListener("click", loadReviews);
const productImagePicker = configureImageDropzone({
  zoneSelector: "#product-image-dropzone",
  fileSelector: "#product-image-file",
  pathSelector: "#product-image",
  previewSelector: "#product-image-preview",
  removeSelector: "#product-image-remove",
  imageKey: "product",
  messageSelector: "#product-message",
});
const slideImagePicker = configureImageDropzone({
  zoneSelector: "#slide-image-dropzone",
  fileSelector: "#slide-image-file",
  pathSelector: "#slide-image",
  previewSelector: "#slide-image-preview",
  removeSelector: "#slide-image-remove",
  imageKey: "slide",
  messageSelector: "#slide-message",
});
$("#product-form").addEventListener("submit", saveProduct);
$("#product-category").addEventListener("change", applyProductTypeFields);
$("#product-special").addEventListener("change", applyProductTypeFields);
document
  .querySelectorAll(".bread-price")
  .forEach((input) =>
    input.addEventListener("input", updateBreadStartingPrice),
  );
$("#product-cancel").addEventListener("click", resetProductForm);
$("#carousel-form").addEventListener("submit", saveSlide);
$("#slide-cancel").addEventListener("click", resetSlideForm);
$("#logout").addEventListener("click", () => {
  localStorage.removeItem("bakeryToken");
  localStorage.removeItem("bakeryUser");
  window.location.href = "login.html";
});
$("#admin-name").textContent = storedUser?.name || "Admin";

(async function init() {
  if (!token) {
    window.location.href = "login.html";
    return;
  }
  try {
    await Promise.all([
      loadOverview(),
      loadOrders(),
      loadReviews(),
      loadProducts(),
      loadSlides(),
    ]);
  } catch (error) {
    document.querySelector(".main").innerHTML =
      `<section class="panel"><h2>Dashboard unavailable</h2><p>${escapeHtml(error.message)}. Sign in with an admin account and try again.</p><a href="login.html">Go to login</a></section>`;
  }
})();
