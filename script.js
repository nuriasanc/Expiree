let items = JSON.parse(localStorage.getItem("items")) || [];
let categoria = "Despensa";
let openIndex = null;

const modalEl = document.getElementById("modal");
const openModalEl = document.getElementById("openModal");

/* cerrar modales al hacer click fuera */
modalEl.onclick = () => modalEl.classList.add("hidden");
openModalEl.onclick = () => openModalEl.classList.add("hidden");

/* abrir modal crear */
function openModal() {
  modalEl.classList.remove("hidden");
}

/* categoría */
function setCat(c, el) {
  categoria = c;
}

/* guardar local */
function guardar() {
  localStorage.setItem("items", JSON.stringify(items));
}

/* añadir */
function addItem() {

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

/* abrir modal abrir */
function openOpenModal(i) {
  openIndex = i;
  openModalEl.classList.remove("hidden");
}

/* confirmar abrir */
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

/* días restantes */
function dias(fecha) {
  if (!fecha) return 9999;
  return Math.ceil((new Date(fecha) - new Date()) / 86400000);
}

/* RENDER */
function render() {

  lista.innerHTML = "";

  /* ORDEN: abiertos primero + por fecha */
  let ordenados = [...items].sort((a, b) => {

    if (a.abierto !== b.abierto) {
      return b.abierto - a.abierto;
    }

    let da = a.fecha ? new Date(a.fecha) : new Date(9999,1,1);
    let db = b.fecha ? new Date(b.fecha) : new Date(9999,1,1);

    return da - db;
  });

  ["Nevera","Congelador","Despensa"].forEach(cat => {

    let grupo = ordenados.filter(i => i.categoria === cat);

    if (!grupo.length) return;

    let titulo = document.createElement("h3");
    titulo.textContent = cat;
    lista.appendChild(titulo);

    grupo.forEach(item => {

      let i = items.indexOf(item);

      let d = dias(item.fecha);

      let div = document.createElement("div");
      div.className = "item";

      /* 🔴 ROJO si caduca en < 5 días */
      if (d <= 5) div.classList.add("rojo");

      /* ⬇️ TU MISMA ESTRUCTURA (NO SE TOCA SWIPE NI ICONOS) */
      div.innerHTML = `
        <div class="bg-left">Abrir</div>
        <div class="bg-right">Eliminar</div>

        <div class="content">
          <b>${item.nombre}</b>
          <div>Cant: ${item.cantidad} · ${item.abierto ? "Abierto" : "Cerrado"}</div>
          <div>${item.fecha ? `Caduca en ${d} días` : ""}</div>
        </div>
      `;

      /* ⚠️ MANTENEMOS TU SWIPE EXACTO */
      let startX = 0;
      let rawX = 0;

      let pressTimer;
      let longPress = false;

      div.addEventListener("touchstart", e=>{
        startX = e.touches[0].clientX;
        longPress = false;

        pressTimer = setTimeout(()=>{
          longPress = true;
          openEditModal(i); // 👈 NO SE TOCA
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

        /* ELIMINAR */
        if (rawX < -80) {
          items.splice(i,1);
        }

        /* ABRIR */
        if (rawX > 80) {
          openOpenModal(i); // 👈 sigue funcionando igual
        }

        guardar();
        render();
      });

      lista.appendChild(div);
    });

  });

  lucide.createIcons();
}

render();