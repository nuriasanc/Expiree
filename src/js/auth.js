let user = null;

async function signup() {
  let { error } = await supabaseClient.auth.signUp({
    email: email.value,
    password: password.value
  });

  if (error) alert(error.message);
  else alert("Cuenta creada, ahora inicia sesión");
}

async function login() {

  authError.innerText = "";

  let { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.value,
    password: password.value
  });

  if (error) {
    authError.innerText = "Email o contraseña incorrectos";
    return;
  }

  auth.classList.add("hide"); // 👈 animación iOS

  setTimeout(() => {
    user = data.user;
    startApp();
  }, 300);
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