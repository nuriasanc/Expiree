let items = JSON.parse(localStorage.getItem("items")) || [];
let categoria = "Despensa";

let openIndex = null;
let editIndex = null;

/* ELEMENTOS */
const modalEl = document.getElementById("modal");
const openModalEl = document.getElementById("openModal");
const editModalEl = document.getElementById("editModal");

modalEl.onclick = () => modalEl.classList.add("hidden");
openModalEl.onclick = () => openModalEl.classList.add("hidden");
editModalEl.onclick = () => editModalEl.classList.add("hidden");

/* ABRIR MODAL CREAR */
function openModal() {
  modalEl.classList.remove("hidden");
}

/* CATEGORÍA */
function setCat(c, el) {
  categoria = c;
  document.querySelectorAll(".cats button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
}

/* GUARDAR */
function guardar() {
  localStorage.setItem("items", JSON.stringify(items));
}

/* AÑADIR */
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

  modalEl.classList.add("hidden");

  nombre.value = "";
  fecha.value = "";
  qty.value = 1;
}

/* ABRIR */
function openOpenModal(i) {
  openIndex = i;
  openModalEl.classList.remove("hidden");
}

function confirmOpen() {

  let d = parseInt(diasAbierto.value);
  if (!d) return;

  let f = new Date();
  f.setDate(f.getDate() + d);

  items[openIndex].fecha = f.toISOString().split("T")[0];
  items[openIndex].abierto = true;

  guardar();
  render();

  openModalEl.classList.add("hidden");
}

/* EDITAR */
function openEditModal(i) {

  editIndex = i;
  let item = items[i];

  editNombre.value = item.nombre;
  editQty.value = item.cantidad;

  if (item.abierto) {
    editFechaContainer.style.display = "none";
    editDiasContainer.style.display = "block";
  } else {
    editFechaContainer.style.display = "block";
    editDiasContainer.style.display = "none";
    editFecha.value = item.fecha || "";
  }

  editModalEl.classList.remove("hidden");
}

function toggleEstado() {
  items[editIndex].abierto = !items[editIndex].abierto;
  openEditModal(editIndex);
}

function saveEdit() {

  let item = items[editIndex];

  item.nombre = editNombre.value;
  item.cantidad = editQty.value;

  if (item.abierto) {
    let d = parseInt(editDias.value);
    if (d) {
      let f = new Date();
      f.setDate(f.getDate() + d);
      item.fecha = f.toISOString().split("T")[0];
    }
  } else {
    item.fecha = editFecha.value;
  }

  guardar();
  render();
  editModalEl.classList.add("hidden");
}

/* DÍAS */
function dias(f) {
  if (!f) return 9999;
  return Math.ceil((new Date(f) - new Date()) / 86400000);
}

/* RENDER */
function render() {

  lista.innerHTML = "";

  items.forEach((item,i)=>{

    let d = dias(item.fecha);

    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="bg-left">Abrir</div>
      <div class="bg-right">Eliminar</div>

      <div class="content">
        <b>${item.nombre}</b>
        <div>Cant: ${item.cantidad} · ${item.abierto ? "Abierto" : "Cerrado"}</div>
        <div>${item.fecha ? `Caduca en ${d} días` : ""}</div>
      </div>
    `;

    let startX = 0;
    let rawX = 0;

    let pressTimer;
    let longPress = false;

    div.addEventListener("touchstart", e=>{
      startX = e.touches[0].clientX;
      longPress = false;

      pressTimer = setTimeout(()=>{
        longPress = true;
        openEditModal(i);
      }, 500);
    });

    div.addEventListener("touchmove", e=>{
      rawX = e.touches[0].clientX - startX;

      if (Math.abs(rawX) > 10) clearTimeout(pressTimer);

      let move = rawX * 0.6;

      div.querySelector(".content").style.transform = `translateX(${move}px)`;
      div.querySelector(".bg-left").style.opacity = move > 30 ? 1 : 0;
      div.querySelector(".bg-right").style.opacity = move < -30 ? 1 : 0;
    });

    div.addEventListener("touchend", ()=>{

      clearTimeout(pressTimer);

      if (longPress) return;

      if (rawX < -80) {
        items.splice(i,1);
      }

      if (rawX > 80) {
        openOpenModal(i);
      }

      guardar();
      render();
    });

    lista.appendChild(div);
  });

  lucide.createIcons();
}

render();