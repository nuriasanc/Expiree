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
      cantidad: cantidad,
      fecha_caducidad: fecha.value || null,
      contenedor_id: selectedCat,
      abierto: false
    }]);

  cerrarModal();
  loadItems();
};
function mismaFecha(fecha1, fecha2){

    return new Date(fecha1).toISOString().slice(0,10) === 
           new Date(fecha2).toISOString().slice(0,10);

}


/* =========================
   LOAD DATA
========================= */

window.loadItems = async function () {

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
  card.onclick = () => abrirEditar(item.id);

  const dias = item.fecha_caducidad
    ? diasRestantes(item)
    : "-";

card.innerHTML = `
    <div class="alimento-titulo">
        <h3>${item.nombre}</h3>

        <div class="acciones-alimento">

            ${getPrimerDiaComida(item.id)
                ? `
                    <span class="badge-comida">
                        ${getPrimerDiaComida(item.id)}
                    </span>
                  `
                : ""
            }

            <span
                class="estado ${item.abierto ? "abierto" : "cerrado"}"
                onclick="event.stopPropagation(); toggleEstado('${item.id}')">
                ${item.abierto ? "Abierto" : "Cerrado"}
            </span>

            ${!esMovil() ? `
                <button
                    class="btn-eliminar"
                    onclick="event.stopPropagation(); eliminarItem('${item.id}')">
                    x
                </button>
            ` : ""}

        </div>
    </div>

    <div class="alimento-info">
        <span>${item.cantidad || 1} unidad${item.cantidad > 1 ? "es" : ""}</span>

        ${dias !== "-" ? `
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
` : ""}
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

function cambiarCantidad(valor) {

  cantidad += valor;

  if (cantidad < 1) {
    cantidad = 1;
  }

  document.getElementById("cantidad").textContent = cantidad;

}


/* =========================
   MEAL MODAL
========================= */
async function openMealModal(date) {

    selectedDate = date;

    const modal = document.getElementById("mealModal");
    const list = document.getElementById("foodList");

    modal.classList.remove("hidden");

    list.innerHTML = "";


    const { data: mealsData } = await supabaseClient
        .from("meal_plan")
        .select(`
            *,
            items(*)
        `)
        .eq("user_id", user.id);


    meals = mealsData || [];


    items.forEach(item => {


        const comida = meals.find(m =>
            m.item_id == item.id &&
            mismaFecha(m.fecha, selectedDate)
        );

        const seleccionado = !!comida;


        const el = document.createElement("div");

        el.className = "food-option";


        if(seleccionado){
            el.classList.add("seleccionado");
        }


        el.innerHTML = `
            <div>
                <b>${item.nombre}</b>
                <small>${getCatName(item.contenedor_id)}</small>
            </div>

            <span class="check">
                ${seleccionado ? "✓" : ""}
            </span>
        `;


        el.onclick = async ()=>{


            if(comida){

                await supabaseClient
                .from("meal_plan")
                .delete()
                .eq("id", comida.id);


            }else{


                await supabaseClient
                .from("meal_plan")
                .insert([{
                    user_id:user.id,
                    item_id:item.id,
                    fecha:selectedDate,
                    tipo:document.getElementById("mealType").value
                }]);

            }


            await loadItems();

            openMealModal(selectedDate);

        };


        list.appendChild(el);

    });

}

function crearOpcionComida(item, listaGrupo, usados, seleccionados){

    const usado = usados[item.id] || 0;
    const disponible = (item.cantidad || 1) - usado;

    const div = document.createElement("div");
    div.className = "opcion-comida";

    div.innerHTML = `
        <span>
            ${item.nombre}
            <small class="cantidad-disponible">
                (${Math.max(disponible,0)} disponibles)
            </small>
        </span>

        <input type="checkbox">
    `;

    const check = div.querySelector("input");

    if(seleccionados.includes(item.id)){
        check.checked = true;
        div.classList.add("seleccionado");
    }

    check.onchange = ()=>{

        if(check.checked){

            if(!alimentosSeleccionados.includes(item.id)){
                alimentosSeleccionados.push(item.id);
            }

            div.classList.add("seleccionado");

        }else{

            alimentosSeleccionados =
                alimentosSeleccionados.filter(id=>id!==item.id);

            div.classList.remove("seleccionado");
        }

    };

    listaGrupo.appendChild(div);

}



function closeMealModal() {
  document.getElementById("mealModal").classList.add("hidden");
}


/* =========================
   RENDER
========================= */

function ordenarPorCaducidad(a, b) {

    // Sin fecha siempre al final
    if (!a.fecha_caducidad && !b.fecha_caducidad) return 0;
    if (!a.fecha_caducidad) return 1;
    if (!b.fecha_caducidad) return -1;

    return new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad);
}

window.render = function () {

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  // 🔴 URGENTES
  const urgentes = items
    .filter(i => i.fecha_caducidad && diasRestantes(i) <= 4)
    .sort(ordenarPorCaducidad);

  if (urgentes.length) {

    const titulo = document.createElement("h3");
    titulo.innerText = "Caducan pronto";
    titulo.style.color = "#d94a4a";

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
      .sort(ordenarPorCaducidad);

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

    if (secciones[cat]) {

      grupo.forEach(item => {
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

async function abrirComida(fecha, nombreDia){

    const usados = await obtenerUsados();

    diaSeleccionado = fecha;
    alimentosSeleccionados = [];

    const { data: comidasDia } = await supabaseClient
        .from("meal_plan")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("fecha", fecha);

    const seleccionados = comidasDia
        ? comidasDia.map(c => c.item_id)
        : [];

    alimentosSeleccionados = [...seleccionados];

    document.getElementById("tituloDiaComida").innerText = nombreDia;

    const lista = document.getElementById("listaAlimentosComida");
    lista.innerHTML = "";

    const grupos = {
        1:{nombre:"Nevera"},
        2:{nombre:"Congelador"},
        3:{nombre:"Despensa"}
    };

    // =====================
    // CADUCAN PRONTO
    // =====================

    const urgentes = items.filter(item=>{

        if(
            !item.fecha_caducidad ||
            diasRestantes(item) > 4
        ){
            return false;
        }

        const usado = usados[item.id] || 0;

        const disponible =
            (item.cantidad || 1) - usado;

        return disponible > 0 || seleccionados.includes(item.id);

    });

    if(urgentes.length){

        const grupo=document.createElement("div");
        grupo.className="grupo-comida";

        const titulo=document.createElement("div");
        titulo.className="titulo-grupo urgente";
        titulo.innerHTML="Caducan pronto";

        const listaGrupo=document.createElement("div");
        listaGrupo.className="lista-grupo";

        urgentes.forEach(item=>{
            crearOpcionComida(
                item,
                listaGrupo,
                usados,
                seleccionados
            );
        });

        grupo.appendChild(titulo);
        grupo.appendChild(listaGrupo);

        lista.appendChild(grupo);

    }

    // =====================
    // RESTO POR CONTENEDOR
    // =====================

    [1,2,3].forEach(cat=>{

        const alimentos = items.filter(i=>{

            if(
                i.fecha_caducidad &&
                diasRestantes(i)<=4
            ){
                return false;
            }

            if(i.contenedor_id!==cat){
                return false;
            }

            const usado = usados[i.id] || 0;

            const disponible =
                (i.cantidad || 1) - usado;

            return disponible > 0 || seleccionados.includes(i.id);

        });

        if(!alimentos.length) return;

        const grupo=document.createElement("div");
        grupo.className="grupo-comida";

        const titulo=document.createElement("div");
        titulo.className="titulo-grupo";

        titulo.innerHTML=`
            <span>${grupos[cat].nombre}</span>
            <span>${categoriasComida[cat] ? "⌄" : "›"}</span>
        `;

        const listaGrupo=document.createElement("div");
        listaGrupo.className="lista-grupo";

        if(!categoriasComida[cat]){
            listaGrupo.style.display="none";
        }

        alimentos.forEach(item=>{

            crearOpcionComida(
                item,
                listaGrupo,
                usados,
                seleccionados
            );

        });

        titulo.onclick=()=>{

            categoriasComida[cat]=
                !categoriasComida[cat];

            listaGrupo.style.display =
                categoriasComida[cat]
                ? "block"
                : "none";

            titulo.lastElementChild.innerText =
                categoriasComida[cat]
                ? "⌄"
                : "›";

        };

        grupo.appendChild(titulo);
        grupo.appendChild(listaGrupo);

        lista.appendChild(grupo);

    });

    document
        .getElementById("modalComida")
        .classList.remove("hidden");
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

let itemEditando = null;
let cantidadEditar = 1;


function abrirEditar(id) {

  const item = items.find(i => i.id === id);

  if (!item) return;


  itemEditando = id;

  cantidadEditar = item.cantidad || 1;


  document.getElementById("editarNombre").value = item.nombre;

  document.getElementById("editarFecha").value =
    item.fecha_caducidad || "";


  document.getElementById("editarCantidad").textContent =
    cantidadEditar;


  document
    .getElementById("modalEditar")
    .classList.remove("hidden");
}



function cambiarCantidadEditar(valor) {

  cantidadEditar += valor;


  if (cantidadEditar < 1) {
    cantidadEditar = 1;
  }


  document.getElementById("editarCantidad").textContent =
    cantidadEditar;
}



function cerrarEditar() {

  document
    .getElementById("modalEditar")
    .classList.add("hidden");

}



async function guardarEditar() {


  const nombreNuevo =
    document.getElementById("editarNombre").value.trim();


  const fechaNueva =
    document.getElementById("editarFecha").value;



  if (!nombreNuevo) return;



  await supabaseClient
    .from("items")
    .update({

      nombre: nombreNuevo,

      cantidad: cantidadEditar,

      fecha_caducidad: fechaNueva || null

    })
    .eq("id", itemEditando);



  cerrarEditar();

  loadItems();

}

function getPrimerDiaComida(itemId) {

  const comidas = meals
    .filter(m => m.item_id === itemId)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));


  if (!comidas.length) return null;


  const fecha = new Date(comidas[0].fecha);


  return fecha.toLocaleDateString("es-ES", {
    weekday: "long"
  })
    .replace(/^./, letra => letra.toUpperCase());

}