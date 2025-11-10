import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import multer from "multer";
import { connection } from "./src/bd.js";
import contenidoRoutes from "./src/routes/contenidoRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3001;


// ✅ Montar rutas de contenido
app.use("/api/contenido", contenidoRoutes);


// =========================
// PRUEBA DE CONEXIÓN
// =========================
//app.get("/", (req, res) => {
//  res.send("Servidor SisteMath funcionando correctamente ✅");
//});

// =========================
// REGISTRO DE USUARIO
// =========================
app.post("/register", async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  if (!nombre || !correo || !contrasena || !rol) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    const checkSql = "SELECT * FROM Usuario WHERE correo = ?";
    connection.query(checkSql, [correo], async (err, results) => {
      if (err) return res.status(500).json({ message: "Error en la verificación" });
      if (results.length > 0)
        return res.status(400).json({ message: "El correo ya está registrado" });

      const hashed = await bcrypt.hash(contrasena, 10);
      const sqlUsuario =
        "INSERT INTO Usuario (nombre, correo, contrasena, rol) VALUES (?, ?, ?, ?)";
      connection.query(sqlUsuario, [nombre, correo, hashed, rol], (err, result) => {
        if (err) return res.status(500).json({ message: "Error al registrar usuario" });

        const idUsuario = result.insertId;
        console.log(`✅ Usuario insertado: id=${idUsuario}, rol=${rol}`);

        let sqlHijo = "";
        if (rol === "estudiante") sqlHijo = "INSERT INTO Estudiante (fk_idUsuario) VALUES (?)";
        if (rol === "profesor") sqlHijo = "INSERT INTO Profesor (fk_idUsuario) VALUES (?)";
        if (rol === "administrador") sqlHijo = "INSERT INTO Administrador (fk_idUsuario) VALUES (?)";

        if (!sqlHijo) {
          return res.status(201).json({ message: "Usuario registrado sin tabla hija" });
        }

        connection.query(sqlHijo, [idUsuario], (err2) => {
          if (err2) return res.status(500).json({ message: "Error al registrar en tabla hija" });
          console.log(`✅ Registro creado en tabla hija (${rol}) con fk_idUsuario=${idUsuario}`);
          return res.status(201).json({ message: `${rol} registrado correctamente` });
        });
      });
    });
  } catch (error) {
    console.error("❌ Error general:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// =========================
// LOGIN ACTUALIZADO (con idProfesor dinámico)
// =========================
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;
  if (!correo || !contrasena) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  const sql = "SELECT * FROM Usuario WHERE correo = ?";
  connection.query(sql, [correo], async (err, results) => {
    if (err) {
      console.error("❌ Error en el servidor:", err);
      return res.status(500).json({ message: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];
    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    console.log(`✅ Login exitoso → ${user.nombre} (${user.rol})`);

    // 🔹 Si es PROFESOR, obtener su idProfesor desde la tabla Profesor
    if (user.rol === "profesor") {
      const sqlProfe = "SELECT idProfesor FROM Profesor WHERE fk_idUsuario = ?";
      connection.query(sqlProfe, [user.idUsuario], (err2, resultProfe) => {
        if (err2) {
          console.error("❌ Error al obtener idProfesor:", err2);
          return res.status(500).json({ message: "Error al obtener idProfesor" });
        }

        const idProfesor = resultProfe[0]?.idProfesor || null;
        console.log(`👨‍🏫 Profesor identificado → idProfesor=${idProfesor}`);

        return res.json({
          message: "Login exitoso",
          usuario: user.nombre,
          rol: user.rol,
          idUsuario: user.idUsuario,
          idProfesor: idProfesor, // ✅ agregado dinámico
        });
      });
      return; // 🔸 Importante para que no siga ejecutando el bloque general
    }

    if (user.rol === "estudiante") {
      const sqlEst = "SELECT idEstudiante FROM Estudiante WHERE fk_idUsuario = ?";
      connection.query(sqlEst, [user.idUsuario], (err2, resultEst) => {
        if (err2) {
          console.error("❌ Error al obtener idEstudiante:", err2);
          return res.status(500).json({ message: "Error al obtener idEstudiante" });
        }
        const idEstudiante = resultEst[0]?.idEstudiante || null;

        console.log(`🎓 Estudiante identificado → idEstudiante=${idEstudiante}`);

        return res.json({
          message: "Login exitoso",
          usuario: user.nombre,
          rol: user.rol,
          idUsuario: user.idUsuario,
          idEstudiante: idEstudiante, // 🔹 agregado dinámico
        });
      });
      return;
    }



    // 🔹 Para estudiantes o administradores, sin cambios
    res.json({
      message: "Login exitoso",
      usuario: user.nombre,
      rol: user.rol,
      idUsuario: user.idUsuario,
    });
  });
});


// =============================================
// 📘 CONTENIDOS HABILITADOS PARA EL ESTUDIANTE
// =============================================

// ✅ Obtener contenidos filtrados por tema y sección
app.get("/api/estudiante/contenido/:tema/:seccion", (req, res) => {
  const tema = decodeURIComponent(req.params.tema).trim();
  const seccion = decodeURIComponent(req.params.seccion).trim();

  const sql = `
    SELECT idContenido, tipo, descripcion, seccion
    FROM Contenido
    WHERE tipo = ? AND seccion = ? AND habilitado = 1
  `;

  connection.query(sql, [tema, seccion], (err, contenidos) => {
    if (err) {
      console.error("❌ Error al obtener contenidos habilitados:", err);
      return res.status(500).json({ message: "Error al obtener contenidos" });
    }

    // Archivos (metadata.json)
    const uploadDir = path.join(process.cwd(), "uploads");
    const metaFile = path.join(uploadDir, "metadata.json");
    let archivos = [];
    try {
      if (fs.existsSync(metaFile)) {
        const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
        archivos = meta.filter(
          (f) =>
            f.tema?.trim().toLowerCase() === tema.toLowerCase() &&
            f.enabled === true &&
            f.seccion?.trim().toLowerCase() === seccion.toLowerCase()
        );
      }
    } catch (e) {
      console.error("⚠️ Error leyendo archivos habilitados:", e.message);
    }

    res.json({ contenidos, archivos });
  });
});

// =============================================
// 📘 CONTENIDOS HABILITADOS PARA EL ESTUDIANTE
// =============================================

// ✅ Obtener contenidos filtrados por tema y sección
app.get("/api/estudiante/contenido/:tema/:seccion", (req, res) => {
  const tema = decodeURIComponent(req.params.tema).trim();
  const seccion = decodeURIComponent(req.params.seccion).trim();

  const sql = `
    SELECT idContenido, tipo, descripcion, seccion
    FROM Contenido
    WHERE tipo = ? AND seccion = ? AND habilitado = 1
  `;

  connection.query(sql, [tema, seccion], (err, contenidos) => {
    if (err) {
      console.error("❌ Error al obtener contenidos habilitados:", err);
      return res.status(500).json({ message: "Error al obtener contenidos" });
    }

    // Archivos (metadata.json)
    const uploadDir = path.join(process.cwd(), "uploads");
    const metaFile = path.join(uploadDir, "metadata.json");
    let archivos = [];
    try {
      if (fs.existsSync(metaFile)) {
        const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
        archivos = meta.filter(
          (f) =>
            f.tema?.trim().toLowerCase() === tema.toLowerCase() &&
            f.enabled === true &&
            f.seccion?.trim().toLowerCase() === seccion.toLowerCase()
        );
      }
    } catch (e) {
      console.error("⚠️ Error leyendo archivos habilitados:", e.message);
    }

    res.json({ contenidos, archivos });
  });
});

// ✅ También permite compatibilidad con llamadas viejas (solo tema)
app.get("/api/estudiante/contenido/:tema", (req, res) => {
  const tema = decodeURIComponent(req.params.tema).trim();

  const sql = `
    SELECT idContenido, tipo, descripcion, seccion
    FROM Contenido
    WHERE tipo = ? AND habilitado = 1
  `;

  connection.query(sql, [tema], (err, contenidos) => {
    if (err) {
      console.error("❌ Error al obtener contenidos:", err);
      return res.status(500).json({ message: "Error al obtener contenidos" });
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    const metaFile = path.join(uploadDir, "metadata.json");
    let archivos = [];
    try {
      if (fs.existsSync(metaFile)) {
        const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
        archivos = meta.filter(
          (f) =>
            f.tema?.trim().toLowerCase() === tema.toLowerCase() && f.enabled === true
        );
      }
    } catch (e) {
      console.error("⚠️ Error leyendo archivos habilitados:", e.message);
    }

    res.json({ contenidos, archivos });
  });
});


// =========================
/* ARCHIVOS: 1 carpeta uploads + metadata por tema */
// =========================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Carpeta 'uploads' creada automáticamente");
}
const metaFile = path.join(uploadDir, "metadata.json");

function readMeta() {
  if (!fs.existsSync(metaFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(metaFile, "utf-8"));
  } catch {
    return [];
  }
}
function writeMeta(meta) {
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error("Solo se permiten PDF o Word"));
    cb(null, true);
  },
});

