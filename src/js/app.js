let items = [];
let selectedCat = null;
let qty = 1;
let meals = [];
let openItemId = null;

/* =========================
   RENDER
========================= */

function diasRestantes(item) {

  if (item.abierto && item.dias_caducidad != null) {
    return item.dias_caducidad;
  }

  if (!item.fecha_caducidad) return 9999;

  return Math.ceil((new Date(item.fecha_caducidad) - new Date()) / 86400000);
}



window.render = function () {

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const hoy = new Date();

  function diasRestantes(fecha) {
    if (!fecha) return 9999;
    return Math.ceil((new Date(fecha) - hoy) / 86400000);
  }

  // 🔴 URGENTES
  const urgentes = items
    .filter(i => i.fecha_caducidad && diasRestantes(i.fecha_caducidad) <= 4)
    .sort((a, b) => new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad));

  if (urgentes.length) {

    const titulo = document.createElement("h3");
    titulo.innerText = "⚠️ Caducan pronto";
    titulo.style.color = "#ff3b30";

    lista.appendChild(titulo);

    urgentes.forEach(item => {
      const el = createItemElement(item);
      el.querySelector(".item").style.borderLeft = "4px solid #ff3b30";
      lista.appendChild(el);
    });
  }

  // 📦 POR CONTENEDOR
  [1, 2, 3].forEach(cat => {

    const grupo = items
      .filter(i => i.contenedor_id === cat && !urgentes.includes(i))
      .sort((a, b) => new Date(a.fecha_caducidad || 999999999) - new Date(b.fecha_caducidad || 999999999));

    if (!grupo.length) return;

    const titulo = document.createElement("h3");

    titulo.textContent =
      cat === 1 ? "Nevera" :
      cat === 2 ? "Congelador" :
      "Despensa";

    lista.appendChild(titulo);

    grupo.forEach(item => {
      lista.appendChild(createItemElement(item));
    });
  });

  lucide.createIcons();
};

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", async () => {

  const boot = document.getElementById("bootScreen");

  const { data } = await supabaseClient.auth.getSession();

  boot.style.display = "none";

  if (data.session) {
    user = data.session.user;
    startApp();
  } else {
    showLogin();
  }
});

function showLogin() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("auth").classList.remove("hidden");
}

/* =========================
   MODAL
========================= */

function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  clearModal();
}

function clearModal() {
  nombre.value = "";
  fecha.value = "";
  selectedCat = null;
  qty = 1;
  document.getElementById("qtyValue").innerText = 1;

  document.querySelectorAll(".cat").forEach(c => c.classList.remove("selected"));
  document.getElementById("modalError").innerText = "";
}

/* =========================
   CATEGORIA
========================= */

function setCat(id) {

  selectedCat = id;

  document.querySelectorAll(".cat").forEach(c => c.classList.remove("selected"));

  document.getElementById("cat" + id).classList.add("selected");
}

/* =========================
   SAVE ITEM
========================= */

window.saveItem = async function () {

  if (!nombre.value.trim()) return;
  if (!selectedCat) return;

  await supabaseClient
    .from("items")
    .insert([{
      user_id: user.id,
      nombre: nombre.value.trim(),
      cantidad: qty,
      fecha_caducidad: fecha.value || null,
      contenedor_id: selectedCat,
      abierto: false
    }]);

  closeModal();
  loadItems();
};

/* =========================
   LOAD ITEMS
========================= */

async function loadItems() {

  const { data: itemsData } = await supabaseClient
    .from("items")
    .select("*")
    .eq("user_id", user.id);

  const { data: mealsData } = await supabaseClient
    .from("meal_plan")
    .select(`
      *,
      items (*)
    `)
    .eq("user_id", user.id);

  items = itemsData || [];
  meals = mealsData || [];

  render();
}

/* =========================
   ITEM UI
========================= */

function createItemElement(item) {

  const wrapper = document.createElement("div");
  wrapper.className = "swipe-wrapper";

  const bg = document.createElement("div");
  bg.className = "swipe-bg";

  const card = document.createElement("div");
  card.className = "item";

  const fecha = item.fecha_caducidad
    ? new Date(item.fecha_caducidad).toLocaleDateString()
    : "Sin fecha";

  card.innerHTML = `
    <div class="item-name">${item.nombre} (${item.cantidad || 1})</div>
    <div class="item-date">${fecha}</div>
    <div class="item-cat">${getCatName(item.contenedor_id)}</div>
    <div class="item-status">${item.abierto ? "🟢 Abierto" : "🔒 Cerrado"}</div>
  `;

  wrapper.appendChild(bg);
  wrapper.appendChild(card);

  addSwipe(wrapper, item.id);

  return wrapper;
}

function getCatName(id) {
  if (id === 1) return "Nevera";
  if (id === 2) return "Congelador";
  return "Despensa";
}

