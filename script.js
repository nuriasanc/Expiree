let items = JSON.parse(localStorage.getItem("items")) || [];
let categoria = "Despensa";
let openIndex = null;

/* MODALES */
modal.onclick = () => modal.classList.add("hidden");
openModal.onclick = () => openModal.classList.add("hidden");

function openModal() {
  modal.classList.remove("hidden");
}

/* CATEGORÍA */
function setCat(c, el) {
  categoria = c;
  document.querySelectorAll(".cats button").forEach(b => b.classList.remove("active"));
  el.classList.add("active");
}

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
  if (!d || d <= 0) return;

  let f = new Date();
  f.setDate(f.getDate() + d);

  items[openIndex].fecha = f.toISOString().split("T")[0];
  items[openIndex].abierto = true;

  guardar();
  render();

  openModal.classList.add("hidden");
  diasAbierto.value = "";
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
          <div> Cant: ${item.cantidad} · ${item.abierto ? "Abierto" : "Cerrado"} </div>
          <div>${item.fecha ? `Caduca en ${d} días` : "Sin fecha"}</div>
        </div>
      </div>
    `;

    let startX = 0;
    let currentX = 0;
    let rawX = 0;

    div.addEventListener("touchstart", e=>{
      startX = e.touches[0].clientX;
      currentX = 0;
      rawX = 0;
    });

    div.addEventListener("touchmove", e=>{

      rawX = e.touches[0].clientX - startX;

      // ✨ resistencia tipo iOS
      currentX = rawX * 0.6;

      div.querySelector(".content").style.transform = `translateX(${currentX}px)`;

      div.querySelector(".bg-left").style.opacity = currentX > 30 ? 1 : 0;
      div.querySelector(".bg-right").style.opacity = currentX < -30 ? 1 : 0;
    });

    div.addEventListener("touchend", ()=>{

      /* 👉 ELIMINAR */
      if (rawX < -80) {
        div.style.transition = "transform .2s ease";
        div.style.transform = "translateX(-100%)";

        setTimeout(()=>{
          items.splice(i,1);
          guardar();
          render();
        },200);
        return;
      }

      /* 👉 ABRIR (FIX REAL) */
      if (rawX > 80) {
        openOpenModal(i);
      }

      /* 🔁 volver */
      div.querySelector(".content").style.transition = "transform .2s ease";
      div.querySelector(".content").style.transform = "translateX(0px)";

      setTimeout(()=>{
        div.querySelector(".content").style.transition = "";
      },200);

      div.querySelector(".bg-left").style.opacity = 0;
      div.querySelector(".bg-right").style.opacity = 0;
    });

    lista.appendChild(div);
  });

  lucide.createIcons();
}

render();