import React, { useState, useEffect } from "react";
import "./TeacherStudents.css";
import EstadisticasDesempeno from "./EstadisticasDesempeno";

export default function TeacherStudents({ view, setView }) {
  // Datos del reporte
  const [reporteData, setReporteData] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const idProfesor = user?.idProfesor || 0;

  // Cargar reporte desde backend
  const cargarReporte = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/reporte/general`);
      if (!res.ok) throw new Error("Error al obtener el reporte");
      const data = await res.json();
      setReporteData(data);
    } catch (err) {
      console.error("❌ Error cargando reporte:", err);
      alert("No se pudo cargar el reporte de estudiantes.");
    }
  };

  // Si entras a "reporte", carga datos (una vez por entrada)
  useEffect(() => {
    if (view === "reporte") {
      cargarReporte();
    }
  }, [view]); // eslint-disable-line





  return (
    <div
      style={{
        background: "#f9fafb",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "1100px",
        margin: "auto",
        marginTop: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
        Gestión de Estudiantes 👩‍🏫
      </h2>

      {/* Botones SIEMPRE visibles */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.0rem" }}>
        <button
          onClick={() => setView("reporte")}
          style={{
            background: view === "reporte" ? "#2563eb" : "#e5e7eb",
            color: view === "reporte" ? "white" : "black",
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          📘 Reporte de estudiante
        </button>

        <button
          onClick={() => setView("estadisticas")}
          style={{
            background: view === "estadisticas" ? "#2563eb" : "#e5e7eb",
            color: view === "estadisticas" ? "white" : "black",
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          📈 Estadísticas de desempeño
        </button>

        <button
          onClick={() => setView("asignar")}
          style={{
            background: view === "asignar" ? "#2563eb" : "#e5e7eb",
            color: view === "asignar" ? "white" : "black",
            padding: "10px 15px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          🧩 Asignar actividades
        </button>
      </div>

      {/* Contenido dinámico debajo (SIN duplicar botones) */}
      <div
        style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          minHeight: "200px",
          overflowY: "auto",
          maxHeight: "520px",
        }}
      >
        {view === "reporte" && (
          <>
            {reporteData.length > 0 ? (
              // Agrupar por estudiante
              Object.entries(
                reporteData.reduce((acc, fila) => {
                  if (!acc[fila.nombre_estudiante]) acc[fila.nombre_estudiante] = [];
                  acc[fila.nombre_estudiante].push(fila);
                  return acc;
                }, {})
              ).map(([nombre, detalles], idx) => (
                <div key={idx} style={{ marginBottom: "1rem" }}>
                  {/* 🔹 Botón colapsable del estudiante */}
                  <button
                    onClick={() =>
                      setReporteData((prev) =>
                        prev.map((x) =>
                          x.nombre_estudiante === nombre
                            ? { ...x, expandido: !x.expandido }
                            : x
                        )
                      )
                    }
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "10px 15px",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    👨‍🎓 {nombre}
                  </button>

                  {/* 🔹 Detalles que aparecen al hacer clic */}
                  {detalles[0]?.expandido && (
                    <div
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        marginTop: "8px",
                        padding: "10px 15px",
                      }}
                    >
                      {detalles.map((r, j) => (
                        <div
                          key={j}
                          style={{
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            padding: "8px 10px",
                          }}
                        >
                          <strong>📘 Módulo:</strong> {r.modulo_nombre || "—"} <br />
                          <strong>📗 Tema:</strong> {r.tema || "—"} <br />
                          <strong>📄 Archivo:</strong> {r.archivo || "—"} <br />
                          <strong>🕓 Tiempo en tema:</strong>{" "}
                          {r.tiempo_tema ? `${r.tiempo_tema} min` : "0 min"} <br />
                          <small style={{ color: "#555" }}>
                            Fecha: {r.fecha_ultima_consulta || "—"}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "#374151" }}>
                No hay datos aún. Pulsa “Aceptar” para recargar, o selecciona otra opción.
              </p>
            )}

          </>
        )}

        {view === "estadisticas" && <EstadisticasDesempeno />}

        {view === "asignar" && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>📘 Módulo para asignar actividades (pendiente o en desarrollo)</p>
          </div>
        )}
      </div>

      {/* Pie */}
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => {
            if (view === "reporte") cargarReporte();
            alert("✅ Acción ejecutada: " + view);
          }}
        >
          Aceptar ✅
        </button>

        <div
          style={{
            background: "#facc15",
            padding: "5px 10px",
            borderRadius: "6px",
            color: "#78350f",
            fontSize: "14px",
          }}
        >
          💡 Ayuda: selecciona una opción y luego haz clic en Aceptar.
        </div>
      </div>
    </div>
  );
}
