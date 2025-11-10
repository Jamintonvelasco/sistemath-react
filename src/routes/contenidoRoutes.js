// src/routes/contenidoRoutes.js
import { Router } from "express";
import { connection } from "../bd.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

/* LISTAR contenidos por profesor y tema (incluye sección) */
router.get("/listar/:idProfesor/:tema", (req, res) => {
  const { idProfesor, tema } = req.params;
  const sql = `
    SELECT idContenido, fk_idProfesor, tipo, descripcion, habilitado, seccion
    FROM Contenido
    WHERE fk_idProfesor = ? AND tipo = ?
    ORDER BY idContenido DESC
  `;
  connection.query(sql, [idProfesor, tema], (err, rows) => {
    if (err) {
      console.error("❌ Error SQL listar:", err);
      return res.status(500).json({ message: "Error al obtener contenidos" });
    }
    res.json(rows);
  });
});

/* CREAR contenido */
router.post("/crear", (req, res) => {
  const { fk_idProfesor, tipo, descripcion, seccion } = req.body || {};
  if (!fk_idProfesor || !tipo || !descripcion) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }
  const sql = `
    INSERT INTO Contenido (fk_idProfesor, tipo, descripcion, habilitado, seccion)
    VALUES (?, ?, ?, 0, ?)
  `;
  connection.query(sql, [fk_idProfesor, tipo.trim(), descripcion.trim(), seccion || null],
    (err, result) => {
      if (err) {
        console.error("❌ Error SQL crear:", err);
        return res.status(500).json({ message: "Error al crear contenido" });
      }
      res.status(201).json({ message: "Contenido creado", idContenido: result.insertId });
    }
  );
});

/* ACTUALIZAR descripción */
router.put("/actualizar/:idContenido", (req, res) => {
  const { idContenido } = req.params;
  const { nuevaDescripcion } = req.body || {};
  if (!nuevaDescripcion) {
    return res.status(400).json({ message: "Falta 'nuevaDescripcion'" });
  }
  const sql = "UPDATE Contenido SET descripcion = ? WHERE idContenido = ?";
  connection.query(sql, [nuevaDescripcion.trim(), idContenido], (err, result) => {
    if (err) {
      console.error("❌ Error SQL actualizar:", err);
      return res.status(500).json({ message: "Error al actualizar contenido" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }
    res.json({ message: "Contenido actualizado" });
  });
});

/* ELIMINAR contenido */
router.delete("/eliminar/:idContenido", (req, res) => {
  const { idContenido } = req.params;
  const sql = "DELETE FROM Contenido WHERE idContenido = ?";
  connection.query(sql, [idContenido], (err, result) => {
    if (err) {
      console.error("❌ Error SQL eliminar:", err);
      return res.status(500).json({ message: "Error al eliminar contenido" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contenido no encontrado" });
    }
    res.json({ message: "Contenido eliminado" });
  });
});


// 📁 NUEVA RUTA: listar archivos desde la vista SQL
router.get("/vista/archivos/:tema", (req, res) => {
  const { tema } = req.params;
  const sql = `
    SELECT idContenido, fk_idProfesor, tema, nombreArchivo, rutaArchivo, enabled, seccion
    FROM vista_archivos_por_tema
    WHERE tema = ?
    ORDER BY idContenido DESC
  `;
  connection.query(sql, [tema], (err, rows) => {
    if (err) {
      console.error("❌ Error SQL vista_archivos_por_tema:", err);
      return res.status(500).json({ message: "Error al obtener archivos desde la vista" });
    }
    res.json(rows);
  });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// === SUBIR ARCHIVO Y GUARDAR EN TABLA Contenido ===
router.post("/subir", upload.single("archivo"), (req, res) => {
  const { tema } = req.body;
  const file = req.file;

  if (!tema || !file) {
    return res.status(400).json({ message: "Faltan datos (tema o archivo)" });
  }

  const nombreArchivo = file.originalname;
  const rutaArchivo = `/uploads/${file.filename}`;

  const sql = `
    INSERT INTO Contenido (fk_idProfesor, tipo, nombreArchivo, rutaArchivo, habilitado, seccion)
    VALUES (1, ?, ?, ?, 1, 'teoria')
  `;

  connection.query(sql, [tema.trim(), nombreArchivo, rutaArchivo], (err, result) => {
    if (err) {
      console.error("❌ Error SQL al guardar archivo:", err);
      return res.status(500).json({ message: "Error al guardar archivo en la base de datos" });
    }

    res.json({
      message: "✅ Archivo subido correctamente",
      idContenido: result.insertId,
      nombre: nombreArchivo,
      ruta: rutaArchivo,
    });
  });
});

export default router;
