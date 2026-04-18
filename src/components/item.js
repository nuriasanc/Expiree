function createItemElement(item) {

  let d = diasRestantes(item.fecha_caducidad);

  let div = document.createElement("div");
  div.className = "item";

  if (d <= 5) div.classList.add("rojo");

  div.innerHTML = `
    <div class="content">
      <b>${item.nombre}</b>
      <div>Cant: ${item.cantidad}</div>
      <div>${item.abierto ? "Abierto" : "Cerrado"}</div>
      <div>${item.plan ? "📅 " + item.plan : ""}</div>
      <div>${item.fecha_caducidad ? "Caduca en " + d + " días" : ""}</div>
    </div>
  `;

  applySwipe(div, item);

  return div;
}