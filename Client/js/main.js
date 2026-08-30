const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartBox = document.querySelector(".product-box");

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

if (userName && userEmail && storedUser) {
  userName.textContent = storedUser.name;
  userEmail.textContent = storedUser.email;
}
const taxBox = document.getElementById("tax");
const totalBox = document.getElementById("total");
const subTotalBox = document.getElementById("subtotal");
const cartLink = document.querySelector(".cart-link");
const track = document.getElementById("imageTrack");
const menuOptions = document.getElementById("menu_container");
const breadbtn = document.getElementById("breadbtn");
const cookiebtn = document.getElementById("cookiebtn");

function plus_1() {
  let num_input = document.querySelector(".numinput");
  let currentValue = parseInt(num_input.value) || 0;

  if (currentValue < 10) {
    currentValue += 1;
    num_input.value = currentValue;
  }
}

function minus_1() {
  let num_input = document.querySelector(".numinput");
  let currentValue = parseInt(num_input.value) || 0;

  if (currentValue > 0) {
    currentValue -= 1;
    num_input.value = currentValue;
  }
}

const images = [
  {
    src: "Images/products/IMG_0905.JPG",
    name: "Biscoff Stuffed Cookies",
    loadedname: "Biscoff Stuffed Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0908.JPG",
    name: "Oreo Cream Cheese Loaf",
    loadedname: "Oreo Cream Cheese Loaf",
    tag: "bread",
    price: 12,
  },
  {
    src: "Images/products/IMG_0934.JPG",
    name: "Coconut Topped Loaf",
    loadedname: "Coconut Topped Loaf",
    tag: "bread",
    price: 12,
  },
  {
    src: "Images/products/IMG_0939.JPG",
    name: "Classic Chocolate Chunk Cookies",
    loadedname: "Classic Chocolate Chunk Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0940.JPG",
    name: "Marshmallow & Chocolate Chunk Cookies",
    loadedname: "Marshmallow & Chocolate Chunk Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0942.JPG",
    name: "M&M Cookies",
    loadedname: `<span style="color: transparent;">~~</span>M&M <span style="color: transparent;">~~</span>Cookies`,
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0943.JPG",
    name: "Oreo Chunk Cookies",
    loadedname: "Oreo Chunk Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0946.JPG",
    name: "Variety Cookie Spread",
    loadedname: "Variety Cookie Spread",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0947.JPG",
    name: "Oreo Crumb Cookies",
    loadedname: "Oreo Crumb Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0948.JPG",
    name: "White Chocolate Chunk Cookies",
    loadedname: "White Chocolate Chunk Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0952.JPG",
    name: "Pistachio & Chocolate Cookies",
    loadedname: "Pistachio & Chocolate Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0953.JPG",
    name: "Double Chocolate Marshmallow Cookies",
    loadedname: "Double Chocolate Marshmallow Cookies",
    tag: "cookie",
    price: 12,
  },
  {
    src: "Images/products/IMG_0958.JPG",
    name: "White Chocolate & Jam Cookies",
    loadedname: "White Chocolate & Jam Cookies",
    tag: "cookie",
    price: 12,
  },
];

let clicked = [false, false];

setInterval(() => {
  carousel_right();
}, 10000);

function MenuOptions() {
  if (!menuOptions) return;
  menuOptions.innerHTML = "";

  images.forEach((e, index) => {
    menuOptions.innerHTML += `
      <div class="menu-box" >
        <div class="menu-box-div" onclick="if (!event.target.closest('.menu-add-to-cart')) location.href='Product details.html?product=${index}'" data-index="${index}">
          <div class="menu-box-img">
            <img src="./${e.src}" />
          </div>
          <div class="menu-box-txt">
            <span class="menu-box-name">${e.name}</span>
            <span class="menu-box-price">12kr</span>
          </div>
          <button class="menu-add-to-cart" type="button" data-index="${index}" data-name="${e.name}" data-price="${e.price}">Add to Cart</button>
        </div>
      </div>`;
  });
}

function Category(btn) {
  if (!menuOptions) return;
  const category = btn.dataset.category;
  menuOptions.innerHTML = "";
  images.forEach((e, index) => {
    if (e.tag == category) {
      menuOptions.innerHTML += `
      <div class="menu-box" >
        <div class="menu-box-div" onclick="if (!event.target.closest('.menu-add-to-cart')) location.href='Product details.html?product=${index}'" data-index="${index}">
          <div class="menu-box-img">
            <img src="./${e.src}" />
          </div>
          <div class="menu-box-txt">
            <span class="menu-box-name">${e.name}</span>
            <span class="menu-box-price">12kr</span>
          </div>
          <button class="menu-add-to-cart" type="button" data-index="${index}" data-name="${e.name}" data-price="${e.price}">Add to Cart</button>
        </div>
      </div>`;
    }
  });
}

MenuOptions();
initializeProductDetails();

