import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

export default function EstadisticasDesempeno() {
  const [data, setData] = useState([]);

 const formatTiempo = (minutos) => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  if (horas > 0) {
    // 🔹 Muestra "1 hora", "2 horas" y "5 minutos"
    return `${horas} ${horas === 1 ? "hora" : "horas"} ${
      mins > 0 ? `${mins} ${mins === 1 ? "minuto" : "minutos"}` : ""
    }`;
  }

  return `${mins} ${mins === 1 ? "minuto" : "minutos"}`;
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 Cargando estadísticas desde /api/estadisticas/vista...");
        const res = await fetch("http://localhost:3001/api/estadisticas/vista");
        if (!res.ok) throw new Error("Error al obtener estadísticas");
        const result = await res.json();

        // 🔁 Convertir campos numéricos (por si vienen como strings)
        const normalizados = result.map((r) => ({
          ...r,
          tiempo_total: Number(r.tiempo_total) || 0,
          ejercicios_totales: Number(r.ejercicios_totales) || 0,
          avance_promedio: Number(r.avance_promedio) || 0,
          contenidos_vistos: Number(r.contenidos_vistos) || 0,
        }));

        console.log("📊 Datos cargados:", normalizados);
        setData(normalizados);
      } catch (err) {
        console.error("❌ Error cargando estadísticas:", err);
      }
    };

    fetchData();
  }, []);



  // 🔁 Refrescar automáticamente cuando hay cambios en EstudianteContenido
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3001/api/estadisticas/vista");
      const data = await res.json();
      setData(data);
    } catch (err) {
      console.error("⚠️ Error al refrescar estadísticas:", err);
    }
  }, 10000); // cada 10 segundos

  return () => clearInterval(interval);
}, []);





  return (
    <div style={{ textAlign: "center", padding: "1rem" }}>
      <h3 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
        📊 Estadísticas de Desempeño de Estudiantes
      </h3>
      <p>Visualiza el rendimiento general de los estudiantes según su avance, tiempo y ejercicios.</p>

      {data.length === 0 ? (
        <p style={{ color: "#555" }}>No hay datos disponibles.</p>
      ) : (
        <>
          <BarChart
            width={800}
            height={300}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estudiante" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="avance_promedio" fill="#2563eb" name="Avance (%)" />
            <Bar dataKey="ejercicios_totales" fill="#f97316" name="Ejercicios" />
            <Bar dataKey="tiempo_total" fill="#16a34a" name="Tiempo (min)" />
          </BarChart>

          <table
            style={{
              width: "100%",
              marginTop: "20px",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                <th>Estudiante</th>
                <th>Tiempo Total</th>
                <th>Ejercicios</th>
                <th>Avance (%)</th>
                <th>Contenidos Vistos</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td>{row.estudiante}</td>
                  <td>{formatTiempo(row.tiempo_total)}</td>
                  <td>{row.ejercicios_totales}</td>
                  <td>{row.avance_promedio}</td>
                  <td>{row.contenidos_vistos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