// SUBIR archivo (se guarda en uploads y se registra en metadata)
app.post("/api/contenido/subir", upload.single("archivo"), (req, res) => {
  const tema = req.body.tema?.trim() || "general";
  if (!req.file) return res.status(400).json({ message: "No se subió ningún archivo" });

  const meta = readMeta();
  meta.push({
    tema,
    nombreArchivo: req.file.originalname,
    rutaArchivo: `/uploads/${req.file.filename}`, // para descargar
    storedFilename: req.file.filename,           // para eliminar/toggle
    enabled: false,                               // por defecto NO visible al estudiante
    fecha: new Date().toISOString(),
  });
  writeMeta(meta);

  console.log(`📤 Archivo subido: ${req.file.originalname} → tema "${tema}"`);
  res.json({ message: "✅ Archivo subido correctamente", nombre: req.file.originalname, tema });
});

// LISTAR archivos del TEMA (solo de ese tema)
app.get("/api/contenido/archivos/:tema", (req, res) => {
  const tema = decodeURIComponent(req.params.tema);
  const meta = readMeta();
  const archivos = meta.filter((f) => f.tema === tema);
  console.log(`📂 Archivos del tema "${tema}":`, archivos.length);
  res.json(archivos);
});



// TOGGLE habilitar/deshabilitar archivo (para estudiante)
app.put("/api/contenido/archivo/habilitar", (req, res) => {
  const { storedFilename, enabled } = req.body || {};
  if (!storedFilename || typeof enabled !== "boolean") {
    return res.status(400).json({ message: "Datos inválidos" });
  }
  const meta = readMeta();
  const idx = meta.findIndex((m) => m.storedFilename === storedFilename);
  if (idx === -1) return res.status(404).json({ message: "Archivo no encontrado" });

  meta[idx].enabled = enabled;
  writeMeta(meta);
  return res.json({ message: enabled ? "✅ Habilitado" : "🕑 Deshabilitado" });
});



