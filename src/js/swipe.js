const DELETE_DISTANCE = 180;
const TAP_TOLERANCE = 8;

function esMovil() {
    return window.matchMedia("(max-width: 768px)").matches;
}

function addSwipe(wrapper, itemId) {

    if (!esMovil()) return;

    let startX = 0;
    let startY = 0;

    let currentX = 0;

    let moved = false;
    let dragging = false;
    let isScrolling = false;

    let touchTarget = null;

    const card = wrapper.querySelector(".alimento");
    const bg = wrapper.querySelector(".swipe-bg");

    wrapper.addEventListener("touchstart", (e) => {

        touchTarget = e.target;

        if (
            touchTarget.closest(".estado") ||
            touchTarget.closest(".btn-eliminar")
        ) {
            return;
        }

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        currentX = 0;

        moved = false;
        dragging = true;
        isScrolling = false;

        card.style.transition = "none";

    });

    wrapper.addEventListener("touchmove", (e) => {

        if (!dragging) return;

        const diffX = e.touches[0].clientX - startX;
        const diffY = e.touches[0].clientY - startY;

        // Si el movimiento es más vertical que horizontal,
        // dejamos que el scroll funcione normalmente.
        if (Math.abs(diffY) > Math.abs(diffX)) {

            isScrolling = true;
            dragging = false;

            card.style.transform = "translateX(0)";
            bg.style.opacity = 0;
            bg.innerHTML = "";

            return;
        }

        currentX = diffX;

        if (Math.abs(currentX) > TAP_TOLERANCE) {
            moved = true;
        }

        if (currentX > 0) return;

        const offset = Math.max(currentX, -140);

        card.style.transform = `translateX(${offset}px)`;

        bg.style.background = "#d94a4a";
        bg.style.opacity = Math.min(Math.abs(currentX) / DELETE_DISTANCE, 1);

        bg.innerHTML =
            Math.abs(currentX) > 80
                ? "Eliminar"
                : "";
    });

    wrapper.addEventListener("touchend", async () => {

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

        card.style.transition = "transform .2s ease";

        // Scroll vertical: no hacer absolutamente nada.
        if (isScrolling) {
            return;
        }

        // Toque normal.
        if (!moved && Math.abs(currentX) < TAP_TOLERANCE) {
            abrirEditar(itemId);
            return;
        }

        // Eliminar.
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

        // Volver a la posición inicial.
        card.style.transform = "translateX(0)";
        bg.style.opacity = 0;
        bg.innerHTML = "";

        currentX = 0;
        moved = false;

    });

}