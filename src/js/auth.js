let user = null;

function showError(msg) {
  authError.innerText = msg;
}

/* CREAR CUENTA */
async function signup() {

  showError("");

  if (!email.value || !password.value) {
    showError("Debes completar email y contraseña");
    return;
  }

  let { error } = await supabaseClient.auth.signUp({
    email: email.value,
    password: password.value
  });

  if (error) {
    showError(error.message);
  } else {
    showError("Cuenta creada. Ahora inicia sesión");
  }
}

/* LOGIN */
async function login() {

  showError("");

  if (!email.value || !password.value) {
    showError("Debes completar email y contraseña");
    return;
  }

  let { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    showError("Email o contraseña incorrectos");
    return;
  }

  user = data.user;
  startApp();
}

async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    user = data.session.user;
    startApp();
  }
}

checkSession();

supabaseClient.auth.onAuthStateChange((event, session) => {

  if (session) {
    user = session.user;
    startApp();
  }

  if (event === "SIGNED_OUT") {
    location.reload();
  }
});