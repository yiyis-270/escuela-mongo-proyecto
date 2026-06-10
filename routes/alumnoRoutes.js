const express = require("express");
const router = express.Router();
const Alumno = require("../models/Alumno");
const jwt = require("jsonwebtoken");

// 🔐 Middleware para verificar token (CORREGIDO - ahora verifica el token correctamente)
const verificarToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ mensaje: "No hay token" });
    }

    try {
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ mensaje: "Token inválido" });
        }

        // ✅ Verificar el token correctamente
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Guardar info del usuario
        next();

    } catch (error) {
        console.error("Error de token:", error.message);
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
};

// 📌 GET TODOS
router.get("/", verificarToken, async (req, res) => {
    try {
        const alumnos = await Alumno.find();
        res.json(alumnos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 CREAR (CORREGIDO - usa email en lugar de correo)
router.post("/", verificarToken, async (req, res) => {
    try {
        console.log("Datos recibidos para crear:", req.body); // Para depurar
        
        const { nombre, email, carrera, semestre } = req.body;

        // Validar que todos los campos estén presentes
        if (!nombre || !email || !carrera || !semestre) {
            return res.status(400).json({ 
                mensaje: "Faltan campos: nombre, email, carrera, semestre son requeridos" 
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ mensaje: "El formato de correo electrónico para el alumno no es válido" });
        }

        const nuevoAlumno = new Alumno({
            nombre,
            email,      // ✅ Cambiado de "correo" a "email"
            carrera,
            semestre: parseInt(semestre)
        });

        await nuevoAlumno.save();

        res.status(201).json({ 
            mensaje: "Alumno creado correctamente",
            alumno: nuevoAlumno 
        });

    } catch (error) {
        console.error("Error al crear alumno:", error);
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 ELIMINAR
router.delete("/:id", verificarToken, async (req, res) => {
    try {
        const alumno = await Alumno.findByIdAndDelete(req.params.id);
        
        if (!alumno) {
            return res.status(404).json({ mensaje: "Alumno no encontrado" });
        }
        
        res.json({ mensaje: "Alumno eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 ACTUALIZAR (AGREGADO - para editar alumnos)
router.put("/:id", verificarToken, async (req, res) => {
    try {
        const { nombre, email, carrera, semestre } = req.body;
        
        const alumnoActualizado = await Alumno.findByIdAndUpdate(
            req.params.id,
            { nombre, email, carrera, semestre: parseInt(semestre) },
            { new: true, runValidators: true }
        );
        
        if (!alumnoActualizado) {
            return res.status(404).json({ mensaje: "Alumno no encontrado" });
        }
        
        res.json({ 
            mensaje: "Alumno actualizado correctamente",
            alumno: alumnoActualizado 
        });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;