const checkoutCart = JSON.parse(localStorage.getItem("cart")) || [];
const orders = JSON.parse(localStorage.getItem("orders")) || [];
const productCheckoutBox = document.getElementById("product-total");
const taxCheckoutBox = document.getElementById("tax-total");
const deliveryCheckoutBox = document.getElementById("delivery-total");
const totalCheckoutBox = document.getElementById("checkout-total");
const placeOrderBtn = document.querySelector(".checkout-btn");
const checkOutForm = document.querySelector(".checkout-form");
const orderID = `AMR-${Date.now()}`;

let delivery = 0;
let productTotal = 0;
const taxRate = 0.75;

placeOrderBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (checkoutCart.length === 0) {
    window.location.href = "Cart.html";
    return;
  }
  const email = document.getElementById("email").value;
  const custName =
    `${document.getElementById("firstname").value} ${document.getElementById("lastname").value}`.trim();
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const zip = document.getElementById("zip").value;
  const state = document.getElementById("state").value;
  const city = document.getElementById("city").value;
  const order = {
    orderId: orderID,
    customer: {
      name: custName,
      email: email,
      phone: phone,
      address: address,
      city: city,
      state: state,
      zip: zip,
    },
    items: checkoutCart,
    delivery: delivery,
    total: productTotal + productTotal * taxRate + delivery,
  };

  if (!checkOutForm.checkValidity()) {
    checkOutForm.reportValidity();
    return;
  }
  console.log("Form submitted");
  console.log(order);

  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.removeItem("cart");
  window.location.href = "confirmation.html";
});

checkoutCart.forEach((product) => {
  productTotal += product.price * product.quantity;
});

productCheckoutBox.textContent = `${productTotal} kr`;
taxCheckoutBox.textContent = `${productTotal * taxRate} kr`;
deliveryCheckoutBox.textContent = `${delivery} kr`;
totalCheckoutBox.textContent = `${productTotal + productTotal * taxRate + delivery} kr`;
