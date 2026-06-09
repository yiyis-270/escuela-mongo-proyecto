async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await respuesta.json();

    if (respuesta.ok && data.token) {

        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol || "alumno");
        localStorage.setItem("nombre", data.nombre);

        window.location.href = "alumnos.html";

    } else {
        alert(data.mensaje || "Error en login");
    }
}