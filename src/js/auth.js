
let user = null;

function showError(msg) {
  document.getElementById("authError").innerText = msg;
}

/* =========================
   SIGNUP
========================= */

async function signup() {

  const mail = email.value.trim().toLowerCase();
  const pass = password.value.trim();

  if (!mail || !pass) {
    showError("Faltan datos");
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email: mail,
    password: pass
  });

  if (error) {
    showError(error.message);
  } else {
    showError("Cuenta creada. Inicia sesión");
  }
}

/* =========================
   LOGIN
========================= */

async function login() {

  showError("");

  const mail = email.value.trim();
  const pass = password.value.trim();

  if (!mail || !pass) {
    showError("Completa email y contraseña");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: mail,
    password: pass
  });

  if (error) {
    showError("Email o contraseña incorrectos");
    return;
  }

  user = data.user;
  startApp();
}

/* =========================
   LISTENER SUPABASE
========================= */

supabaseClient.auth.onAuthStateChange((event, session) => {

  if (session) {
    user = session.user;
    startApp();
  }

  if (event === "SIGNED_OUT") {
    location.reload();
  }
});
