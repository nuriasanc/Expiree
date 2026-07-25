
let diaSeleccionado = null;
let alimentosSeleccionados = [];

let categoriasComida = {
    1:true,
    2:true,
    3:true
};

async function obtenerUsados(){

    const {data} = await supabaseClient
        .from("meal_plan")
        .select("item_id")
        .eq("user_id", user.id);


    const usados={};


    data?.forEach(x=>{

        if(!usados[x.item_id]){
            usados[x.item_id]=0;
        }

        usados[x.item_id]++;

    });


    return usados;

}

async function cargarSemana(){

    const contenedor = document.getElementById("semanaLista");

    contenedor.innerHTML = "";


    const hoy = new Date();


    // cargar comidas guardadas
    const { data: comidas } = await supabaseClient
        .from("meal_plan")
        .select(`
            fecha,
            items (
                nombre
            )
        `)
        .eq("user_id", user.id);



    for(let i = 0; i < 7; i++){

        const fecha = new Date();

        fecha.setDate(hoy.getDate() + i);


        const diaISO = fecha.toISOString().split("T")[0];


        const dia = fecha.toLocaleDateString("es-ES",{
            weekday:"long"
        });


        const numero = fecha.toLocaleDateString("es-ES",{
            day:"numeric",
            month:"short"
        });



        // buscar comidas de ese día

        const comidasDia = comidas?.filter(c => 
            c.fecha === diaISO
        ) || [];



        let listaComidas = "";


        if(comidasDia.length){

            listaComidas = comidasDia.map(c=>`

                <div class="comida-item">

                    ${c.items.nombre}

                </div>

            `).join("");


        }else{

            listaComidas = `
                <span class="sin-comidas">
                    Sin comidas
                </span>
            `;

        }



        const div=document.createElement("div");

        div.className="dia-semana";


        div.onclick = () => abrirComida(diaISO,dia);



        div.innerHTML=`

            <div class="dia-info">

                <h3>
                    ${dia.charAt(0).toUpperCase()+dia.slice(1)}
                </h3>

                <span>
                    ${numero}
                </span>

            </div>


            <div class="comidas-dia">

                ${listaComidas}

            </div>

        `;



        contenedor.appendChild(div);

    }

}

function mostrarPantalla(pantalla){

    document.getElementById("alimentosTab").classList.add("hidden");
    document.getElementById("semanaTab").classList.add("hidden");

    document.getElementById("btnAlimentos").classList.remove("active");
    document.getElementById("btnSemana").classList.remove("active");

    if(pantalla === "alimentos"){

        document.getElementById("alimentosTab").classList.remove("hidden");
        document.getElementById("btnAlimentos").classList.add("active");

    }

    if(pantalla === "semana"){

        document.getElementById("semanaTab").classList.remove("hidden");
        document.getElementById("btnSemana").classList.add("active");

        cargarSemana();
    }

}

function cerrarComida(){

    document
    .getElementById("modalComida")
    .classList.add("hidden");

}



async function guardarComidaDia(){

    await supabaseClient
        .from("meal_plan")
        .delete()
        .eq("user_id", user.id)
        .eq("fecha", diaSeleccionado);

    for(const id of alimentosSeleccionados){

        await supabaseClient
            .from("meal_plan")
            .insert([{
                user_id: user.id,
                item_id: id,
                fecha: diaSeleccionado,
                tipo: "comida"
            }]);
    }

    cerrarComida();

    await loadItems();
    await cargarSemana();
}