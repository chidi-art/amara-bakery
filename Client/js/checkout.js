const CHECKOUT_API_BASE = window.API_BASE || "http://localhost:5000/api";
const checkoutCart = JSON.parse(localStorage.getItem("cart") || "[]");
const productCheckoutBox = document.getElementById("product-total");
const taxCheckoutBox = document.getElementById("tax-total");
const deliveryCheckoutBox = document.getElementById("delivery-total");
const totalCheckoutBox = document.getElementById("checkout-total");
const placeOrderBtn = document.querySelector(".checkout-btn");
const checkOutForm = document.querySelector(".checkout-form");
const taxRate = 0.75;
const delivery = 0;
const productTotal = checkoutCart.reduce((total, product) => total + product.price * product.quantity, 0);

productCheckoutBox.textContent = `${productTotal} kr`;
taxCheckoutBox.textContent = `${productTotal * taxRate} kr`;
deliveryCheckoutBox.textContent = `${delivery} kr`;
totalCheckoutBox.textContent = `${productTotal + productTotal * taxRate + delivery} kr`;

placeOrderBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  if (!checkoutCart.length) { window.location.href = "Cart.html"; return; }
  if (!checkOutForm.checkValidity()) { checkOutForm.reportValidity(); return; }

  const customer = {
    name: `${document.getElementById("firstname").value} ${document.getElementById("lastname").value}`.trim(),
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value
  };
  const address = [
    document.getElementById("address").value,
    document.getElementById("city").value,
    document.getElementById("state").value,
    document.getElementById("zip").value
  ].join(", ");

  placeOrderBtn.disabled = true;
  try {
    const response = await fetch(`${CHECKOUT_API_BASE}/orders/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        deliveryAddress: address,
        items: checkoutCart.map((item) => ({ product: item.product, quantity: item.quantity }))
      })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Unable to place order");
    localStorage.setItem("lastOrder", JSON.stringify(body.order));
    localStorage.removeItem("cart");
    window.location.href = "confirmation.html";
  } catch (error) {
    placeOrderBtn.disabled = false;
    alert(error.message);
  }
});
