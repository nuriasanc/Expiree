
const nav = document.getElementById("nav");

/* =========================
   START APP
========================= */

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
   MODAL
========================= */

function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

/* =========================
   ADD ITEM
========================= */

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

  closeModal();

  nombre.value = "";
  fecha.value = "";
  qty.value = 1;

  loadItems();
}

/* =========================
   CATEGORY MAP
========================= */

function categoriaToId(cat) {
  if (cat === "Nevera") return 1;
  if (cat === "Congelador") return 2;
  return 3;
}

/* =========================
   MENU
========================= */

function toggleMenu() {
  document.getElementById("dropdown").classList.toggle("hidden");
}

/* =========================
   LOGOUT
========================= */

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}