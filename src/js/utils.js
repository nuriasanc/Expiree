
function diasRestantes(item) {

  if (item.abierto && item.dias_caducidad != null) {
    return item.dias_caducidad;
  }

  if (!item.fecha_caducidad) return 9999;

  return Math.ceil((new Date(item.fecha_caducidad) - new Date()) / 86400000);
}
