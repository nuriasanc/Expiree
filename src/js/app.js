window.startApp = function () {

    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    loadItems();

}

async function init() {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {

        user = data.session.user;
        startApp();

    } else {

        mostrarLogin();

    }

}

init();
mostrarPantalla("alimentos");


