let items = JSON.parse(localStorage.getItem("items")) || [];
let categoria = "Despensa";
let editIndex = null;

function guardar() {
  localStorage.setItem("items", JSON.stringify(items));
}

/* MODAL */
function openModal() {
  modal.classList.remove("hidden");
}

/* CATEGORÍA */
function setCat(c, el) {
  categoria = c;
  document.querySelectorAll(".cats button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
}

/* AÑADIR */
function addItem() {

  if (!nombre.value.trim()) return alert("Nombre obligatorio");

items.push({
  nombre: nombre.value,
  fecha: fecha.value,
  cantidad: qty.value,
  categoria,
  abierto: false,
  diasAbierto: null
});

  guardar();
  render();

  nombre.value = "";
  fecha.value = "";
  qty.value = 1;

  modal.classList.add("hidden");
}

/* DÍAS */
function dias(f) {
  if (!f) return 9999;
  return Math.ceil((new Date(f) - new Date()) / 86400000);
}

/* % PROGRESO */
function progreso(d) {
  if (d <= 0) return 100;
  if (d > 30) return 0;
  return (1 - d/30) * 100;
}

/* COLOR */
function color(d) {
  if (d <= 5) return "red";
  if (d <= 15) return "orange";
  return "green";
}

/* ELIMINAR CON ANIMACIÓN */
function eliminar(i, el) {
  el.style.transform = "translateX(-100%)";
  el.style.opacity = 0;

  setTimeout(() => {
    items.splice(i,1);
    guardar();
    render();
  }, 250);
}

/* EDITAR */
function editar(i) {
  editIndex = i;

  editNombre.value = items[i].nombre;
  editFecha.value = items[i].fecha || "";
  editCantidad.value = items[i].cantidad || "";

  editModal.classList.remove("hidden");
}

function saveEdit() {
  items[editIndex].nombre = editNombre.value;
  items[editIndex].fecha = editFecha.value;
  items[editIndex].cantidad = editCantidad.value;

  guardar();
  render();

  editModal.classList.add("hidden");
}

/* RENDER */
function render() {

  lista.innerHTML = "";

  items.sort((a,b)=>dias(a.fecha)-dias(b.fecha));

  items.forEach((item,i)=>{

    const d = dias(item.fecha);
    const p = progreso(d);

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="actions">Eliminar</div>

      <div class="content">
        <div>
          <b>${item.nombre}</b>
          <div>
  Cant: ${item.cantidad || 1} · ${item.fecha ? `Caduca en ${d} días` : "Sin fecha"}
</div>

<div style="font-size:12px; opacity:0.6;">
 ${estadoTexto(item)}
</div>

          <div class="progress">
            <div class="progress-bar ${color(d)}" style="width:${p}%"></div>
          </div>
        </div>

        ${window.innerWidth > 768 ? `
          <div class="desktop-actions">
            <button onclick="editar(${i})"><i data-lucide="edit"></i></button>
            <button onclick="eliminar(${i}, this.closest('.item'))"><i data-lucide="trash"></i></button>
          </div>
        ` : ""}
      </div>
    `;

    /* SWIPE SOLO MÓVIL */
    if (window.innerWidth <= 768) {

      let startX = 0;
      let moved = false;

      div.addEventListener("touchstart", e => {
        startX = e.touches[0].clientX;
      });

      div.addEventListener("touchmove", e => {

        let dx = e.touches[0].clientX - startX;
        moved = true;

        div.querySelector(".content").style.transform = `translateX(${dx}px)`;

        if (dx < -50) {
          div.querySelector(".actions").style.opacity = 1;
        } else {
          div.querySelector(".actions").style.opacity = 0;
        }

      });

      div.addEventListener("touchend", e => {

        let dx = e.changedTouches[0].clientX - startX;

        if (dx < -100) {
          eliminar(i, div);
        }

        div.querySelector(".content").style.transform = "";
        div.querySelector(".actions").style.opacity = 0;
      });
    }

    lista.appendChild(div);
  });

  lucide.createIcons();
}

function estadoTexto(item) {
  return item.abierto ? "Abierto" : "Cerrado";
}


render();

