
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");
let editandoId = null; // Variable para rastrear si estamos editando

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
                <button class="btn btn-edit" onclick="prepararEdicion('${alumno._id}', '${alumno.nombre}', '${alumno.email}', '${alumno.carrera}', ${alumno.semestre})">
                    Editar
                </button>
                <button class="btn btn-delete" onclick="eliminarAlumno('${alumno._id}')">
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
// 📌 PREPARAR EDICIÓN
// ======================
function prepararEdicion(id, nombre, email, carrera, semestre) {
    editandoId = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("correo").value = email;
    document.getElementById("carrera").value = carrera;
    document.getElementById("semestre").value = semestre;

    // Cambiar el texto del botón para indicar que estamos editando
    const btnForm = document.querySelector("#formularioAlumno button");
    btnForm.innerText = "Actualizar Alumno";
    window.scrollTo(0, 0); // Desplazar hacia arriba para ver el formulario
}

// ======================
// 📌 POST ALUMNO
// ======================
async function agregarAlumno() {

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const carrera = document.getElementById("carrera").value;
    const semestre = document.getElementById("semestre").value;

    // Validaciones de datos
    if (!nombre.trim() || !correo.trim() || !carrera.trim() || !semestre) {
        alert("❌ Todos los campos son obligatorios");
        return;
    }

    if (isNaN(semestre) || semestre < 1 || semestre > 12) {
        alert("❌ El semestre debe ser un número entre 1 y 12");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert("❌ El formato del correo electrónico es inválido");
        return;
    }

    // Determinar si es una creación o una actualización
    const url = editandoId ? `/api/alumnos/${editandoId}` : "/api/alumnos";
    const metodo = editandoId ? "PUT" : "POST";

    try {
        loader.style.display = "flex";
        const respuesta = await fetch(url, {
            method: metodo,
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

        if (respuesta.ok) {
            editandoId = null; // Resetear el ID de edición
            alert(metodo === "PUT" ? "✅ Alumno actualizado con éxito" : "✅ Alumno creado con éxito");
            location.reload();
        } else {
            const error = await respuesta.json();
            alert("❌ Error del servidor: " + (error.mensaje || "No se pudo procesar la solicitud"));
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("❌ Error de conexión: No se pudo comunicar con el servidor");
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
        if (!confirm("¿Estás seguro de que deseas eliminar este alumno?")) return;

        loader.style.display = "flex";
        const respuesta = await fetch(`/api/alumnos/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (respuesta.ok) {
            alert("✅ Alumno eliminado correctamente");
            location.reload();
        } else {
            const error = await respuesta.json();
            alert("❌ Error al eliminar: " + error.mensaje);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Error de red al intentar eliminar");
    } finally {
        loader.style.display = "none";
    }
}