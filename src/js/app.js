
let items = [];

/* =========================
   LOAD ITEMS
========================= */

async function loadItems() {
  if (!user) return;

  items = await getItems(user.id);
  render();
}

/* =========================
   RENDER
========================= */

window.render = function () {

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  let ordenados = [...items].sort((a, b) => {

    if (a.abierto !== b.abierto) {
      return b.abierto - a.abierto;
    }

    return new Date(a.fecha_caducidad || 999999999) - new Date(b.fecha_caducidad || 999999999);
  });

  [1, 2, 3].forEach(cat => {

    let grupo = ordenados.filter(i => i.contenedor_id === cat);
    if (!grupo.length) return;

    let titulo = document.createElement("h3");
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