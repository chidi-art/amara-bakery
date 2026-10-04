const CHECKOUT_API_BASE = window.API_BASE || "https://amara-backend-9mht.onrender.com/api";
const checkoutCart = JSON.parse(localStorage.getItem("cart") || "[]");
const productCheckoutBox = document.getElementById("product-total");
const deliveryCheckoutBox = document.getElementById("delivery-total");
const totalCheckoutBox = document.getElementById("checkout-total");
const placeOrderBtn = document.querySelector(".checkout-btn");
const checkOutForm = document.querySelector(".checkout-form");
const fulfillmentSelect = document.getElementById("fulfillment");
const delivery = 0;

const updateCheckoutTotals = () => {
  const pricing = window.calculateCartPricing?.(checkoutCart);
  const productTotal =
    pricing?.subtotal ??
    checkoutCart.reduce(
      (total, product) => total + product.price * product.quantity,
      0,
    );
  productCheckoutBox.textContent = `${productTotal} kr`;
  deliveryCheckoutBox.textContent = `${delivery} kr`;
  totalCheckoutBox.textContent = `${productTotal + delivery} kr`;
  const bundleNote = document.getElementById("checkout-cookie-bundles");
  if (bundleNote) {
    bundleNote.textContent = pricing?.bundleSummary || "";
    bundleNote.hidden = !pricing?.bundleSummary;
  }
};

updateCheckoutTotals();
window.addEventListener("cartpricingupdated", () => {
  checkoutCart.splice(
    0,
    checkoutCart.length,
    ...JSON.parse(localStorage.getItem("cart") || "[]"),
  );
  updateCheckoutTotals();
});

placeOrderBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  if (!checkoutCart.length) {
    window.location.href = "Cart.html";
    return;
  }
  if (!checkOutForm.checkValidity()) {
    checkOutForm.reportValidity();
    return;
  }

  const customer = {
    name: `${document.getElementById("firstname").value} ${document.getElementById("lastname").value}`.trim(),
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
  };
  const address = `${fulfillmentSelect.selectedOptions[0].text} | ${[
    document.getElementById("address").value,
    document.getElementById("city").selectedOptions[0].text,
    document.getElementById("state").selectedOptions[0].text,
    document.getElementById("zip").value,
  ].join(", ")}`;

  placeOrderBtn.disabled = true;
  try {
    const token = localStorage.getItem("bakeryToken");
    const response = await fetch(`${CHECKOUT_API_BASE}/orders/guest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        customer,
        deliveryAddress: address,
        items: checkoutCart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          ...(item.breadOption ? { breadOption: item.breadOption } : {}),
        })),
      }),
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
