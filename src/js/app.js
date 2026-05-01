
let items = [];

/* =========================
   RENDER
========================= */

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

  const wrapper = document.createElement("div");
  wrapper.className= 'swipe-wrapper';

  const bg = document.createElement('div');
  bg.className = "swipe-bg";
  bg.innerHTML = "<span>Eliminar</span>";


  const card= document.createElement("div");
  card.className = 'item';

  const fecha = item.fecha_caducidad
    ? new Date(item.fecha_caducidad).toLocaleDateString()
    : "Sin fecha";

  card.innerHTML = `
    <div class="item-name">${item.nombre}</div>
    <div class="item-date">${fecha}</div>
    <div class="item-cat">${getCatName(item.contenedor_id)}</div>
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


function addSwipe(wrapper,itemId){
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const card = wrapper.querySelector(".item");
  const bg = wrapper.querySelector(".swipe-bg");

  wrapper.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
  })

  wrapper.addEventListener("touchmove",(e)=>{
    if(!dragging) return;


    currentX = e.touches[0].clientX - startX;

    if(currentX < 0){
      card.style.transform = "translateX(" + currentX +"px)";

      let progress= Math.min(Math.abs(currentX) / 100,1);
      bg.syle.opacity = progress;
    }
  })



    wrapper.addEventListener("touchend", async()=>{
    
      dragging= false



    if(currentX < -120){
      card.style.transition = "transform 0.s ease";
      card.style.transition = "translateX(-100%)";


      bg.syle.opacity = 1;

      setTimeout(async()=>{
        await deleteItem(itemId);
        loadItems();
      }, 200)
    
    }else{     
       bg.syle.opacity = 0;

      card.style.transform= "translateX(0)"
    }

    currentX = 0


  })

}


async function deleteItem(id){
  const {error} = await supabaseClient
    .from('items')
    .delete()
    .eq("id", id);

    if(error){
      console.error("Error eliminando");
    }
}


function addSwipe(wrapper, itemId) {

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const card = wrapper.querySelector(".item");
  const bg = wrapper.querySelector(".swipe-bg");

  wrapper.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    card.style.transition = "none"; // sin lag
  });

  wrapper.addEventListener("touchmove", (e) => {

    if (!dragging) return;

    currentX = e.touches[0].clientX - startX;

    if (currentX < 0) {

      // mover tarjeta
      card.style.transform = `translateX(${currentX}px)`;

      // rojo progresivo
      const progress = Math.min(Math.abs(currentX) / 120, 1);
      bg.style.opacity = progress;
    }
  });

  wrapper.addEventListener("touchend", async () => {

    dragging = false;
    card.style.transition = "transform 0.2s ease";

    // 🔴 umbral tipo Gmail
    if (currentX < -120) {

      // animación completa
      card.style.transform = "translateX(-100%)";
      bg.style.opacity = 1;

      setTimeout(async () => {
        await deleteItem(itemId);
        loadItems();
      }, 200);

    } else {
      // volver a posición
      card.style.transform = "translateX(0)";
      bg.style.opacity = 0;
    }

    currentX = 0;
  });
}
