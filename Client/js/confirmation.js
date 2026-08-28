const order = JSON.parse(localStorage.getItem("lastOrder") || "null");
const confirmationTitle = document.getElementById("confirmation-title");
const confirmationIntro = document.querySelector(".confirmation-intro");
const confirmationDetails = document.querySelector(".confirmation-details");
const confirmationEmpty = document.getElementById("confirmation-empty");
const confirmationMark = document.querySelector(".confirmation-mark");

if (!order) {
  confirmationMark.textContent = "";
  confirmationTitle.textContent = "No Order Yet";
  confirmationIntro.textContent = "";
  confirmationDetails.hidden = true;
  confirmationEmpty.hidden = false;
} else {
  const customer = order.customer || {};
  const items = (order.items || [])
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");
  const address = [
    customer.address,
    customer.city,
    customer.state,
    customer.zip,
  ]
    .filter(Boolean)
    .join(", ");

  document.getElementById("confirmation-order-number").textContent =
    order._id || order.orderId || "-";
  document.getElementById("confirmation-customer-name").textContent =
    customer.name || "-";
  document.getElementById("confirmation-items").textContent = items || "-";
  document.getElementById("confirmation-total").textContent =
    `${order.totalAmount || order.total || 0} kr`;
  document.getElementById("confirmation-address").textContent = address || "-";
  document.getElementById("confirmation-phone").textContent =
    customer.phone || "-";
}
