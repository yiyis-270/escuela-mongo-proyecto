document.getElementById('registro-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const mensajeDiv = document.getElementById('mensaje');
    const loader = document.getElementById('loader');

    // Validación frontend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mensajeDiv.textContent = "❌ Por favor, ingresa un correo electrónico válido";
        mensajeDiv.className = "message error";
        mensajeDiv.style.display = "block";
        return;
    }

    try {
        loader.style.display = 'flex';
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password, rol })
        });

        const data = await response.json();

        if (response.ok) {
            mensajeDiv.textContent = "¡Registro exitoso! Redirigiendo al login...";
            mensajeDiv.className = "message success";
            mensajeDiv.style.display = "block";
            
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mensajeDiv.textContent = data.mensaje || "Error al registrarse";
            mensajeDiv.className = "message error";
            mensajeDiv.style.display = "block";
        }
    } catch (error) {
        mensajeDiv.textContent = "Error de conexión con el servidor";
        mensajeDiv.className = "message error";
        mensajeDiv.style.display = "block";
    } finally {
        loader.style.display = 'none';
    }
});