// ELIMINAR archivo (borra archivo físico y metadata)
app.delete("/api/contenido/archivo", (req, res) => {
  const { storedFilename } = req.body || {};
  if (!storedFilename) return res.status(400).json({ message: "storedFilename requerido" });

  const meta = readMeta();
  const idx = meta.findIndex((m) => m.storedFilename === storedFilename);
  if (idx === -1) return res.status(404).json({ message: "Archivo no encontrado" });

  const filePath = path.join(uploadDir, storedFilename);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.warn("⚠️ No se pudo borrar archivo físico:", e.message);
  }
  meta.splice(idx, 1);
  writeMeta(meta);
  return res.json({ message: "🗑️ Archivo eliminado" });
});

// Servir archivos
app.use("/uploads", express.static(uploadDir));


// ✅ ACTUALIZAR estado habilitado/deshabilitado
app.put("/api/contenido/habilitar/:idContenido", (req, res) => {
  const { idContenido } = req.params;
  const { habilitado } = req.body;

  console.log("📩 Petición recibida →", { idContenido, habilitado });

  if (!idContenido || isNaN(idContenido)) {
    return res.status(400).json({ message: "❌ ID de contenido inválido" });
  }

  if (habilitado === undefined) {
    return res.status(400).json({ message: "❌ Falta valor 'habilitado'" });
  }

  const valor = habilitado === true || habilitado === "true" ? 1 : 0;

  const sql = "UPDATE Contenido SET habilitado = ? WHERE idContenido = ?";
  connection.query(sql, [valor, idContenido], (err, result) => {
    if (err) {
      console.error("❌ Error SQL:", err);
      return res.status(500).json({ message: "Error al actualizar estado" });
    }

    if (result.affectedRows === 0) {
      console.warn("⚠️ No se encontró contenido con ID:", idContenido);
      return res.status(404).json({ message: "Contenido no encontrado" });
    }

    console.log(
      `✅ Contenido ${idContenido} actualizado correctamente → habilitado=${valor}`
    );

    return res.json({
      message:
        valor === 1
          ? "✅ Enunciado habilitado correctamente"
          : "🕓 Enunciado deshabilitado",
    });
  });
});