carosel_images = [
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

carosel_imagesLength = carosel_images.length;
let index = carosel_imagesLength;

function Carousel2() {
  if (!track) return;
  if (index == 0) {
    index = carosel_imagesLength;
  }
  track.innerHTML = "";

  track.innerHTML += `<img src="Images/carosel_images/${carosel_images[index % carosel_imagesLength]}" class = "img1">`;
}

function carousel_left() {
  index -= 1;
  Carousel2();
}
function carousel_right() {
  index += 1;
  Carousel2();
}
Carousel2();

const checkoutTotalBox = document.getElementById("checkout-total");

updateCartCount();
if (userButton && userDropdown) {
  userButton.addEventListener("click", () => {
    userDropdown.classList.toggle("show");
  });
}

document.addEventListener("click", (event) => {
  const checkoutLink = event.target.closest(
    '.checkout-btn[href="checkout.html"]',
  );
  if (checkoutLink?.classList.contains("disabled")) {
    event.preventDefault();
    return;
  }
  const addButton = event.target.closest(".menu-add-to-cart, .add-to-cart");
  if (addButton) {
    event.preventDefault();
    addToCart(addButton);
  }
  const productQuantityButton = event.target.closest(".product-qty .qty-btn");
  if (productQuantityButton) {
    const input = productQuantityButton.parentElement.querySelector("input");
    const change = productQuantityButton.classList.contains("plus-btn")
      ? 1
      : -1;
    const details = productQuantityButton.closest(".product-body");
    const name = details?.querySelector(".product-name")?.textContent.trim();
    const product = cart.find((item) => item.name === name);
    const quantity = Math.max(
      0,
      Math.min(10, (product?.quantity || 0) + change),
    );
    if (product && quantity > 0) product.quantity = quantity;
    else if (product) cart.splice(cart.indexOf(product), 1);
    else if (quantity > 0) {
      const price = Number(
        details
          .querySelector(".product-price")
          .textContent.replace(/[^\d.]/g, ""),
      );
      const image = details.querySelector(".product-img").getAttribute("src");
      cart.push({ name, price, quantity, image });
    }
    input.value = quantity;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    updateCartTotals();
  }
  if (
    userButton &&
    userDropdown &&
    !userButton.contains(event.target) &&
    !userDropdown.contains(event.target)
  ) {
    userDropdown.classList.remove("show");
  }
});

function addToCart(button) {
  const box = button.closest(".menu-box");
  const details = button.closest(".product-body");
  const name =
    button.dataset.name ||
    box?.querySelector(".menu-box-name")?.textContent.trim() ||
    details?.querySelector(".product-name")?.textContent.trim();
  const price = Number(
    button.dataset.price ||
      box
        ?.querySelector(".menu-box-price")
        ?.textContent.replace(/[^\d.]/g, "") ||
      details
        ?.querySelector(".product-price")
        ?.textContent.replace(/[^\d.]/g, "") ||
      0,
  );
  const quantity = Math.max(
    1,
    Math.min(
      10,
      Number(details?.querySelector(".product-qty input")?.value) || 1,
    ),
  );
  const image =
    box?.querySelector("img")?.getAttribute("src") ||
    details?.querySelector(".product-img")?.getAttribute("src") ||
    "Images/products/IMG_0979.JPG";
  if (!name || !price) return;
  const product = cart.find((item) => item.name === name);
  if (product) {
    product.quantity = Math.min(10, product.quantity + 1);
    product.image ||= image;
  } else cart.push({ name, price, quantity, image });
  const savedProduct = cart.find((item) => item.name === name);
  const quantityInput = details?.querySelector(".product-qty input");
  if (quantityInput) quantityInput.value = savedProduct.quantity;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  button.textContent = "Added";
  setTimeout(() => (button.textContent = "Add to Cart"), 1000);
}

function initializeProductDetails() {
  const details = document.querySelector(".product-body");
  if (!details || details.id === "product_body") return;
  const productIndex = Number(
    new URLSearchParams(location.search).get("product"),
  );
  const product =
    images[
      Number.isInteger(productIndex) && productIndex >= 0 ? productIndex : 0
    ];
  details.querySelector(".product-img").src = `./${product.src}`;
  details.querySelector(".product-img").alt = product.name;
  details.querySelector(".product-name").textContent = product.name;
  details.querySelector(".product-price").textContent = `${product.price}kr`;
  const addButton = details.querySelector(".add-to-cart");
  addButton.dataset.name = product.name;
  addButton.dataset.price = product.price;
  const cartProduct = cart.find((item) => item.name === product.name);
  details.querySelector(".product-qty input").value =
    cartProduct?.quantity ?? 0;
  document.title = product.name;
}

if (cartBox) {
  renderCart();
  updateCartTotals();
  setQtyBtns();
}

function updateCartCount() {
  const cartCount = cart.reduce((total, product) => {
    return total + product.quantity;
  }, 0);

  if (cartLink) cartLink.textContent = `Cart (${cartCount})`;
  const checkoutLink = document.querySelector(
    '.checkout-btn[href="checkout.html"]',
  );
  if (checkoutLink) {
    checkoutLink.classList.toggle("disabled", cartCount === 0);
    checkoutLink.setAttribute("aria-disabled", cartCount === 0);
    checkoutLink.tabIndex = cartCount === 0 ? -1 : 0;
  }
}

function getProductImage(product) {
  return (
    product.image ||
    images.find((item) => item.name === product.name)?.src ||
    "Images/products/IMG_0979.JPG"
  );
}

function updateCartTotals() {
  if (!subTotalBox || !taxBox || !totalBox) return;
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
  localStorage.setItem("cart", JSON.stringify(cart));
  cart.forEach((product) => {
    cartBox.innerHTML += `
<div class="cart-box-container">
    <div class="cart-box-product">
  <img src="./${getProductImage(product)}" alt="${product.name}" />
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
