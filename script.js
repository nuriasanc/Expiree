let items = JSON.parse(localStorage.getItem("items")) || [];
let categoria = "Despensa";
let openIndex = null;

function guardar() {
  localStorage.setItem("items", JSON.stringify(items));
}

function openModal() {
  modal.classList.remove("hidden");
}

function setCat(c, el) {
  categoria = c;
  document.querySelectorAll(".cats button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
}

function addItem() {

  if (!nombre.value.trim()) return alert("Nombre obligatorio");

  items.push({
    nombre: nombre.value,
    fecha: fecha.value,
    cantidad: qty.value,
    categoria,
    abierto: false
  });

  guardar();
  render();

  modal.classList.add("hidden");

  nombre.value = "";
  fecha.value = "";
  qty.value = 1;
}

/* ABIERTO */
function openOpenModal(i) {
  openIndex = i;
  openModal.classList.remove("hidden");
}

function confirmOpen() {

  let dias = parseInt(diasAbierto.value);
  if (!dias) return;

  let f = new Date();
  f.setDate(f.getDate() + dias);

  items[openIndex].fecha = f.toISOString().split("T")[0];
  items[openIndex].abierto = true;

  guardar();
  render();

  openModal.classList.add("hidden");
}

/* DÍAS */
function dias(f) {
  if (!f) return 9999;
  return Math.ceil((new Date(f) - new Date()) / 86400000);
}

/* COLOR */
function color(d) {
  if (d <= 0) return "red";
  if (d <= 5) return "red";
  if (d <= 15) return "yellow";
  return "green";
}

/* ELIMINAR */
function eliminar(i, el) {
  el.style.transform = "translateX(-100%)";
  setTimeout(() => {
    items.splice(i,1);
    guardar();
    render();
  },200);
}

/* RENDER */
function render() {

  lista.innerHTML = "";

  /* ORDEN: categoría + caducidad */
  items.sort((a,b)=>dias(a.fecha)-dias(b.fecha));

  items.forEach((item,i)=>{

    const d = dias(item.fecha);

    const div = document.createElement("div");
    div.className = "item " + color(d);

    div.innerHTML = `
      <div class="actions">Eliminar</div>

      <div class="content">
        <div>
          <b>${item.nombre}</b>

          <div>
            Cant: ${item.cantidad} · ${item.abierto ? "Abierto" : "Cerrado"}
          </div>

          <div>
            ${item.fecha ? `Caduca en ${d} días` : "Sin fecha"}
          </div>
        </div>
      </div>
    `;

    /* SWIPE */
    let startX = 0;

    div.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    div.addEventListener("touchmove", e => {
      let dx = e.touches[0].clientX - startX;
      div.style.transform = `translateX(${dx}px)`;

      if (dx < -50) div.querySelector(".actions").style.opacity = 1;
      if (dx > 100) div.style.background = "#34c759";
    });

    div.addEventListener("touchend", e => {

      let dx = e.changedTouches[0].clientX - startX;

      if (dx < -100) eliminar(i, div);
      if (dx > 100) openOpenModal(i);

      div.style.transform = "";
      div.querySelector(".actions").style.opacity = 0;
    });

    lista.appendChild(div);
  });

  lucide.createIcons();
}

render();

/* CERRAR MODAL */
window.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add("hidden");
  if (e.target === openModal) openModal.classList.add("hidden");
});