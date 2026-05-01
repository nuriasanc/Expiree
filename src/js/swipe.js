function applySwipe(div, item) {

  let startX = 0;
  let currentX = 0;
  let dragging = false;

  // 👉 fondo
  let bg = document.createElement("div");
  bg.className = "swipe-bg";
  div.appendChild(bg);

  /* =========================
     TOUCH START
  ========================= */
  div.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    dragging = true;
    div.style.transition = "none";
  });

  /* =========================
     TOUCH MOVE
  ========================= */
  div.addEventListener("touchmove", e => {

    if (!dragging) return;

    currentX = e.touches[0].clientX - startX;

    div.style.transform = `translateX(${currentX}px)`;

    // 👉 IZQUIERDA = ELIMINAR
    if (currentX < 0) {
      bg.style.background = "#ff3b30";
      bg.innerText = "Eliminar";

      bg.style.opacity = Math.min(Math.abs(currentX) / 120, 1);
    }

    // 👉 DERECHA = ABRIR
    if (currentX > 0) {
      bg.style.background = "#34c759";
      bg.innerText = "Abrir";

      bg.style.opacity = Math.min(currentX / 120, 1);
    }
  });

  /* =========================
     TOUCH END
  ========================= */
  div.addEventListener("touchend", async () => {

    dragging = false;
    div.style.transition = "transform 0.2s ease";

    // 🔴 ELIMINAR
    if (currentX < -120) {

      div.style.transform = "translateX(-100%)";

      setTimeout(async () => {
        await deleteItemDB(item.id);
        loadItems();
      }, 200);

      return;
    }

    // 🟢 ABRIR
    if (currentX > 120) {

      openOpenModal(item.id);

      div.style.transform = "translateX(0)";
      bg.style.opacity = 0;

      return;
    }

    // 👉 volver a sitio
    div.style.transform = "translateX(0)";
    bg.style.opacity = 0;
    bg.innerText = "";

    currentX = 0;
  });
}
