let selectedDay = null;

function selectDay(day) {
  selectedDay = day;
  renderCalendar();
}

function renderCalendar() {

  let cont = document.getElementById("calendarList");
  cont.innerHTML = "";

  items.forEach(item => {

    let div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <b>${item.nombre}</b>
      <div>${item.plan === selectedDay ? "Asignado" : ""}</div>
    `;

    div.onclick = async () => {
      await updateItemDB(item.id, { plan: selectedDay });
      loadItems();
    };

    cont.appendChild(div);
  });
}