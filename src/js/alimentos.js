let secciones = {
    1: true,
    2: true,
    3: true
};
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
      cantidad:cantidad,
      fecha_caducidad: fecha.value || null,
      contenedor_id: selectedCat,
      abierto: false
    }]);

  cerrarModal();
  loadItems();
};

/* =========================
   LOAD DATA
========================= */

window.loadItems =  async function ()  {

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
    card.className = "alimento";

    const dias = item.fecha_caducidad
        ? diasRestantes(item)
        : "-";

        console.log("hola qu etal");
    card.innerHTML = `
        <div class="alimento-titulo">
            <h3>${item.nombre}</h3>

            <div class="acciones-alimento">

                <span
                    class="estado ${item.abierto ? "abierto" : "cerrado"}"
                    onclick="toggleEstado('${item.id}')">
                    ${item.abierto ? "Abierto" : "Cerrado"}
                </span>

                ${!esMovil() ? `
                    <button class="btn-eliminar" onclick="eliminarItem('${item.id}')">
                        x
                    </button>
                ` : ""}

            </div>
        </div>

        <div class="alimento-info">
            <span>${item.cantidad || 1} unidad${item.cantidad > 1 ? "es" : ""}</span>

            <div class="dias">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-calendar-days">
                    <path d="M8 2v4"/>
                    <path d="M16 2v4"/>
                    <rect width="18" height="18" x="3" y="4" rx="2"/>
                    <path d="M3 10h18"/>
                    <path d="M8 14h.01"/>
                    <path d="M12 14h.01"/>
                    <path d="M16 14h.01"/>
                    <path d="M8 18h.01"/>
                    <path d="M12 18h.01"/>
                    <path d="M16 18h.01"/>
                </svg>

                <span>${dias} días</span>
            </div>
        </div>
    `;

    wrapper.appendChild(bg);
    wrapper.appendChild(card);

    if (esMovil()) {
        addSwipe(wrapper, item.id);
    }

    return wrapper;
}
function getCatName(id) {
  if (id === 1) return "Nevera";
  if (id === 2) return "Congelador";
  return "Despensa";
}


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


let cantidad = 1;

function cambiarCantidad(valor){

    cantidad += valor;

    if(cantidad < 1){
        cantidad = 1;
    }

    document.getElementById("cantidad").textContent = cantidad;

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
    titulo.innerText = "Caducan pronto";
    titulo.style.color = "#ff3b30";

    lista.appendChild(titulo);

    urgentes.forEach(item => {
      const el = createItemElement(item);

el.querySelector(".alimento").classList.add("urgente");

lista.appendChild(el);
    });
  }

  // 📦 POR CONTENEDOR
  [1, 2, 3].forEach(cat => {

    const grupo = items
      .filter(i => i.contenedor_id === cat && !urgentes.includes(i))
      .sort((a, b) => new Date(a.fecha_caducidad || 999999999) - new Date(b.fecha_caducidad || 999999999));

    if (!grupo.length) return;

   const titulo = document.createElement("div");
titulo.className = "titulo-seccion";

const nombre =
    cat === 1 ? "Nevera" :
    cat === 2 ? "Congelador" :
    "Despensa";

titulo.innerHTML = `
    <span>${nombre}</span>
    <i data-lucide="${secciones[cat] ? "chevron-down" : "chevron-right"}" class="flecha"></i>
`;

titulo.onclick = () => toggleSeccion(cat);

    lista.appendChild(titulo);

    if(secciones[cat]){

    grupo.forEach(item=>{
        lista.appendChild(createItemElement(item));
    });

}
  });

  lucide.createIcons();
};




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
async function toggleEstado(id) {

    const item = items.find(i => i.id === id);

    if (!item) return;

    const { error } = await supabaseClient
        .from("items")
        .update({
            abierto: !item.abierto
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        return;
    }

    loadItems();
}

async function eliminarItem(id) {
    await deleteItem(id);
    loadItems();
}