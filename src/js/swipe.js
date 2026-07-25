function esMovil() {
    return window.matchMedia("(max-width: 768px)").matches;
}


/* =========================
   SWIPE
========================= */

function addSwipe(wrapper, itemId) {
  if (!esMovil()) return;
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const card = wrapper.querySelector(".item");
  const bg = wrapper.querySelector(".swipe-bg");

  wrapper.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    dragging = true;
    card.style.transition = "none";
  });

  wrapper.addEventListener("touchmove", (e) => {

    if (!dragging) return;

    currentX = e.touches[0].clientX - startX;

    const item = items.find(i => i.id === itemId);

    if (currentX < 0) {
      card.style.transform = `translateX(${currentX}px)`;
      bg.style.background = "#ff3b30";
      bg.innerText = "Eliminar";
      bg.style.opacity = Math.min(Math.abs(currentX) / 120, 1);
    }

    if (currentX > 0) {
      card.style.transform = `translateX(${currentX}px)`;

      if (item.abierto) {
        bg.innerText = "Cerrar";
        bg.style.background = "#ff9500";
      } else {
        bg.innerText = "Abrir";
        bg.style.background = "#34c759";
      }

      bg.style.opacity = Math.min(currentX / 120, 1);
    }
  });

  wrapper.addEventListener("touchend", async () => {

    dragging = false;
    card.style.transition = "transform 0.2s ease";

    const item = items.find(i => i.id === itemId);

    if (currentX < -120) {

      card.style.transform = "translateX(-100%)";

      setTimeout(async () => {
        await deleteItem(itemId);
        loadItems();
      }, 200);

      return;
    }

    if (currentX > 120) {

      if (item.abierto) {
        await closeItem(itemId);
      } else {
        openOpenModal(itemId);
      }

      card.style.transform = "translateX(0)";
      bg.style.opacity = 0;
      return;
    }

    card.style.transform = "translateX(0)";
    bg.style.opacity = 0;

    currentX = 0;
  });
}
