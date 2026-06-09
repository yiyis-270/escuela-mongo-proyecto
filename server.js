require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const alumnoRoutes = require("./routes/alumnoRoutes");
const calificacionRoutes = require("./routes/calificacionRoutes");

const app = express();

// 🔵 Conexión a DB
connectDB();

// 🔵 Middlewares
app.use(cors());
app.use(express.json());

// 🔵 Archivos estáticos (frontend)
app.use(express.static("public"));

// 🔵 Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/alumnos", alumnoRoutes);
app.use("/api/calificaciones", calificacionRoutes);

// 🔵 Ruta base
app.get("/", (req, res) => {
  res.send("API Escuela funcionando 🚀");
});

// 🔵 Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});