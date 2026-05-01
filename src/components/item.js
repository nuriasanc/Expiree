function createItemElement(item) {

  const wrapper = document.createElement("div");
  wrapper.className = "swipe-wrapper";

  const bg = document.createElement("div");
  bg.className = "swipe-bg";
  bg.innerHTML = `<span>Eliminar</span>`;

  const card = document.createElement("div");
  card.className = "item";

  card.innerHTML = `
    <div class="item-name">${item.nombre}</div>
  `;

  wrapper.appendChild(bg);
  wrapper.appendChild(card);

  addSwipe(wrapper, item.id);

  card.onclick = () => openEditModal(item);

  return wrapper;
}
