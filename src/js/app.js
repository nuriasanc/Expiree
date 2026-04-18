let items = [];
let categoria = "Despensa";

async function loadItems() {
  items = await getItems(user.id);
  render();
}

function diasRestantes(fecha) {
  if (!fecha) return 9999;
  return Math.ceil((new Date(fecha) - new Date()) / 86400000);
}

function render() {

  lista.innerHTML = "";

  let ordenados = [...items].sort((a, b) => {

    if (a.abierto !== b.abierto) {
      return b.abierto - a.abierto;
    }

    return new Date(a.fecha_caducidad || 999999999) - new Date(b.fecha_caducidad || 999999999);
  });

  [1,2,3].forEach(cat => {

    let grupo = ordenados.filter(i => i.contenedor_id === cat);
    if (!grupo.length) return;

    let titulo = document.createElement("h3");
    titulo.textContent = cat === 1 ? "Nevera" : cat === 2 ? "Congelador" : "Despensa";

    lista.appendChild(titulo);

    grupo.forEach(item=>{
      lista.appendChild(createItemElement(item));
    });

  });

  lucide.createIcons();
}

checkSession();