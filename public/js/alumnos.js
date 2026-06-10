
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

if (!token) {
    window.location.href = "login.html";
}

// Inyectar loader dinámicamente si no existe en el HTML
if (!document.getElementById("loader")) {
    const loaderDiv = document.createElement("div");
    loaderDiv.id = "loader";
    loaderDiv.className = "loader-overlay";
    loaderDiv.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loaderDiv);
}

const loader = document.getElementById("loader");

// Mostrar rol
document.getElementById("rolUsuario").innerText = "Rol: " + rol;

// Ocultar formulario si no es admin
if (rol !== "admin") {
    document.getElementById("formularioAlumno").style.display = "none";
} else {
    // Agregar enlace a gestión de roles para el admin
    const adminLink = document.createElement("div");
    adminLink.innerHTML = `<a href="registro_admin.html" style="color: #667eea; font-weight: bold; display: block; margin: 10px 0;">+ Gestionar Usuarios y Roles</a>`;
    document.getElementById("rolUsuario").after(adminLink);
}

// Cargar alumnos al iniciar
cargarAlumnos();


// ======================
// 📌 GET ALUMNOS
// ======================
async function cargarAlumnos() {
    try {
        loader.style.display = "flex";
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
                <td>${alumno.email}</td>
                <td>${alumno.carrera}</td>
                <td>${alumno.semestre}</td>
                <td>${acciones}</td>
            </tr>
        `;
    });

    document.getElementById("tablaAlumnos").innerHTML = html;
    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }
}


// ======================
// 📌 POST ALUMNO
// ======================
async function agregarAlumno() {

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const carrera = document.getElementById("carrera").value;
    const semestre = document.getElementById("semestre").value;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert("❌ El formato del correo electrónico es inválido");
        return;
    }

    try {
        loader.style.display = "flex";
        await fetch("/api/alumnos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                nombre,
                email: correo, // Corregido: el backend espera 'email'
                carrera,
                semestre
            })
        });
    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }

    location.reload();
}


// ======================
// 📌 DELETE ALUMNO
// ======================
async function eliminarAlumno(id) {
    try {
        loader.style.display = "flex";
        await fetch(`/api/alumnos/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
    } catch (error) {
        console.error(error);
    } finally {
        loader.style.display = "none";
    }

    location.reload();
}