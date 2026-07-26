const DELETE_DISTANCE = 180; // antes 120

function esMovil() {
  return window.matchMedia("(max-width: 768px)").matches;
}


function addSwipe(wrapper, itemId) {

  if (!esMovil()) return;

  let moved = false;
  let startX = 0;
  let currentX = 0;
  let dragging = false;
  let touchTarget = null;


  const card = wrapper.querySelector(".alimento");
  const bg = wrapper.querySelector(".swipe-bg");


  wrapper.addEventListener("touchstart", (e) => {

    touchTarget = e.target;

    // Si toca botones o estado, no editar ni swipe
    if (
      touchTarget.closest(".estado") ||
      touchTarget.closest(".btn-eliminar")
    ) {
      return;
    }


    startX = e.touches[0].clientX;
    dragging = true;
    moved = false;

    card.style.transition = "none";

  });


  wrapper.addEventListener("touchmove", (e) => {

    if (!dragging) return;
    if (Math.abs(currentX) > 10) {
      moved = true;
    }

    currentX = e.touches[0].clientX - startX;


    if (currentX > 0) return;

    const offset = Math.max(currentX, -140);

    card.style.transform = `translateX(${offset}px)`;


    bg.style.background = "#d94a4a";
    bg.style.opacity =
      Math.min(Math.abs(currentX) / DELETE_DISTANCE, 1);

    bg.innerHTML =
      Math.abs(currentX) > 80
        ? "Eliminar"
        : "";
  });


  wrapper.addEventListener("touchend", async () => {


    // Si venía de un botón no hacemos nada
    if (
      touchTarget &&
      (
        touchTarget.closest(".estado") ||
        touchTarget.closest(".btn-eliminar")
      )
    ) {
      return;
    }


    dragging = false;


    card.style.transition =
      "transform .2s ease";


    // toque normal -> editar
    if (!moved) {

      abrirEditar(itemId);

      return;
    }


    // deslizar suficiente -> borrar
    if (currentX < -DELETE_DISTANCE) {

      card.style.transition = "transform .35s ease, opacity .35s ease";

      card.style.transform = "translateX(-120%) scale(.95)";
      card.style.opacity = "0";

      wrapper.style.height = wrapper.offsetHeight + "px";

      setTimeout(() => {

        wrapper.style.transition = "height .3s ease, margin .3s ease";
        wrapper.style.height = "0px";
        wrapper.style.marginBottom = "0px";

      }, 250);


      setTimeout(async () => {

        await deleteItem(itemId);
        loadItems();

      }, 550);

      return;
    }


    // volver
    card.style.transform = "translateX(0)";
    bg.style.opacity = 0;
    bg.innerHTML = "";

    currentX = 0;
    moved = false;

  });

}