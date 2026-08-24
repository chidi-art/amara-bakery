const userButton = document.getElementById("user-button");
const userDropdown = document.querySelector(".user-dropdown");
const cart = JSON.parse(localStorage.getItem("cart")) || [];
const addToCartBtns = document.querySelectorAll(".menu-add-to-cart");
const cartBox = document.querySelector(".product-box");
const taxBox = document.getElementById("tax");
const totalBox = document.getElementById("total");
const subTotalBox = document.getElementById("subtotal");
const cartLink = document.querySelector(".cart-link");
const track = document.getElementById("imageTrack");
const menuOptions = document.getElementById("menu_container");
const breadbtn = document.getElementById("breadbtn");
const cookiebtn = document.getElementById("cookiebtn");
const productBody = document.getElementById("product_body");

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
  menuOptions.innerHTML = "";

  images.forEach((e, index) => {
    menuOptions.innerHTML += `
      <div class="menu-box" >
        <div class="menu-box-div">
          <div class="menu-box-img">
            <img src="./${e.src}" />
          </div>
          <div class="menu-box-txt">
            <span class="menu-box-name">${e.name}</span>
            <span class="menu-box-price">12kr</span>
          </div>
          <button class="menu-add-to-cart" onclick = "ProductLoad(this)" data-index = "${index}">Add to Cart</button>
        </div>
      </div>`;
  });
}

function Category(btn) {
  const category = btn.dataset.category;
  menuOptions.innerHTML = "";
  images.forEach((e, index) => {
    if (e.tag == category) {
      menuOptions.innerHTML += `
      <div class="menu-box" >
        <div class="menu-box-div">
          <div class="menu-box-img">
            <img src="./${e.src}" />
          </div>
          <div class="menu-box-txt">
            <span class="menu-box-name">${e.name}</span>
            <span class="menu-box-price">12kr</span>
          </div>
          <button class="menu-add-to-cart" onclick = "ProductLoad(this)" data-index = "${index}">Add to Cart</button>
        </div>
      </div>`;
    }
  });
}

function ProductLoad(evt) {
  index = evt.dataset.index;
  productBody.innerHTML = "";
  productBody.style.display = "flex";
  document.getElementById("blocker").style.scale = "calc(1)";

  productBody.innerHTML += `
  <div class="product-image">
  <button style = "transform: translate(-80px,20px);background: #b6410f ; font-size: 30px ;position: absolute; height: 60px; width: 60px; border-radius: 30px;border: none; color: white; font-weight: bolder;" onclick="document.getElementById('product_body').style.display = 'none';document.getElementById('blocker').style.scale = 'calc(0)';" >
    X
  </button>
    <img class="product-img" src="./${images[index].src}" />
  </div>
  <div class="product-txt-container">
    <div class="product-txt-info">
      <span class="product-name" data-name="${images[index].name}">
        ${images[index].name}
      </span>
      <span class="product-desc">
        Delicious cacao bread with fudge filling
      </span>
      <span class="product-price" data-price="${images[index].price}">
        ${images[index].price}kr
      </span>
    </div>
    <div class="product-btns">
      <div class="product-qty">
        <button class="qty-btn minus-btn" onclick = "minus_1()">-</button>
        <input class="numinput" type="number" value="0" min="0" max="10" />
        <button class="qty-btn plus-btn" onclick = "plus_1()">+</button>
      </div>
      <a class="add-to-cart" href="#"> Add to Cart</a>
    </div>
  </div>
  `;
}

MenuOptions();

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
