const express = require("express");
const Calificacion = require("../models/Calificacion");
const jwt = require("jsonwebtoken");

const router = express.Router();

// 🔐 Middleware para verificar token y rol
const verificarToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ mensaje: "No hay token" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
};

// Verificar si es admin
const esAdmin = (req, res, next) => {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: "Acceso denegado. Solo administradores." });
    }
    next();
};

// 📌 CREATE (solo admin)
router.post("/", verificarToken, esAdmin, async (req, res) => {
    try {
        const { alumnoId, materia, nota } = req.body;
        
        // Validar que la nota esté entre 0 y 10
        if (nota < 0 || nota > 10) {
            return res.status(400).json({ mensaje: "La nota debe estar entre 0 y 10" });
        }
        
        const calificacion = await Calificacion.create({
            alumnoId,
            materia,
            nota
        });
        
        res.status(201).json({ 
            mensaje: "✅ Calificación agregada correctamente",
            calificacion 
        });
    } catch (error) {
        console.error("Error al crear calificación:", error);
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 READ (todos - admin ve todo, alumno solo sus notas)
router.get("/", verificarToken, async (req, res) => {
    try {
        let calificaciones;
        
        if (req.usuario.rol === 'admin') {
            // Admin ve todas las calificaciones con datos del alumno
            calificaciones = await Calificacion.find()
                .populate("alumnoId", "nombre email carrera semestre");
        } else {
            // Alumno solo ve sus propias calificaciones
            // Necesitas vincular el usuario con el alumno por email
            calificaciones = await Calificacion.find()
                .populate("alumnoId", "nombre email");
        }
        
        res.json(calificaciones);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 READ por ID de alumno
router.get("/alumno/:alumnoId", verificarToken, async (req, res) => {
    try {
        const calificaciones = await Calificacion.find({ alumnoId: req.params.alumnoId })
            .populate("alumnoId", "nombre email");
        
        res.json(calificaciones);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 UPDATE (solo admin)
router.put("/:id", verificarToken, esAdmin, async (req, res) => {
    try {
        const { materia, nota } = req.body;
        
        if (nota && (nota < 0 || nota > 10)) {
            return res.status(400).json({ mensaje: "La nota debe estar entre 0 y 10" });
        }
        
        const calificacion = await Calificacion.findByIdAndUpdate(
            req.params.id,
            { materia, nota },
            { new: true, runValidators: true }
        );
        
        if (!calificacion) {
            return res.status(404).json({ mensaje: "Calificación no encontrada" });
        }
        
        res.json({ 
            mensaje: "✅ Calificación actualizada",
            calificacion 
        });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// 📌 DELETE (solo admin)
router.delete("/:id", verificarToken, esAdmin, async (req, res) => {
    try {
        const calificacion = await Calificacion.findByIdAndDelete(req.params.id);
        
        if (!calificacion) {
            return res.status(404).json({ mensaje: "Calificación no encontrada" });
        }
        
        res.json({ mensaje: "✅ Calificación eliminada" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;