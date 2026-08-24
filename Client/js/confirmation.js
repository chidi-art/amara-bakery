const orders = JSON.parse(localStorage.getItem("orders")) || [];
const order = orders[orders.length - 1];

if (order) {
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
    order.orderId || "-";
  document.getElementById("confirmation-customer-name").textContent =
    customer.name || "-";
  document.getElementById("confirmation-items").textContent = items || "-";
  document.getElementById("confirmation-total").textContent =
    `${order.total || 0} kr`;
  document.getElementById("confirmation-address").textContent = address || "-";
  document.getElementById("confirmation-phone").textContent =
    customer.phone || "-";
}
