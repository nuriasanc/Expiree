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


  wrapper.addEventListener("touchstart", (e)=>{

    touchTarget = e.target;

    // Si toca botones o estado, no editar ni swipe
    if(
      touchTarget.closest(".estado") ||
      touchTarget.closest(".btn-eliminar")
    ){
      return;
    }


    startX = e.touches[0].clientX;
    dragging = true;
    moved = false;

    card.style.transition = "none";

  });


  wrapper.addEventListener("touchmove", (e)=>{

    if(!dragging) return;


    moved = true;


    currentX = e.touches[0].clientX - startX;


    if(currentX > 0) return;


    card.style.transform =
        `translateX(${currentX}px)`;


    bg.style.background = "#ff3b30";
    bg.style.opacity =
        Math.min(Math.abs(currentX) / 120, 1);

    bg.innerHTML = "Eliminar";

  });


  wrapper.addEventListener("touchend", async ()=>{


    // Si venía de un botón no hacemos nada
    if(
      touchTarget &&
      (
        touchTarget.closest(".estado") ||
        touchTarget.closest(".btn-eliminar")
      )
    ){
      return;
    }


    dragging = false;


    card.style.transition =
        "transform .2s ease";


    // toque normal -> editar
    if(!moved){

      abrirEditar(itemId);

      return;
    }


    // deslizar suficiente -> borrar
    if(currentX < -120){


      card.style.transform =
          "translateX(-120%)";


      setTimeout(async()=>{

        await deleteItem(itemId);
        loadItems();

      },200);


      return;
    }



    // volver
    card.style.transform = "translateX(0)";
    bg.style.opacity = 0;


    currentX = 0;
    moved = false;

  });

}