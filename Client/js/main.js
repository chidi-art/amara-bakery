const userDropdown = document.querySelector(".user-dropdown");
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartBox = document.querySelector(".product-box");
const taxBox = document.getElementById("tax");
const totalBox = document.getElementById("total");
const subTotalBox = document.getElementById("subtotal");
const cartLink = document.querySelector(".cart-link");
const track = document.getElementById("imageTrack");
const menuOptions = document.getElementById("menu_container");

const images = [
  ["IMG_0905.JPG", "Biscoff Stuffed Cookies", "cookie"],
  ["IMG_0908.JPG", "Oreo Cream Cheese Loaf", "bread"],
  ["IMG_0934.JPG", "Coconut Topped Loaf", "bread"],
  ["IMG_0939.JPG", "Classic Chocolate Chunk Cookies", "cookie"],
  ["IMG_0940.JPG", "Marshmallow & Chocolate Chunk Cookies", "cookie"],
  ["IMG_0942.JPG", "M&M Cookies", "cookie"],
  ["IMG_0943.JPG", "Oreo Chunk Cookies", "cookie"],
  ["IMG_0946.JPG", "Variety Cookie Spread", "cookie"],
  ["IMG_0947.JPG", "Oreo Crumb Cookies", "cookie"],
  ["IMG_0948.JPG", "White Chocolate Chunk Cookies", "cookie"],
  ["IMG_0952.JPG", "Pistachio & Chocolate Cookies", "cookie"],
  ["IMG_0953.JPG", "Double Chocolate Marshmallow Cookies", "cookie"],
  ["IMG_0958.JPG", "White Chocolate & Jam Cookies", "cookie"],
].map(([file, name, tag]) => ({
  src: `Images/products/${file}`,
  name,
  tag,
  price: 12,
}));

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

let carouselIndex = 0;

function renderCarousel() {
  if (track)
    track.innerHTML = `<img src="Images/carosel_images/${carouselImages[carouselIndex]}" alt="Fresh pastry">`;
}

function carousel_left() {
  if (!track) return;
  carouselIndex =
    (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
  renderCarousel();
}

function carousel_right() {
  if (!track) return;
  carouselIndex = (carouselIndex + 1) % carouselImages.length;
  renderCarousel();
}

function productMarkup(product, index) {
  return `<div class="menu-box">
    <a href="Product details.html?product=${index}">
      <div class="menu-box-img"><img src="./${product.src}" alt="${product.name}"></div>
      <div class="menu-box-txt"><span class="menu-box-name">${product.name}</span><span class="menu-box-price">${product.price}kr</span></div>
    </a>
    <button class="menu-add-to-cart" type="button" data-index="${index}" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
  </div>`;
}

function renderProducts(category) {
  if (menuOptions)
    menuOptions.innerHTML = images
      .map((product, index) =>
        !category || product.tag === category
          ? productMarkup(product, index)
          : "",
      )
      .join("");
}

function initializeProductLinks() {
  document
    .querySelectorAll('.menu-box a[href="Product details.html"]')
    .forEach((link, index) => {
      const product = images[index % images.length];
      const box = link.closest(".menu-box");
      link.href = `Product details.html?product=${index % images.length}`;
      link.querySelector("img").src = `./${product.src}`;
      link.querySelector("img").alt = product.name;
      link.querySelector(".menu-box-name").textContent = product.name;
      link.querySelector(".menu-box-price").textContent = `${product.price}kr`;
      const button = box.querySelector(".menu-add-to-cart");
      button.type = "button";
      button.dataset.name = product.name;
      button.dataset.price = product.price;
    });
}

function MenuOptions() {
  renderProducts();
}

function Category(button) {
  renderProducts(button.dataset.category);
}

function updateCartCount() {
  if (cartLink)
    cartLink.textContent = `Cart (${cart.reduce((total, product) => total + product.quantity, 0)})`;
}

function addToCart(button) {
  const box = button.closest(".menu-box");
  const productBody = button.closest(".product-body");
  const name =
    button.dataset.name ||
    box?.querySelector(".menu-box-name")?.textContent.trim() ||
    productBody?.querySelector(".product-name")?.textContent.trim();
  const price = Number(
    button.dataset.price ||
      box
        ?.querySelector(".menu-box-price")
        ?.textContent.replace(/[^\d.]/g, "") ||
      productBody
        ?.querySelector(".product-price")
        ?.textContent.replace(/[^\d.]/g, "") ||
      0,
  );
  const quantity = Math.max(
    1,
    Math.min(
      10,
      Number(productBody?.querySelector(".product-qty input")?.value) || 1,
    ),
  );
  if (!name || !price) return;
  const image =
    box?.querySelector("img")?.getAttribute("src") ||
    productBody?.querySelector(".product-img")?.getAttribute("src") ||
    "";
  const product = cart.find((item) => item.name === name);
  if (product) {
    product.quantity = Math.min(10, product.quantity + quantity);
    product.image ||= image;
  } else cart.push({ name, price, quantity, image });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  button.textContent = "Added";
  setTimeout(() => (button.textContent = "Add to Cart"), 1000);
}

function updateCartTotals() {
  if (!subTotalBox || !taxBox || !totalBox) return;
  const subtotal = cart.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );
  const tax = subtotal * 0.75;
  subTotalBox.textContent = `${subtotal} kr`;
  taxBox.textContent = `${tax} kr`;
  totalBox.textContent = `${subtotal + tax} kr`;
}

