const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware de protección (Extraído de tu lógica actual)
const verificarToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ mensaje: "No hay token" });
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
};

const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: "Acceso denegado. Solo administradores." });
    }
    next();
};

// 📌 REGISTRAR USUARIO CON ROL (Solo Admin)
router.post("/registrar", verificarToken, esAdmin, async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Validar campos obligatorios
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos: nombre, email, password, rol" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ mensaje: "El formato de correo electrónico no es válido" });
        }

        // Validar roles permitidos
        const rolesValidos = ['admin', 'profesor', 'alumno'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({ mensaje: "Rol no válido. Use: admin, profesor o alumno" });
        }

        const existe = await User.findOne({ email });
        if (existe) {
            return res.status(400).json({ mensaje: "El usuario ya existe" });
        }

        const hash = await bcrypt.hash(password, 10);
        const nuevoUsuario = new User({
            nombre,
            email,
            password: hash,
            rol
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: `Usuario ${nombre} registrado exitosamente como ${rol}` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;