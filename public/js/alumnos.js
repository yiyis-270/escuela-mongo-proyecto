
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!token) {
    window.location.href = "login.html";
}

// Mostrar rol
document.getElementById("rolUsuario").innerText = "Rol: " + rol;

// Ocultar formulario si no es admin
if (rol !== "admin") {
    document.getElementById("formularioAlumno").style.display = "none";
}

// Cargar alumnos al iniciar
cargarAlumnos();


// ======================
// 📌 GET ALUMNOS
// ======================
async function cargarAlumnos() {

    const respuesta = await fetch("/api/alumnos", {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const alumnos = await respuesta.json();

    let html = "";

    alumnos.forEach(alumno => {

        let acciones = "";

        if (rol === "admin") {
            acciones = `
                <button onclick="eliminarAlumno('${alumno._id}')">
                    Eliminar
                </button>
            `;
        }

        html += `
            <tr>
                <td>${alumno.nombre}</td>
                <td>${alumno.correo}</td>
                <td>${alumno.carrera}</td>
                <td>${alumno.semestre}</td>
                <td>${acciones}</td>
            </tr>
        `;
    });

    document.getElementById("tablaAlumnos").innerHTML = html;
}


// ======================
// 📌 POST ALUMNO
// ======================
async function agregarAlumno() {

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const carrera = document.getElementById("carrera").value;
    const semestre = document.getElementById("semestre").value;

    await fetch("/api/alumnos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            nombre,
            correo,
            carrera,
            semestre
        })
    });

    location.reload();
}


// ======================
// 📌 DELETE ALUMNO
// ======================
async function eliminarAlumno(id) {

    await fetch(`/api/alumnos/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    location.reload();
}