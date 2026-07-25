let items = [];
let meals = [];
let selectedCat = null;
let qty = 1;
let openItemId = null;
let selectedDate = null;

/* =========================
   UTIL
========================= */

function diasRestantes(item) {

  if (item.abierto && item.dias_caducidad != null) {
    return item.dias_caducidad;
  }

  if (!item.fecha_caducidad) return 9999;

  return Math.ceil((new Date(item.fecha_caducidad) - new Date()) / 86400000);
}

/* =========================
   RENDER
========================= */

window.render = function () {

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  // 🔴 URGENTES
  const urgentes = items
    .filter(i => i.fecha_caducidad && diasRestantes(i) <= 4)
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
   MODAL ADD
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
   LOAD DATA
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

  const meal = meals.find(m => m.item_id === item.id);

  const mealText = meal
    ? `📅 ${new Date(meal.fecha).toLocaleDateString("es-ES", { weekday: "short" })}`
    : "";

  card.innerHTML = `
    <div class="item-name">${item.nombre} (${item.cantidad || 1})</div>
    <div class="item-date">${fecha}</div>
    <div class="item-cat">${getCatName(item.contenedor_id)}</div>
    <div class="item-status">${item.abierto ? "🟢 Abierto" : "🔒 Cerrado"}</div>
    ${mealText ? `<div class="item-meal">${mealText}</div>` : ""}
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

/* =========================
   DELETE
========================= */

async function deleteItem(id) {
  await supabaseClient.from('items').delete().eq("id", id);
}

/* =========================
   CLOSE ITEM
========================= */

async function closeItem(id) {

  await supabaseClient
    .from("items")
    .update({
      abierto: false,
      dias_caducidad: null
    })
    .eq("id", id);

  loadItems();
}

/* =========================
   QTY
========================= */

function changeQty(n) {
  qty = Math.max(1, qty + n);
  document.getElementById("qtyValue").innerText = qty;
}

/* =========================
   OPEN ITEM MODAL
========================= */

const modal = document.getElementById("modal");

function abrirModal(){
    modal.classList.remove("hidden");
}

function cerrarModal(){
    modal.classList.add("hidden");
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

  closeOpenModal();
  diasInput.value = "";

  loadItems();
}

/* =========================
   TABS
========================= */

function showTab(tabId) {

  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));

  document.getElementById(tabId).classList.remove("hidden");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  event.currentTarget.classList.add("active");

  if (tabId === "calendarTab") {
    renderCalendar();
  }
}

/* =========================
   CALENDAR
========================= */

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

/* =========================
   MEAL MODAL
========================= */

function openMealModal(date) {

  selectedDate = date;

  const modal = document.getElementById("mealModal");
  const list = document.getElementById("foodList");

  modal.classList.remove("hidden");

  const sorted = [...items].sort((a, b) => diasRestantes(a) - diasRestantes(b));

  list.innerHTML = "";

  sorted.forEach(item => {

    const el = document.createElement("div");
    el.className = "food-option";

    el.innerHTML = `
      <b>${item.nombre}</b>
      <small>${diasRestantes(item)} días</small>
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
