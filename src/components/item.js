function createItemElement(item) {

  const wrapper = document.createElement("div");
  wrapper.className = "swipe-wrapper";

  const card = document.createElement("div");
  card.className = "item";

  const fecha = item.fecha_caducidad
    ? new Date(item.fecha_caducidad).toLocaleDateString()
    : "Sin fecha";

  card.innerHTML = `
    <div class="item-name">${item.nombre} (${item.cantidad || 1})</div>
    <div class="item-date">${fecha}</div>
    <div class="item-cat">${getCatName(item.contenedor_id)}</div>
    <div class="item-status">
      ${item.abierto ? "🟢 Abierto" : "🔒 Cerrado"}
    </div>
  `;

  wrapper.appendChild(card);

  // 👉 SOLO ESTE
  applySwipe(wrapper, item);

  // 👉 editar al tocar
  card.onclick = () => openEditModal(item);

  return wrapper;
}
