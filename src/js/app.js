
let items = [];

/* =========================
   RENDER
========================= */

window.render = function () {

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let ordenados = [...items].sort((a, b) => {

    const aDate = a.fecha_caducidad ? new Date(a.fecha_caducidad) : new Date(999999999999);
    const bDate = b.fecha_caducidad ? new Date(b.fecha_caducidad) : new Date(999999999999);

    return aDate - bDate;
  });

  ordenados.forEach(item => {
    lista.appendChild(createItemElement(item));
  });
}

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


let selectedCat = null;

/* abrir modal */
function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

/* cerrar modal */
function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  clearModal();
}

/* limpiar */
function clearModal() {
  nombre.value = "";
  fecha.value = "";
  selectedCat = null;
  document.querySelectorAll(".cat").forEach(c => c.classList.remove("selected"));
  document.getElementById("modalError").innerText = "";
}

/* seleccionar categoría */
function setCat(id) {

  selectedCat = id;

  document.querySelectorAll(".cat").forEach(c => c.classList.remove("selected"));

  document.getElementById("cat" + id).classList.add("selected");
}

window.saveItem = async function () {

  console.log("CLICK GUARDAR");

  const { data, error } = await supabaseClient
    .from("items")
    .insert([{
      user_id: user.id,
      nombre: nombre.value.trim(),
      cantidad:  1,
      fecha_caducidad: fecha.value || null,
      contenedor_id: selectedCat,
      abierto: false
    }])
    .select();

  console.log("RESULTADO:", data);
  console.log("ERROR:", error);

  if (error) {
    alert("ERROR: " + error.message);
    return;
  }

  closeModal();
  loadItems();
};
async function loadItems() {

  const { data, error } = await supabaseClient
    .from("items")
    .select(`
      *,
      contenedores (nombre)
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  items = data || [];
  render();
}
function createItemElement(item) {

  const div = document.createElement("div");
  div.className = "item";

  const fecha = item.fecha_caducidad
    ? new Date(item.fecha_caducidad).toLocaleDateString()
    : "Sin fecha";

  div.innerHTML = `
    <div class="item-name">${item.nombre}</div>
    <div class="item-date">${fecha}</div>
    <div class="item-cat">${getCatName(item.contenedor_id)}</div>
  `;

  return div;
}

function getCatName(id) {
  if (id === 1) return "Nevera";
  if (id === 2) return "Congelador";
  return "Despensa";
}