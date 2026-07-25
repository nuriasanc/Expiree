
/* const nav = document.getElementById("nav");

=========================
   START APP
========================= *
function startApp() {

  const nav = document.getElementById("nav");

  document.getElementById("auth").classList.add("hide");

  setTimeout(() => {

    document.getElementById("auth").style.display = "none";

    document.getElementById("app").classList.remove("hidden");

    if (nav) nav.classList.remove("hidden");

    document.getElementById("userEmail").innerText = user.email;

    loadItems();

  }, 200);
}

/* =========================
   ADD ITEM
=========================

async function addItem() {

  if (!nombre.value.trim()) return;

  await addItemDB({
    user_id: user.id,
    nombre: nombre.value,
    cantidad: parseInt(qty.value) || 1,
    fecha_caducidad: fecha.value || null,
    contenedor_id: categoriaToId(categoria),
    abierto: false
  });

  cerrarModal();

  nombre.value = "";
  fecha.value = "";
  qty.value = 1;

  loadItems();
}

/* =========================
   CATEGORY MAP
========================= 

function categoriaToId(cat) {
  if (cat === "Nevera") return 1;
  if (cat === "Congelador") return 2;
  return 3;
}

*/


function toggleMenu(){

    document.getElementById("menu").classList.toggle("hidden");

}


function abrirModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
  document.getElementById("modal").classList.add("hidden");
  clearModal();
}


function clearModal() {
  nombre.value = "";
  fecha.value = "";
  selectedCat = null;
  cantidad = 1;
  document.getElementById("cantidad").innerText = 1;

  document.querySelectorAll(".cat").forEach(c => c.classList.remove("selected"));
}



/* =========================
   SWIPE
========================= */

function addSwipe(wrapper, itemId) {

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const card = wrapper.querySelector(".item");
  const bg = wrapper.querySelector(".swipe-bg");

  wrapper.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    card.style.transition = "none";
  });

  wrapper.addEventListener("touchmove", (e) => {

    if (!dragging) return;

    currentX = e.touches[0].clientX - startX;

    const item = items.find(i => i.id === itemId);

    if (currentX < 0) {
      card.style.transform = `translateX(${currentX}px)`;
      bg.style.background = "#ff3b30";
      bg.innerText = "Eliminar";
      bg.style.opacity = Math.min(Math.abs(currentX) / 120, 1);
    }

    if (currentX > 0) {
      card.style.transform = `translateX(${currentX}px)`;

      if (item.abierto) {
        bg.innerText = "Cerrar";
        bg.style.background = "#ff9500";
      } else {
        bg.innerText = "Abrir";
        bg.style.background = "#34c759";
      }

      bg.style.opacity = Math.min(currentX / 120, 1);
    }
  });

  wrapper.addEventListener("touchend", async () => {

    dragging = false;
    card.style.transition = "transform 0.2s ease";

    const item = items.find(i => i.id === itemId);

    if (currentX < -120) {

      card.style.transform = "translateX(-100%)";

      setTimeout(async () => {
        await deleteItem(itemId);
        loadItems();
      }, 200);

      return;
    }

    if (currentX > 120) {

      if (item.abierto) {
        await closeItem(itemId);
      } else {
        openOpenModal(itemId);
      }

      card.style.transform = "translateX(0)";
      bg.style.opacity = 0;
      return;
    }

    card.style.transform = "translateX(0)";
    bg.style.opacity = 0;

    currentX = 0;
  });
}


function toggleSeccion(cat){

    secciones[cat] = !secciones[cat];

    render();
}