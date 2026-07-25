
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

    console.log("hola que tal")

    document.getElementById("alimentosTab")
    .classList.add("hidden");


    document.getElementById("semanaTab")
    .classList.add("hidden");



    if(pantalla === "alimentos"){

        document.getElementById("alimentosTab")
        .classList.remove("hidden");

    }


    if(pantalla === "semana"){

        document.getElementById("semanaTab")
        .classList.remove("hidden");

        cargarSemana();

    }

}
async function abrirComida(fecha, nombreDia){

    const usados = await obtenerUsados();
    diaSeleccionado = fecha;

    alimentosSeleccionados=[];


    document.getElementById("tituloDiaComida")
    .innerText = nombreDia;


    const lista =
    document.getElementById("listaAlimentosComida");


    lista.innerHTML="";

    const grupos = {

    1:{
        nombre:"Nevera",
        icono:""
    },

    2:{
        nombre:"Congelador",
        icono:""
    },

    3:{
        nombre:"Despensa",
        icono:""
    }

};



[1,2,3].forEach(cat=>{


const alimentos = items.filter(i=>{


    if(i.contenedor_id !== cat)
        return false;


    const usado = usados[i.id] || 0;


    const cantidadDisponible =
        (i.cantidad || 1) - usado;


    return cantidadDisponible > 0;


});

    if(!alimentos.length) return;



    const grupo = document.createElement("div");

    grupo.className="grupo-comida";



    const titulo = document.createElement("div");

    titulo.className="titulo-grupo";


    titulo.innerHTML=`

        <span>
            ${grupos[cat].icono}
            ${grupos[cat].nombre}
        </span>

        <span>
            ${categoriasComida[cat] ? "⌄" : "›"}
        </span>

    `;



    const listaGrupo=document.createElement("div");

    listaGrupo.className="lista-grupo";



    alimentos.forEach(item=>{


        const div=document.createElement("div");

        div.className="opcion-comida";


        div.innerHTML=`

            <span>

${item.nombre}

<small class="cantidad-disponible">

(${(item.cantidad || 1) - (usados[item.id] || 0)} disponibles)

</small>

</span>

            <input type="checkbox">

        `;



        const check=div.querySelector("input");



        check.onchange=()=>{


            if(check.checked){

                alimentosSeleccionados.push(item.id);

                div.classList.add("seleccionado");

            }else{


                alimentosSeleccionados =
                alimentosSeleccionados.filter(
                    id=>id!==item.id
                );


                div.classList.remove("seleccionado");

            }

        };


        listaGrupo.appendChild(div);

    });



    titulo.onclick=()=>{


        categoriasComida[cat] =
        !categoriasComida[cat];


        listaGrupo.style.display =
        categoriasComida[cat]
        ? "block"
        : "none";


        titulo.lastElementChild.innerText =
        categoriasComida[cat]
        ? "⌄"
        : "›";


    };



    grupo.appendChild(titulo);

    grupo.appendChild(listaGrupo);


    lista.appendChild(grupo);


});

    document
    .getElementById("modalComida")
    .classList.remove("hidden");

}



function cerrarComida(){

    document
    .getElementById("modalComida")
    .classList.add("hidden");

}



async function guardarComidaDia(){


    for(const id of alimentosSeleccionados){


        await supabaseClient
        .from("meal_plan")
        .insert([{

            user_id:user.id,

            item_id:id,

            fecha:diaSeleccionado,

            tipo:"comida"

        }]);


    }


    cerrarComida();

    cargarSemana();

}