//==================================  CONTENIDO PARA MOSTRAR  EL VER A ESTUDIANTE ==========================

// ✅ NUEVA RUTA: Contenidos habilitados solo para la sección "practica"
app.get("/api/estudiante/contenido/:tema/practica", (req, res) => {
  const tema = decodeURIComponent(req.params.tema).trim();

  const sql = `
    SELECT idContenido, tipo, descripcion, seccion
    FROM Contenido
    WHERE tipo = ? AND seccion = 'practica' AND habilitado = 1
  `;

  connection.query(sql, [tema], (err, contenidos) => {
    if (err) {
      console.error("❌ Error al obtener contenidos (práctica):", err);
      return res.status(500).json({ message: "Error al obtener contenidos" });
    }

    // Leer archivos habilitados desde metadata.json
    const uploadDir = path.join(process.cwd(), "uploads");
    const metaFile = path.join(uploadDir, "metadata.json");
    let archivos = [];
    try {
      if (fs.existsSync(metaFile)) {
        const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
        archivos = meta.filter(
          (f) =>
            f.tema?.trim().toLowerCase() === tema.toLowerCase() &&
            f.seccion?.trim().toLowerCase() === "practica" &&
            f.enabled === true
        );
      }
    } catch (e) {
      console.error("⚠️ Error leyendo archivos habilitados (práctica):", e.message);
    }

    res.json({ contenidos, archivos });
  });
});



app.put("/api/contenido/seccion/:idContenido", (req, res) => {
  const { idContenido } = req.params;
  const { seccion } = req.body;
  if (!idContenido || !seccion)
    return res.status(400).json({ message: "Datos incompletos" });
  const sql = "UPDATE Contenido SET seccion = ? WHERE idContenido = ?";
  connection.query(sql, [seccion, idContenido], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error al actualizar sección" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Contenido no encontrado" });
    res.json({ message: `✅ Sección actualizada a ${seccion}` });
  });
});


// =============================================
// 📊 REPORTE GENERAL DE ESTUDIANTES (por módulos y temas reales)
// =============================================
app.get("/api/reporte/general", (req, res) => {
  console.log("📊 Mostrando reporte general (sin filtro por profesor)");

  const sql = "CALL sp_reporte_general()";

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al ejecutar sp_reporte_general:", err);
      return res.status(500).json({ message: "Error al obtener el reporte general" });
    }

    // MySQL devuelve el resultado en la primera posición del array
    const filas = results[0] || [];

    if (filas.length === 0) {
      console.warn("⚠️ No hay registros en el reporte general");
    } else {
      console.log(`✅ Reporte general cargado: ${filas.length} registros`);
    }

    // Solo devolvemos temas realmente vistos (con archivo o tiempo)
    const filtrado = filas.filter(
      (r) => r.archivo !== null || r.tiempo_tema > 0
    );

    res.json(filtrado);
  });
});








// ✅ SIEMPRE devuelve todas las estadísticas desde la vista (sin filtrar por profesor)
app.get("/api/estadisticas/vista", (req, res) => {
  const sql = "SELECT * FROM vista_estadisticas";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error al obtener estadísticas:", err);
      return res.status(500).json({ message: "Error al obtener estadísticas" });
    }
    console.log(`✅ Estadísticas (vista) cargadas: ${results.length} registros`);
    res.json(results);
  });
});


