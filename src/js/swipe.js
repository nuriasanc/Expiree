function applySwipe(div, item) {

  let startX = 0;
  let currentX = 0;

  let bg = document.createElement("div");
  bg.className = "swipe-bg";
  div.appendChild(bg);

  div.addEventListener("touchstart", e=>{
    startX = e.touches[0].clientX;
  });

  div.addEventListener("touchmove", e=>{
    currentX = e.touches[0].clientX - startX;

    div.style.transform = `translateX(${currentX}px)`;

    if (currentX < 0) {
      bg.style.background = "#ff3b30";
      bg.innerText = "Eliminar";
    } else {
      bg.style.background = "#007aff";
      bg.innerText = "Abrir";
    }
  });

  div.addEventListener("touchend", async ()=>{

    if (currentX < -80) {
      await deleteItemDB(item.id);
      loadItems();
    }

    if (currentX > 80) {
      openOpenModal(item.id);
    }

    div.style.transform = "translateX(0)";
    bg.innerText = "";
  });
}

let editItem = null;
let editCantidad = 1;

function openEditModal(item) {
  editItem = item;

  editNombre.value = item.nombre;
  editCantidad = item.cantidad || 1;

  editQtyValue.innerText = editCantidad;

  editModal.classList.remove("hidden");
}

function editQty(n) {
  editCantidad = Math.max(1, editCantidad + n);
  editQtyValue.innerText = editCantidad;
}

async function saveEdit() {

  await supabaseClient
    .from("items")
    .update({
      nombre: editNombre.value,
      cantidad: editCantidad
    })
    .eq("id", editItem.id);

  editModal.classList.add("hidden");
  loadItems();
}
