function startApp() {

  auth.classList.add("hide");

  setTimeout(() => {
    auth.style.display = "none";

    app.classList.remove("hidden");
    nav.classList.remove("hidden");

    app.classList.add("show");
    nav.classList.add("show");

  }, 300);

  loadItems();
}

/* MODAL CREAR */
function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

/* AÑADIR ITEM */
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

/* MAP */
function categoriaToId(cat) {
  if (cat === "Nevera") return 1;
  if (cat === "Congelador") return 2;
  return 3;
}