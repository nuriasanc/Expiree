let items = JSON.parse(localStorage.getItem("items")) || [];
let categoria = "Despensa";
let openIndex = null;

/* MODAL */
modal.addEventListener("click", () => modal.classList.add("hidden"));
openModal.addEventListener("click", () => openModal.classList.add("hidden"));

function openModal() {
  modal.classList.remove("hidden");
}

function setCat(c, el) {
  categoria = c;
  document.querySelectorAll(".cats button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
}

function guardar() {
  localStorage.setItem("items", JSON.stringify(items));
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

/* ABRIR */
function openOpenModal(i) {
  openIndex = i;
  openModal.classList.remove("hidden");
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

  openModal.classList.add("hidden");
}

/* DÍAS */
function dias(f) {
  if (!f) return 9999;
  return Math.ceil((new Date(f) - new Date()) / 86400000);
}

/* RENDER */
function render() {

  lista.innerHTML = "";

  items.sort((a,b)=>dias(a.fecha)-dias(b.fecha));

  items.forEach((item,i)=>{

    let d = dias(item.fecha);

    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="bg-left">Abrir</div>
      <div class="bg-right">Eliminar</div>

      <div class="content">
        <div>
          <b>${item.nombre}</b>
          <div>
            Cant: ${item.cantidad} · ${item.abierto ? "Abierto" : "Cerrado"}
          </div>
          <div>${item.fecha ? `Caduca en ${d} días` : "Sin fecha"}</div>
        </div>
      </div>
    `;

    let startX = 0;

    div.addEventListener("touchstart", e=>{
      startX = e.touches[0].clientX;
    });

    div.addEventListener("touchmove", e=>{
      let dx = e.touches[0].clientX - startX;

      div.querySelector(".content").style.transform = `translateX(${dx}px)`;

      if (dx > 50) div.querySelector(".bg-left").style.opacity = 1;
      else div.querySelector(".bg-left").style.opacity = 0;

      if (dx < -50) div.querySelector(".bg-right").style.opacity = 1;
      else div.querySelector(".bg-right").style.opacity = 0;
    });

    div.addEventListener("touchend", e=>{

      let dx = e.changedTouches[0].clientX - startX;

      if (dx < -100) {
        items.splice(i,1);
      }

      if (dx > 100) {
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