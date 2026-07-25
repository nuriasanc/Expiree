let user = null;

/* =========================
   MENSAJES
========================= */

function showError(msg) {

    const error = document.getElementById("authError");

    if (error) {
        error.innerText = msg;
    }

}

/* =========================
   SIGNUP
========================= */

async function signup() {

    showError("");

    const mail = email.value.trim().toLowerCase();
    const pass = password.value.trim();

    if (!mail || !pass) {
        showError("Completa todos los campos");
        return;
    }

    const { error } = await supabaseClient.auth.signUp({
        email: mail,
        password: pass
    });

    if (error) {
        showError(error.message);
        return;
    }

    showError("Cuenta creada. Ya puedes iniciar sesión.");

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
   LOGOUT
========================= */

async function logout() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error(error);
    }

}

/* =========================
   MOSTRAR LOGIN
========================= */

function mostrarLogin() {

    const login = document.getElementById("login");
    const app = document.getElementById("app");

    if (login) login.classList.remove("hidden");
    if (app) app.classList.add("hidden");

}

/* =========================
   LISTENER SUPABASE
========================= */

supabaseClient.auth.onAuthStateChange((event, session) => {

    if (session) {

        user = session.user;
        startApp();

    } else {

        user = null;
        mostrarLogin();

    }

});