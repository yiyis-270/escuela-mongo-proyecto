const mongoose = require("mongoose");

const calificacionSchema = new mongoose.Schema({
    alumnoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Alumno",
        required: true
    },
    materia: {
        type: String,
        required: true,
        trim: true
    },
    nota: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Calificacion", calificacionSchema);