/* =========================
   SWIPE (FINAL BUENO)
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

    if (currentX < 0) {
      card.style.transform = `translateX(${currentX}px)`;
      bg.style.background = "#ff3b30";
      bg.innerText = "Eliminar";
      bg.style.opacity = Math.min(Math.abs(currentX) / 120, 1);
    }

    if (currentX > 0) {
      card.style.transform = `translateX(${currentX}px)`;
      bg.style.background = "#34c759";
      bg.innerText = "Abrir";
      bg.style.opacity = Math.min(currentX / 120, 1);
    }
  });

  wrapper.addEventListener("touchend", async () => {

    dragging = false;
    card.style.transition = "transform 0.2s ease";

    if (currentX < -120) {

      card.style.transform = "translateX(-100%)";

      setTimeout(async () => {
        await deleteItem(itemId);
        loadItems();
      }, 200);

      return;
    }

    if (currentX > 120) {

      openOpenModal(itemId);

      card.style.transform = "translateX(0)";
      bg.style.opacity = 0;

      return;
    }

    card.style.transform = "translateX(0)";
    bg.style.opacity = 0;

    currentX = 0;
  });
}

/* =========================
   DELETE
========================= */

async function deleteItem(id) {
  const { error } = await supabaseClient
    .from('items')
    .delete()
    .eq("id", id);

  if (error) console.error("Error eliminando", error);
}

/* =========================
   QTY
========================= */

function changeQty(n) {
  qty = Math.max(1, qty + n);
  document.getElementById("qtyValue").innerText = qty;
}

/* =========================
   ABRIR ITEM
========================= */

function openOpenModal(id) {
  openItemId = id;
  document.getElementById("openModal").classList.remove("hidden");
}

async function confirmOpen() {

  const dias = parseInt(diasInput.value);

  if (!dias) return;

  await supabaseClient
    .from("items")
    .update({
      abierto: true,
      dias_caducidad: dias,
      fecha_caducidad: null
    })
    .eq("id", openItemId);

  document.getElementById("openModal").classList.add("hidden");
  diasInput.value = "";

  loadItems();
}


function closeOpenModal() {
  document.getElementById("openModal").classList.add("hidden");
}

function showTab(tabId) {

  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));

  document.getElementById(tabId).classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  event.currentTarget.classList.add("active");

  if (tabId === "calendarTab") {
    renderCalendar();
  }
}

function renderCalendar() {

  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const hoy = new Date();

  for (let i = 0; i < 7; i++) {

    const fecha = new Date();
    fecha.setDate(hoy.getDate() + i);

    const fechaISO = fecha.toISOString().split("T")[0];

    const dia = document.createElement("div");
    dia.className = "calendar-day";

    const mealsDia = meals.filter(m => m.fecha === fechaISO);

    dia.innerHTML = `
      <div class="day-header">
        ${fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}
      </div>

      <div class="day-content"></div>

      <button class="add-day-btn" onclick="openMealModal('${fechaISO}')">
        + Añadir comida
      </button>
    `;

    container.appendChild(dia);

    const cont = dia.querySelector(".day-content");

    mealsDia.forEach(m => {

      const el = document.createElement("div");
      el.className = "calendar-item";

      el.innerHTML = `
        <b>${m.items.nombre}</b>
        <small>${m.tipo || ""}</small>
      `;

      cont.appendChild(el);
    });
  }
}


function addToDay(dayIndex) {

  const nombre = prompt("¿Qué vas a comer?");

  if (!nombre) return;

  const div = document.getElementById("day-" + dayIndex);

  const item = document.createElement("div");
  item.className = "calendar-item";
  item.innerText = nombre;

  div.appendChild(item);
}







let selectedMealDate = null;

function openSelectFood(date) {

  selectedMealDate = date;

  const nombres = items.map(i => `${i.id}||${i.nombre}`);

  const seleccion = prompt(
    "Elige alimento:\n\n" +
    nombres.map(n => n.split("||")[1]).join("\n")
  );

  if (!seleccion) return;

  const item = items.find(i => i.nombre === seleccion);

  if (!item) return;

  assignMeal(item.id, date);
}

async function assignMeal(itemId, date) {

  await supabaseClient
    .from("items")
    .update({ meal_date: date })
    .eq("id", itemId);

  loadItems();
}
let selectedDate = null;

function openMealModal(date) {

  selectedDate = date;

  const modal = document.getElementById("mealModal");
  const list = document.getElementById("foodList");

  modal.classList.remove("hidden");

  // 🔥 ordenar por caducidad (SUGERENCIA INTELIGENTE)
  const sorted = [...items].sort((a, b) => {

    const da = diasRestantes(a);
    const db = diasRestantes(b);

    return da - db;
  });

  list.innerHTML = "";

  sorted.forEach(item => {

    const el = document.createElement("div");
    el.className = "food-option";

    const dias = diasRestantes(item);

    el.innerHTML = `
      <b>${item.nombre}</b>
      <small>${dias} días</small>
    `;

    el.onclick = () => selectMeal(item.id);

    list.appendChild(el);
  });
}


async function selectMeal(itemId) {

  const tipo = document.getElementById("mealType").value;

  await supabaseClient
    .from("meal_plan")
    .insert([{
      user_id: user.id,
      item_id: itemId,
      fecha: selectedDate,
      tipo: tipo
    }]);

  closeMealModal();
  loadItems();
}

function closeMealModal() {
  document.getElementById("mealModal").classList.add("hidden");
}




