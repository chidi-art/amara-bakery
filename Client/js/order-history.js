const historyStatus = document.getElementById("order-history-status");
const historyList = document.getElementById("order-history-list");
const historyToken = localStorage.getItem("bakeryToken");
const historyApiBase = window.API_BASE || "http://localhost:5000/api";

const escapeHistoryText = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const renderOrder = (order) => {
  const items = (order.items || [])
    .map(
      (item) =>
        `<li>${escapeHistoryText(item.name)} x ${Number(item.quantity) || 0}</li>`,
    )
    .join("");
  const date = new Date(order.createdAt).toLocaleDateString();
  const status = escapeHistoryText(
    (order.status || "pending").replaceAll("_", " "),
  );

  return `
    <article class="order-history-order">
      <header>
        <span class="order-history-number">Order #${escapeHistoryText(order._id.slice(-6).toUpperCase())}</span>
        <span class="order-history-badge">${status}</span>
      </header>
      <ul class="order-history-items">${items}</ul>
      <div class="order-history-summary">
        <span>Placed ${escapeHistoryText(date)}</span>
        <strong>${escapeHistoryText(order.totalAmount)} kr</strong>
      </div>
      <p class="order-history-address">${escapeHistoryText(order.deliveryAddress)}</p>
    </article>`;
};

const loadOrderHistory = async () => {
  if (!historyToken) {
    historyStatus.innerHTML =
      'Sign in to view your orders. <a href="login.html">Log in</a>';
    return;
  }

  try {
    const response = await fetch(`${historyApiBase}/orders`, {
      headers: { Authorization: `Bearer ${historyToken}` },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || "Unable to load orders");

    if (!body.orders?.length) {
      historyStatus.innerHTML =
        'No orders yet. <a href="Menu.html">Browse the menu</a>';
      historyStatus.classList.add("order-history-empty");
      return;
    }

    historyStatus.remove();
    historyList.innerHTML = body.orders.map(renderOrder).join("");
  } catch (error) {
    historyStatus.textContent = error.message;
  }
};

loadOrderHistory();
