/* ================================
   MENÚ PARA CELULARES
================================ */

const menuToggle = document.getElementById("menuToggle");
const navPrincipal = document.getElementById("navPrincipal");

if (menuToggle && navPrincipal) {

    menuToggle.addEventListener("click", () => {

        const abierto = navPrincipal.classList.toggle("abierto");

        menuToggle.setAttribute("aria-expanded", String(abierto));

        const texto = menuToggle.querySelector(".sr-only");

        if (texto) {
            texto.textContent = abierto ? "Cerrar menú" : "Abrir menú";
        }
    });

    navPrincipal.querySelectorAll("a").forEach(enlace => {

        enlace.addEventListener("click", () => {

            navPrincipal.classList.remove("abierto");

            menuToggle.setAttribute("aria-expanded", "false");

            const texto = menuToggle.querySelector(".sr-only");

            if (texto) {
                texto.textContent = "Abrir menú";
            }
        });
    });
}


/* ================================
   HIMNOS
   SOLO UNO PUEDE REPRODUCIRSE
================================ */

document.querySelectorAll("[data-himno]").forEach(audio => {

    audio.addEventListener("play", () => {

        document.querySelectorAll("[data-himno]").forEach(otro => {

            if (otro !== audio) {
                otro.pause();
            }
        });
    });
});


/* ================================
   DIRECTORIO DOCENTE
================================ */

// Elementos del HTML

const campoBusqueda = document.getElementById("campoBusqueda");

const filtroAcademia = document.getElementById("filtroAcademia");

const limpiarBusqueda = document.getElementById("limpiarBusqueda");

const estadoDocentes = document.getElementById("estadoDocentes");


// Contenedores de las tres categorías

const contenedores = {
    modulo: document.getElementById("profesores-modulo"),
    general: document.getElementById("profesores-general"),
    club: document.getElementById("profesores-club")
};


// Arreglo de docentes

let docentes = [];


/* ================================
   NORMALIZAR TEXTO
================================ */

function normalizar(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


/* ================================
   INICIALES DEL DOCENTE
================================ */

function iniciales(nombre) {

    return nombre
        .split(/\s+/)
        .slice(0, 2)
        .map(p => p[0] || "")
        .join("")
        .toUpperCase();
}


/* ================================
   CREAR TARJETA DEL DOCENTE
================================ */

function crearTarjeta(docente) {

    const tarjeta = document.createElement("article");

    tarjeta.className = "docente-card";


    // Fotografía

    const foto = document.createElement("img");

    foto.src = docente.foto;

    foto.alt = docente.nombre;

    foto.className = "docente-foto";

    foto.onerror = function () {

        console.error(
            "No se encontró la fotografía:",
            docente.foto
        );

        this.style.display = "none";
    };


    // Nombre

    const nombre = document.createElement("h3");

    nombre.textContent = docente.nombre;


    // Especialidad

    const especialidad = document.createElement("p");

    especialidad.textContent =
        "Especialidad: " +
        (docente.especialidad || "No especificada");


    // Materias

    const materias = document.createElement("p");

    materias.textContent =
        "Materias: " +
        (docente.materias || "No especificadas");


    // Club

    const club = document.createElement("p");

    club.textContent =
        docente.club ? "Club: " + docente.club : "";


    // Semestres

    const semestres = document.createElement("p");

    semestres.textContent =
        "Semestres: " +
        (docente.semestres || "No especificados");


    // Agregar elementos a la tarjeta

    tarjeta.append(
        foto,
        nombre,
        especialidad,
        materias
    );

    if (docente.club) {
        tarjeta.appendChild(club);
    }

    tarjeta.appendChild(semestres);


    return tarjeta;
}


/* ================================
   MOSTRAR Y FILTRAR DOCENTES
================================ */

function renderizarDocentes() {

    // Obtener texto de búsqueda

    const termino = normalizar(
        campoBusqueda ? campoBusqueda.value : ""
    );


    // Obtener categoría seleccionada

    const categoriaSeleccionada =
        filtroAcademia ? filtroAcademia.value : "";


    // Limpiar las tres secciones

    Object.values(contenedores).forEach(contenedor => {

        if (contenedor) {
            contenedor.replaceChildren();
        }

    });


    let cantidad = 0;


    // Recorrer docentes

    docentes.forEach(docente => {

        // Texto para buscar por nombre y datos

        const texto = normalizar(
            `${docente.nombre} ${docente.categoria} ${docente.materias || ""} ${docente.especialidad || ""} ${docente.club || ""}`
        );


        // Comprobar búsqueda

        const coincideTexto = texto.includes(termino);


        // Comprobar categoría

        const coincideCategoria =
            !categoriaSeleccionada ||
            docente.categoria === categoriaSeleccionada;


        // Mostrar docente si coincide

        if (coincideTexto && coincideCategoria) {

            const contenedor = contenedores[docente.categoria];

            if (contenedor) {

                contenedor.appendChild(
                    crearTarjeta(docente)
                );

                cantidad++;
            }
        }

    });


    // Actualizar mensaje de resultados

    if (estadoDocentes) {

        estadoDocentes.textContent =
            cantidad + " docentes encontrados.";
    }

}


/* ================================
   CARGAR DOCENTES DESDE JSON
================================ */

async function cargarDocentes() {

    try {

        const respuesta = await fetch("json/profesores.json");

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo leer el archivo JSON"
            );
        }


        // Obtener información del JSON

        const datos = await respuesta.json();

        docentes = datos.profesores;


        // Comprobar los datos

        if (!Array.isArray(docentes)) {

            throw new Error(
                "El JSON no contiene un arreglo de profesores"
            );
        }


        console.log(
            "Docentes cargados correctamente:",
            docentes
        );


        // Crear opciones del filtro

        if (filtroAcademia) {

            filtroAcademia.replaceChildren();

            const opcionTodas = document.createElement("option");

            opcionTodas.value = "";

            opcionTodas.textContent = "Todas las categorías";

            filtroAcademia.appendChild(opcionTodas);


            const academias = [
                ...new Set(
                    docentes
                        .map(docente => docente.categoria)
                        .filter(Boolean)
                )
            ].sort();


            academias.forEach(nombre => {

                const opcion = document.createElement("option");

                opcion.value = nombre;

                opcion.textContent = nombre;

                filtroAcademia.appendChild(opcion);
            });
        }


        // Mostrar docentes

        renderizarDocentes();


    } catch (error) {

        console.error(
            "Error al cargar docentes:",
            error
        );

        if (estadoDocentes) {

            estadoDocentes.textContent =
                "No se pudo cargar el directorio. Revisa json/profesores.json.";
        }
    }
}


/* ================================
   BUSCADOR POR NOMBRE Y DATOS
================================ */

if (campoBusqueda) {

    campoBusqueda.addEventListener(
        "input",
        renderizarDocentes
    );
}


/* ================================
   FILTRO DE CATEGORÍAS
================================ */

if (filtroAcademia) {

    filtroAcademia.addEventListener(
        "change",
        renderizarDocentes
    );
}


/* ================================
   LIMPIAR BÚSQUEDA
================================ */

if (limpiarBusqueda) {

    limpiarBusqueda.addEventListener("click", () => {

        if (campoBusqueda) {
            campoBusqueda.value = "";
        }

        if (filtroAcademia) {
            filtroAcademia.value = "";
        }

        renderizarDocentes();
    });
}


/* ================================
   INICIAR DIRECTORIO
================================ */

cargarDocentes();