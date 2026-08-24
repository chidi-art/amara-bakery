const checkoutCart = JSON.parse(localStorage.getItem("cart")) || [];
const orders = JSON.parse(localStorage.getItem("orders")) || [];
const productCheckoutBox = document.getElementById("product-total");
const deliveryCheckoutBox = document.getElementById("delivery-total");
const totalCheckoutBox = document.getElementById("checkout-total");
const placeOrderBtn = document.querySelector(".checkout-btn");
const checkOutForm = document.querySelector(".checkout-form");

let delivery = 0;
let productTotal = 0;

placeOrderBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const custName = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const zip = document.getElementById("zip").value;
  const state = document.getElementById("state").value;
  const city = document.getElementById("city").value;
  const order = {
    orderId: "AMA - 101",
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
    total: productTotal,
  };

  if (!checkOutForm.checkValidity()) {
    checkOutForm.reportValidity();
    return;
  }
  console.log("Form submitted");
  console.log(order);

  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
});

checkoutCart.forEach((product) => {
  productTotal += product.price * product.quantity;
});

productCheckoutBox.textContent = `${productTotal} kr`;
deliveryCheckoutBox.textContent = `${delivery} kr`;
totalCheckoutBox.textContent = `${productTotal + delivery} kr`;
