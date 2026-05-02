function createItemElement(item) {

  const wrapper = document.createElement("div");
  wrapper.className = "swipe-wrapper";

  const bg = document.createElement("div");
  bg.className = "swipe-bg";

  const card = document.createElement("div");
  card.className = "item";

  const fechaCad = item.fecha_caducidad
    ? new Date(item.fecha_caducidad).toLocaleDateString()
    : "Sin fecha";

  let mealText = "";

  if (item.meal_date) {
    const d = new Date(item.meal_date);
    mealText = "📅 " + d.toLocaleDateString("es-ES", { weekday: "long" });
  }

  card.innerHTML = `
    <div><b>${item.nombre}</b></div>
    <small>${fechaCad}</small>
    <small>${getCatName(item.contenedor_id)}</small>
    ${mealText ? `<small style="color:#007aff">${mealText}</small>` : ""}
  `;

  wrapper.appendChild(bg);
  wrapper.appendChild(card);

  addSwipe(wrapper, item.id);

  card.onclick = () => openEditModal(item);

  return wrapper;
}
