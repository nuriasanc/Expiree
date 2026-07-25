function esMovil() {
    return window.matchMedia("(max-width: 768px)").matches;
}
function addSwipe(wrapper, itemId) {

    if (!esMovil()) return;

    let startX = 0;
    let currentX = 0;
    let dragging = false;

    const card = wrapper.querySelector(".alimento");
    const bg = wrapper.querySelector(".swipe-bg");

    wrapper.addEventListener("touchstart", (e) => {

        startX = e.touches[0].clientX;
        dragging = true;

        card.style.transition = "none";
    });

    wrapper.addEventListener("touchmove", (e) => {

        if (!dragging) return;

        currentX = e.touches[0].clientX - startX;

        // Solo permitir deslizar hacia la izquierda
        if (currentX > 0) return;

        card.style.transform = `translateX(${currentX}px)`;

        bg.style.background = "#ff3b30";
        bg.style.opacity = Math.min(Math.abs(currentX) / 120, 1);
        bg.innerHTML = "Eliminar";
    });

    wrapper.addEventListener("touchend", async () => {

        dragging = false;

        card.style.transition = "transform .2s ease";

        // Si ha deslizado suficiente, eliminar
        if (currentX < -120) {

            card.style.transform = "translateX(-120%)";

            setTimeout(async () => {

                await deleteItem(itemId);
                loadItems();

            }, 200);

            return;
        }

        // Volver a la posición original
        card.style.transform = "translateX(0)";
        bg.style.opacity = "0";

        currentX = 0;
    });
}