const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const existe = await User.findOne({ email });

    if (existe) {
      return res.status(400).json({
        mensaje: "El usuario ya existe"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      nombre,
      email,
      password: hash,
      rol: rol || "alumno" 
    });
    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario registrado"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login - CORREGIDO
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(400).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const valido = await bcrypt.compare(password, usuario.password);

    if (!valido) {
      return res.status(400).json({
        mensaje: "Contraseña incorrecta"
      });
    }

    // ✅ AHORA INCLUYE MÁS DATOS EN EL TOKEN
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      token,
      rol: usuario.rol,
      nombre: usuario.nombre,
      email: usuario.email
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;