// =============================
// 📥 Registrar o actualizar estadística del estudiante
// =============================
app.post("/api/estadistica/registrar", (req, res) => {
  console.log("📥 /api/estadistica/registrar -> body:", req.body);
  const { idEstudiante, tiempoInvertido, ejerciciosResueltos, nivelAvance } = req.body;

  if (!idEstudiante) {
    console.warn("⚠️ Falta idEstudiante");
    return res.status(400).json({ message: "Falta idEstudiante" });
  }

  const sqlInsert = `
    INSERT INTO Estadistica (fk_idEstudiante, tiempoInvertido, ejerciciosResueltos, nivelAvance)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      tiempoInvertido = tiempoInvertido + VALUES(tiempoInvertido),
      ejerciciosResueltos = ejerciciosResueltos + VALUES(ejerciciosResueltos),
      nivelAvance = VALUES(nivelAvance),
      fecha_ultima_actualizacion = CURRENT_TIMESTAMP;
  `;

  connection.query(
    sqlInsert,
    [idEstudiante, tiempoInvertido || 0, ejerciciosResueltos || 0, nivelAvance || 0],
    (err, result) => {
      if (err) {
        console.error("❌ SQL registrar estadística:", err);
        return res.status(500).json({ message: "Error al registrar estadística" });
      }
      console.log("✅ Estadística registrada/actualizada para estudiante:", idEstudiante);
      res.json({ ok: true, message: "Estadística registrada correctamente" });
    }
  );
});


app.post("/api/estudiantecontenido/registrar", (req, res) => {
  const { idEstudiante, fk_idContenido, modulo, tema, nombreArchivo } = req.body;

  console.log("📥 /api/estudiantecontenido/registrar -> body:", req.body);

  if (!idEstudiante || !modulo) {
    console.warn("⚠️ Faltan campos obligatorios");
    return res.status(400).json({ error: "Faltan campos obligatorios: idEstudiante o modulo" });
  }

  // Limpieza y seguridad
  const temaSafe = tema && tema.trim() !== "" ? tema.trim() : "Sin tema";
  const fkSafe = fk_idContenido && fk_idContenido !== "" ? fk_idContenido : null;
  const nombreSafe = nombreArchivo && nombreArchivo !== "" ? nombreArchivo : null;

  // 💾 Inserta o actualiza según el estudiante y módulo
  const sql = `
    INSERT INTO EstudianteContenido 
      (fk_idEstudiante, fk_idContenido, modulo, tema, nombreArchivo, fechaConsulta)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE 
      tema = VALUES(tema),
      fk_idContenido = COALESCE(VALUES(fk_idContenido), fk_idContenido),
      nombreArchivo = COALESCE(VALUES(nombreArchivo), nombreArchivo),
      fechaConsulta = NOW();
  `;

  connection.query(sql, [idEstudiante, fkSafe, modulo, temaSafe, nombreSafe], (err, result) => {
    if (err) {
      console.error("❌ Error SQL al registrar vista:", err);
      return res.status(500).json({ error: "Error SQL al registrar vista" });
    }

    console.log(`✅ Vista registrada/actualizada para estudiante ${idEstudiante} → módulo ${modulo}`);
    res.json({ ok: true, message: "Vista registrada o actualizada correctamente" });
  });
});





app.post("/api/estadistica/contenido", (req, res) => {
  const { idEstudiante, fk_idContenido, tiempoInvertido } = req.body;

  if (!idEstudiante || !fk_idContenido) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  const sql = `
    INSERT INTO EstadisticaContenido (fk_idEstudiante, fk_idContenido, tiempoInvertido)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      tiempoInvertido = tiempoInvertido + VALUES(tiempoInvertido),
      fechaActualizacion = CURRENT_TIMESTAMP
  `;

  connection.query(sql, [idEstudiante, fk_idContenido, tiempoInvertido || 1], (err) => {
    if (err) {
      console.error("❌ Error registrando tiempo por contenido:", err);
      return res.status(500).json({ message: "Error al registrar tiempo" });
    }
    console.log(`⏱️ Tiempo sumado (${tiempoInvertido} min) en contenido ${fk_idContenido} para estudiante ${idEstudiante}`);
    res.json({ ok: true });
  });
});



import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Servir el build de React
app.use(express.static(path.join(__dirname, "dist")));

// ✅ Cualquier ruta que no sea API devuelve el index.html
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    next();
  }
});






// =========================
/* INICIAR SERVIDOR */
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Accesible desde red local en: http://192.168.1.49:${PORT}`);
});