function renderCart() {
  if (!cartBox) return;
  cartBox.hidden = cart.length === 0;
  cartBox.innerHTML = cart
    .map(
      (product) => `<div class="cart-box-container">
    <div class="cart-box-product"><img src="${product.image || "./Images/products/IMG_0979.JPG"}" alt="${product.name}"><p>${product.name}</p></div><div class="cart-btns">
    <div class="cart-price">${product.price * product.quantity} kr</div><div class="cart-qty">
    <button class="qty-btn minus-btn" type="button" data-name="${product.name}">-</button>
    <input class="numinput" type="number" value="${product.quantity}" readonly>
    <button class="qty-btn plus-btn" type="button" data-name="${product.name}">+</button>
    </div></div></div>`,
    )
    .join("");
}

function changeQuantity(button, amount) {
  const product = cart.find((item) => item.name === button.dataset.name);
  if (!product) return;
  product.quantity += amount;
  if (product.quantity < 1) cart.splice(cart.indexOf(product), 1);
  if (product.quantity > 10) product.quantity = 10;
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCartTotals();
  updateCartCount();
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest(".menu-add-to-cart, .add-to-cart");
  if (addButton) {
    event.preventDefault();
    addToCart(addButton);
  }
  const quantityButton = event.target.closest(".cart-qty .qty-btn");
  if (quantityButton)
    changeQuantity(
      quantityButton,
      quantityButton.classList.contains("plus-btn") ? 1 : -1,
    );
  const productQuantityButton = event.target.closest(".product-qty .qty-btn");
  if (productQuantityButton) {
    const input = productQuantityButton.parentElement.querySelector("input");
    input.value = Math.max(
      0,
      Math.min(
        10,
        Number(input.value) +
          (productQuantityButton.classList.contains("plus-btn") ? 1 : -1),
      ),
    );
  }
  if (event.target.closest("#user-button"))
    userDropdown?.classList.toggle("show");
  else if (!event.target.closest(".user-container"))
    userDropdown?.classList.remove("show");
});

renderProducts();
initializeProductLinks();
renderCarousel();
if (track) setInterval(carousel_right, 10000);
renderCart();
updateCartTotals();
updateCartCount();

const detailPage = document.querySelector(".product-body:not(#product_body)");
if (detailPage) {
  const product =
    images[Number(new URLSearchParams(location.search).get("product"))] ||
    images[0];
  detailPage.querySelector(".product-img").src = `./${product.src}`;
  detailPage.querySelector(".product-img").alt = product.name;
  detailPage.querySelector(".product-name").textContent = product.name;
  detailPage.querySelector(".product-price").textContent = `${product.price}kr`;
  detailPage.querySelector(".add-to-cart").dataset.name = product.name;
  detailPage.querySelector(".add-to-cart").dataset.price = product.price;
  document.title = product.name;
}
