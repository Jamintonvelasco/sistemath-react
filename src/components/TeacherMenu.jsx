import React, { useState, useEffect } from "react";
import "./TeacherMenu.css";
import TeacherStudents from "./TeacherStudents";
import EstadisticasDesempeno from "./EstadisticasDesempeno";


const temasData = [
  { id: 1, nombre: "Modelación por medio de sistemas" },
  { id: 2, nombre: "Geometría de sistemas" },
  { id: 3, nombre: "Método analítico para SE" },
  { id: 4, nombre: "Método de Euler para sistemas" },
  { id: 5, nombre: "Ecuaciones de Lorenz" },
];

const acciones = ["Crear", "Eliminar", "Editar", "Actualizar"];

const TeacherMenu = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("contenido");
  const [view, setView] = useState("reporte"); // reporte | estadisticas | asignar
  

  const [temaSeleccionado, setTemaSeleccionado] = useState(null);
  const [accionSeleccionada, setAccionSeleccionada] = useState("");
  const [enunciado, setEnunciado] = useState("");
  const [seccionSeleccionada, setSeccionSeleccionada] = useState("teoria");

  const [contenidos, setContenidos] = useState([]);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [archivos, setArchivos] = useState([]);

  const idUsuario = 1; // temporal

  // ============================
  // EFECTO AL CAMBIAR DE TEMA
  // ============================
  useEffect(() => {
    if (temaSeleccionado) {
      setAccionSeleccionada("");
      setEnunciado("");
      setContenidoSeleccionado(null);
      listarContenidos();
      listarArchivos();
    }
  }, [temaSeleccionado]);


  const listarContenidos = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/contenido/listar/${idUsuario}/${encodeURIComponent(
          temaSeleccionado.nombre
        )}`
      );
      const data = await res.json();

      // 🔁 Convertir habilitado a booleano para que React detecte los cambios
      const normalizados = Array.isArray(data)
        ? data.map((item) => ({
          ...item,
          habilitado: item.habilitado === 1 || item.habilitado === true,
        }))
        : [];

      setContenidos(normalizados);
    } catch (error) {
      console.error("Error al obtener contenidos:", error);
      alert("❌ No se pudieron cargar los contenidos.");
    }
  };



  const crearContenido = async () => {
    if (!temaSeleccionado) return alert("Selecciona un tema primero.");
    if (!enunciado.trim()) return alert("Escribe el enunciado para crear.");

    try {
      const res = await fetch("http://localhost:3001/api/contenido/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fk_idProfesor: idUsuario,
          tipo: temaSeleccionado.nombre,
          descripcion: enunciado.trim(),
          seccion: seccionSeleccionada, // 👈 agregado
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert("❌ Error al crear contenido: " + (data?.message || res.statusText));
        return;
      }

      alert("✅ Contenido creado correctamente");
      setEnunciado("");
      await listarContenidos();
    } catch (err) {
      console.error(err);
      alert("❌ Error al crear contenido");
    }
  };

  const editarContenido = () => {
    if (!contenidoSeleccionado)
      return alert("Selecciona un contenido para editar.");
    setEnunciado(contenidoSeleccionado.descripcion || "");
    setAccionSeleccionada("Editar");
  };

  const actualizarContenido = async () => {
    if (!contenidoSeleccionado) return alert("Selecciona un contenido.");
    if (!enunciado.trim()) return alert("Escribe algo para actualizar.");

    try {
      const res = await fetch(
        `http://localhost:3001/api/contenido/actualizar/${contenidoSeleccionado.idContenido}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevaDescripcion: enunciado.trim() }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        return alert("❌ Error al actualizar: " + (data?.message || res.statusText));

      alert("✅ Contenido actualizado correctamente");
      await listarContenidos();
      setEnunciado("");
      setAccionSeleccionada("");
      setContenidoSeleccionado(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar contenido");
    }
  };

  const eliminarContenido = async () => {
    if (!contenidoSeleccionado) return alert("Selecciona uno para eliminar.");
    if (!window.confirm("¿Seguro que deseas eliminarlo?")) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/contenido/eliminar/${contenidoSeleccionado.idContenido}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        return alert("❌ Error al eliminar: " + (data?.message || res.statusText));

      alert("🗑️ Contenido eliminado");
      await listarContenidos();
      setEnunciado("");
      setContenidoSeleccionado(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar contenido");
    }
  };

  const handleAccion = async (accion) => {
    setAccionSeleccionada(accion);
    if (accion === "Crear") await crearContenido();
    if (accion === "Editar") editarContenido();
    if (accion === "Actualizar") await actualizarContenido();
    if (accion === "Eliminar") await eliminarContenido();
  };

  // ============================
  // ============================
  // ARCHIVOS — por tema (SIN tocar tu CRUD)
  // ============================
  const listarArchivos = async () => {
    if (!temaSeleccionado) return;
    try {
      const tema = temaSeleccionado.nombre.trim();
      const res = await fetch(
        `http://localhost:3001/api/contenido/archivos/${encodeURIComponent(tema)}`
      );
      const data = await res.json();
      // data: [{tema, nombreArchivo, rutaArchivo, storedFilename, enabled, fecha}]
      setArchivos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Error al obtener archivos:", error);
    }
  };

  const handleSubirArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!temaSeleccionado) return alert("Selecciona un tema primero.");

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("tema", temaSeleccionado.nombre.trim());

    try {
      const res = await fetch("http://localhost:3001/api/contenido/subir", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        alert(`✅ Archivo subido: ${data.nombre}`);
        await listarArchivos();
      } else {
        alert("❌ " + (data?.message || "No se pudo subir el archivo"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error al subir archivo");
    }
  };

  const handleToggleArchivo = async (storedFilename, enabled) => {
    try {
      const res = await fetch("http://localhost:3001/api/contenido/archivo/habilitar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storedFilename, enabled }),
      });
      const data = await res.json();
      if (!res.ok) return alert("❌ " + (data?.message || "No se pudo actualizar"));
      await listarArchivos();
    } catch (e) {
      console.error(e);
      alert("❌ Error al habilitar/deshabilitar");
    }
  };

  const handleEliminarArchivo = async (storedFilename) => {
    if (!window.confirm("¿Seguro que deseas eliminar este archivo?")) return;
    try {
      const res = await fetch("http://localhost:3001/api/contenido/archivo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storedFilename }),
      });
      const data = await res.json();
      if (!res.ok) return alert("❌ " + (data?.message || "No se pudo eliminar"));
      await listarArchivos();
    } catch (e) {
      console.error(e);
      alert("❌ Error al eliminar archivo");
    }
  };




  {
    archivos.map((file) => (
      <li
        key={file.storedFilename}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
          borderBottom: "1px solid #ccc",
          padding: "5px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          📎{" "}
          <a
            href={`http://localhost:3001${file.rutaArchivo}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: 8, textDecoration: "none", color: "#007bff" }}
          >
            {file.nombreArchivo}
          </a>

          <span
            style={{
              fontSize: "12px",
              opacity: 0.7,
              color: file.enabled ? "green" : "gray",
            }}
          >
            {file.enabled ? "✔️ Visible para estudiante" : "🚫 Oculto"}
          </span>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => handleToggleArchivo(file.storedFilename, !file.enabled)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #666",
              backgroundColor: file.enabled ? "#e7f7ee" : "#fff7e7",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {file.enabled ? "Deshabilitar" : "Habilitar"}
          </button>

          <button
            onClick={() => handleEliminarArchivo(file.storedFilename)}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              border: "1px solid #c33",
              background: "#ffecec",
              color: "#c00",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            🗑️ Eliminar
          </button>
        </div>

          



      </li>
    ))
  }



  // ============================
  // FINALIZAR
  // ============================
  const handleFinalizar = () => {
    if (window.confirm("¿Deseas regresar al menú principal del profesor?")) {
      setTemaSeleccionado(null);
      setAccionSeleccionada("");
      setEnunciado("");
      setContenidoSeleccionado(null);
      setArchivos([]);
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="teacher-page">
      <header className="teacher-header">
        <div className="header-top">
          <div className="logo">SisteMath</div>
          <div className="user-info">
            <div className="user-info">
              {(() => {
                const user = JSON.parse(localStorage.getItem("user"));
                const nombre = user?.nombre || "Profe";
                return <span>Bienvenido, {nombre}</span>;
              })()}
              <button className="logout" onClick={onLogout}>
                Cerrar sesión
              </button>
            </div>

          </div>
        </div>
        <div className="header-bottom teacher-nav">
          <button
            className={activeTab === "contenido" ? "active" : ""}
            onClick={() => setActiveTab("contenido")}
          >
            Gestión de contenido
          </button>

          <button
            className={activeTab === "ejemplos" ? "active" : ""}
            onClick={() => setActiveTab("ejemplos")}
          >
            Ejemplos
          </button>

          <button
            className={activeTab === "estudiantes" ? "active" : ""}
            onClick={() => setActiveTab("estudiantes")}
          >
            Gestión de estudiante
          </button>
        </div>
        


      </header>



{activeTab === "estudiantes" ? (
  <TeacherStudents view={view} setView={setView} />
) : (



        <>

          <main className="teacher-main">
            <aside className="teacher-sidebar">
              <h3>Temas disponibles</h3>
              <ul>
                {temasData.map((tema) => (
                  <li
                    key={tema.id}
                    className={temaSeleccionado?.id === tema.id ? "active" : ""}
                    onClick={() => setTemaSeleccionado(tema)}
                  >
                    {tema.nombre}
                  </li>
                ))}
              </ul>
            </aside>

            <section className="teacher-content">
              {temaSeleccionado && (
                <div className="tema-panel">
                  <h2>{temaSeleccionado.nombre}</h2>

                  <div className="acciones">
                    {acciones.map((accion) => (
                      <button
                        key={accion}
                        className={accionSeleccionada === accion ? "accion-active" : ""}
                        onClick={() => handleAccion(accion)}
                      >
                        {accion}
                      </button>
                    ))}
                  </div>

                  <h3>Enunciado</h3>
                  <textarea
                    placeholder="Escribe aquí el contenido del tema..."
                    value={enunciado}
                    onChange={(e) => setEnunciado(e.target.value)}
                  />

                  {/* Selector de sección */}

                  <div className="acciones-finales">
                    <button
                      className="aceptar"
                      onClick={() => {
                        if (accionSeleccionada === "Crear") crearContenido();
                        else if (accionSeleccionada === "Actualizar") actualizarContenido();
                        else if (accionSeleccionada === "Eliminar") eliminarContenido();
                        else alert("Selecciona una acción primero.");
                      }}
                    >
                      Aceptar
                    </button>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      id="archivoInput"
                      style={{ display: "none" }}
                      onChange={handleSubirArchivo}
                    />
                    <button
                      className="subir"
                      onClick={() => document.getElementById("archivoInput").click()}
                    >
                      Subir archivo 📎
                    </button>

                    <button className="finalizar" onClick={handleFinalizar}>
                      Finalizar ⬅️
                    </button>
                  </div>

                  <section className="contenidos-creados">
                    <h3>📂 Contenidos de este tema</h3>

                    {contenidos.length === 0 && archivos.length === 0 ? (
                      <p>No hay contenidos aún para este tema.</p>
                    ) : (
                      <ul>
                        {contenidos.map((item) => (
                          <li
                            key={item.idContenido}
                            onClick={() => setContenidoSeleccionado(item)}
                            className={
                              contenidoSeleccionado?.idContenido === item.idContenido
                                ? "contenido-activo"
                                : ""
                            }
                            style={{
                              borderBottom: "1px solid #ddd",
                              paddingBottom: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <strong>{item.tipo}</strong>
                            {item.descripcion ? ` — ${item.descripcion}` : ""}

                            {/* Estado y botón de habilitar */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginTop: "4px",
                                marginLeft: "20px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: item.habilitado ? "green" : "gray",
                                }}
                              >
                                {item.habilitado
                                  ? "✔️ Visible para estudiantes"
                                  : "🚫 Oculto para estudiantes"}
                              </span>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const nuevoEstado = !item.habilitado;

                                    const res = await fetch(
                                      `http://localhost:3001/api/contenido/habilitar/${item.idContenido}`,
                                      {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ habilitado: nuevoEstado }),
                                      }
                                    );
                                    const data = await res.json();

                                    if (!res.ok) {
                                      alert("❌ Error al cambiar visibilidad: " + (data?.message || ""));
                                      return;
                                    }

                                    // ✅ Actualizar el estado local inmediatamente SIN esperar a listarContenidos
                                    setContenidos((prev) =>
                                      prev.map((c) =>
                                        c.idContenido === item.idContenido
                                          ? { ...c, habilitado: nuevoEstado }
                                          : c
                                      )
                                    );

                                    alert(data.message);
                                  } catch (err) {
                                    console.error("❌ Error al habilitar contenido:", err);
                                    alert("❌ Error al cambiar visibilidad del contenido");
                                  }
                                }}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #666",
                                  backgroundColor: item.habilitado ? "#e7f7ee" : "#fff7e7",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                {item.habilitado ? "Deshabilitar" : "Habilitar"}
                              </button>
                              {/* Botones para asignar sección */}
                              <div style={{ display: "flex", gap: "8px", marginTop: "6px", marginLeft: "20px" }}>
                                {["teoria", "ejemplos", "practica"].map((sec) => (
                                  <button
                                    key={sec}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const res = await fetch(
                                          `http://localhost:3001/api/contenido/seccion/${item.idContenido}`,
                                          {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ seccion: sec }),
                                          }
                                        );
                                        const data = await res.json();
                                        if (!res.ok) {
                                          alert("❌ Error: " + (data?.message || "No se pudo cambiar sección"));
                                          return;
                                        }

                                        // 🔁 Actualiza el estado local para reflejar la sección
                                        setContenidos((prev) =>
                                          prev.map((c) =>
                                            c.idContenido === item.idContenido
                                              ? { ...c, seccion: sec }
                                              : c
                                          )
                                        );

                                        alert(`✅ Sección actualizada a "${sec}"`);
                                      } catch (error) {
                                        console.error("❌ Error al actualizar sección:", error);
                                        alert("❌ Error al cambiar sección");
                                      }
                                    }}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "6px",
                                      border: "1px solid #007bff",
                                      backgroundColor: item.seccion === sec ? "#007bff" : "#fff",
                                      color: item.seccion === sec ? "#fff" : "#007bff",
                                      cursor: "pointer",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {sec.charAt(0).toUpperCase() + sec.slice(1)}
                                  </button>
                                ))}
                              </div>


                            </div>
                          </li>
                        ))}

                        {archivos.map((file) => (
                          <li
                            key={file.storedFilename}
                            style={{
                              borderBottom: "1px solid #ccc",
                              padding: "8px 0",
                              listStyle: "none",
                            }}
                          >
                            <div style={{ marginBottom: "6px" }}>
                              📎{" "}
                              <a
                                href={`http://localhost:3001${file.rutaArchivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "none", color: "#007bff", fontWeight: "bold" }}
                              >
                                {file.nombreArchivo}
                              </a>
                              <div
                                style={{
                                  fontSize: "12px",
                                  opacity: 0.7,
                                  color: file.enabled ? "green" : "gray",
                                  marginTop: "3px",
                                }}
                              >
                                {file.enabled ? "✔️ Visible para estudiante" : "🚫 Oculto"}
                              </div>
                            </div>

                            {/* Botones debajo del archivo */}
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                marginLeft: "24px",
                                marginTop: "4px",
                              }}
                            >
                              <button
                                onClick={() => handleToggleArchivo(file.storedFilename, !file.enabled)}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #666",
                                  backgroundColor: file.enabled ? "#e7f7ee" : "#fff7e7",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                {file.enabled ? "Deshabilitar" : "Habilitar"}
                              </button>

                              <button
                                onClick={() => handleEliminarArchivo(file.storedFilename)}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  border: "1px solid #c33",
                                  background: "#ffecec",
                                  color: "#c00",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </li>
                        ))}

                        

                      </ul>
                    )}
                  </section>
                </div>
              )}
            </section>
          </main>

          <footer className="teacher-footer">
            <button className="ayuda">Ayuda ❓</button>
            <span>
              💡 Selecciona una acción (Crear/Editar/Eliminar/Actualizar) y luego usa Aceptar.
            </span>
          </footer>
        </>
      )}

    </div>
  );
};

export default TeacherMenu;
