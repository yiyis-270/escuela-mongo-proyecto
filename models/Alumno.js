const mongoose = require("mongoose");

const alumnoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {           // ✅ Cambiado de "correo" a "email"
    type: String,
    required: true
  },
  carrera: {
    type: String,
    required: true
  },
  semestre: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Alumno", alumnoSchema);