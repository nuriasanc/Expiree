function createItemElement(item) {

  const wrapper = document.createElement("div");
  wrapper.className = "swipe-wrapper";

  const card = document.createElement("div");
  card.className = "item";

  card.innerHTML = `
    <div class="item-name">${item.nombre} (${item.cantidad || 1})</div>
    <div class="item-status">
      ${item.abierto ? "🟢 Abierto" : "🔒 Cerrado"}
    </div>
  `;

  wrapper.appendChild(card);

  // 👉 IMPORTANTE: usar applySwipe (NO addSwipe)
  applySwipe(wrapper, item);

  // 👉 editar al tocar
  card.onclick = () => openEditModal(item);

  return wrapper;
}
