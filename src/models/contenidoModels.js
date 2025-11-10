// src/models/contenidoModel.js
import { connection } from "../bd.js";

export const ContenidoModel = {
  crear: (fk_idProfesor, tipo, descripcion, callback) => {
    connection.query("CALL CrearContenido(?, ?, ?)", [fk_idProfesor, tipo, descripcion], callback);
  },

  // AHORA recibe también el tipo (tema) para filtrar
  listarPorProfesor: (fk_idProfesor, tipo, callback) => {
    connection.query("CALL ObtenerContenidosProfesor(?, ?)", [fk_idProfesor, tipo], callback);
  },

  actualizar: (idContenido, nuevaDescripcion, callback) => {
    connection.query(
      "UPDATE contenido SET descripcion = ? WHERE idContenido = ?",
      [nuevaDescripcion, idContenido],
      callback
    );
  },

  eliminar: (idContenido, callback) => {
    connection.query("DELETE FROM contenido WHERE idContenido = ?", [idContenido], callback);
  },
};
