
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
function actualizarUI(){

    if(user){

        document.getElementById("menu").style.display = "none";

    }else{

        document.getElementById("menu").style.display = "block";

    }

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




function toggleSeccion(cat){

    secciones[cat] = !secciones[cat];

    render();
}