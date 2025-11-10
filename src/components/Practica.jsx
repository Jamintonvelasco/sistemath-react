import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Label
} from "recharts";
export default function Practica({ onTopicSelect }) {


  const [activeTopic, setActiveTopic] = useState(null);
  // --- para mostrar los contenidos habilitados del backend ---
  const [mostrarContenidos, setMostrarContenidos] = useState(false);
  const [contenidosHabilitados, setContenidosHabilitados] = useState([]);


  const topics = [
    { id: "Modelación por medio de sistemas", label: "Modelación por medio de sistemas" },
    { id: "Geometría de sistemas", label: "Geometría de sistemas" },
    { id: "Método analítico para SE", label: "Método analítico para SE" },
    { id: "Método de Euler para sistemas", label: "Método de Euler para sistemas" },
    { id: "Ecuaciones de Lorenz", label: "Ecuaciones de Lorenz" },
  ];

  // === Renderizado dinámico de contenidos locales ===
  const renderContent = () => {
    switch (activeTopic) {
      case "Modelación por medio de sistemas":
        return <ModelacionSistema />;
      case "Geometría de sistemas":
        return <GeometriaSistema />;
      case "Método analítico para SE":
        return <MetodoAnalitico />;
      case "Método de Euler para sistemas":
        return <MetodoEuler />;
      case "Ecuaciones de Lorenz":
        return <PracticaLorenz />;
      default:
        return <IntroPractica />;
    }
  };


  const verContenido = async () => {
    try {
      const temaLimpio = activeTopic.trim().replace(/\.$/, "");
      const res = await fetch(
        `http://localhost:3001/api/estudiante/contenido/${encodeURIComponent(temaLimpio)}`
      );
      const data = await res.json();

      if (!data || (!data.contenidos?.length && !data.archivos?.length)) {
        alert("⚠️ No hay contenidos habilitados para este tema aún.");
        return;
      }

      const combinados = [
        ...(data.contenidos || []),
        ...(data.archivos || []),
      ];

      setContenidosHabilitados(combinados);
      setMostrarContenidos(true);
    } catch (err) {
      console.error("Error al obtener contenidos habilitados:", err);
      alert("❌ Error al obtener los contenidos habilitados");
    }
  };

  return (
    <div className="module-container">
      <div className="menu-contenedor">
        {/* Menú lateral local */}
        <div className="menu-lateral">
          {topics.map((t) => (
            <button
              key={t.id}
              className={`menu-boton ${activeTopic === t.id ? "activo" : ""}`}
              onClick={() => {
                setActiveTopic(t.id);
                if (typeof onTopicSelect === "function") {
                  onTopicSelect(t.id); // ✅ notifica al padre
                }
              }}
            >
              {t.label}
            </button>
          ))}

        </div>

        {/* Contenido dinámico local */}
        <div className="contenido-principal">
          {renderContent()}

         

          {/* Mostrar contenidos habilitados */}
          {mostrarContenidos && (
            <div
              style={{
                margin: "15px auto",
                padding: "15px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#f8f9fa",
                width: "90%",
                maxWidth: "700px",
              }}
            >
              <h4 style={{ color: "#007bff" }}>📚 Contenidos habilitados</h4>
              {contenidosHabilitados.map((item, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  {item.descripcion && <p>✏️ {item.descripcion}</p>}
                  {item.nombreArchivo && (
                    <a
                      href={`http://localhost:3001${item.rutaArchivo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        // 🔹 Registrar la vista del archivo
                        const user = JSON.parse(localStorage.getItem("user"));
                        fetch("http://localhost:3001/api/estudiantecontenido/registrar", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            idEstudiante: user.idEstudiante,
                            modulo: "3", // Práctica
                            tema: activeTopic || "Sin tema",
                            fk_idContenido: item.idContenido || null,
                            nombreArchivo: item.nombreArchivo || "Archivo sin nombre",
                          }),
                        });
                      }}
                      style={{
                        color: "#007bff",
                        textDecoration: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      📂 {item.nombreArchivo}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );





}

/* ========================= CONTENIDOS ========================= */

// --- 0. Introducción general ---
function IntroPractica() {
  return (
    <div>
      <h2 className="titulo-modulo">Práctica Interactiva y Evaluación</h2>
      <p>
        En esta sesión pondrás a prueba tus conocimientos mediante ejercicios interactivos
        que te permitirán aplicar los conceptos vistos en teoría y ejemplos.
      </p>
      <p className="mt-3">
        La práctica se divide en los siguientes temas:
      </p>
      <ul>
        <li><strong>Modelación por medio de sistemas:</strong> crear modelos de crecimiento y simular resultados.</li>
        <li><strong>Geometría de sistemas:</strong> analizar campos direccionales y estabilidad.</li>
        <li><strong>Método analítico:</strong> resolver sistemas mediante técnicas exactas.</li>
        <li><strong>Método de Euler:</strong> aplicar métodos numéricos paso a paso.</li>
        <li><strong>Ecuaciones de Lorenz:</strong> explorar la dinámica caótica en sistemas no lineales.</li>
      </ul>
      <p className="mt-3">
        Selecciona un tema en el menú lateral para comenzar.
      </p>
    </div>
  );
}



function ModelacionSistema() {
  const [P0, setP0] = useState(100);
  const [k, setK] = useState(0.2);
  const [tMax, setTmax] = useState(40);
  const [q, setQ] = useState(1.0);
  const [V, setV] = useState(10.0);
  const [C0, setC0] = useState(0.0);
  const [Cin, setCin] = useState(2.0);

  const calcularCrecimiento = () => {
    const data = [];
    const dt = 0.1;
    for (let t = 0; t <= tMax; t += dt) {
      data.push({
        t,
        P: P0 * Math.exp(k * t),
      });
    }
    return data;
  };

  const calcularTanque = () => {
    const a = q / V;
    const data = [];
    const dt = 0.1;
    for (let t = 0; t <= 5 * V / q; t += dt) {
      const C = Cin + (C0 - Cin) * Math.exp(-a * t);
      data.push({ t, C });
    }
    return data;
  };

  const crecimiento = calcularCrecimiento();
  const tanque = calcularTanque();

  const t2 = Math.log(2) / k;
  const a = q / V;
  const T = 1 / a;
  const t95 = -Math.log(0.05) / a;

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="titulo-modulo">Práctica: Modelación por Medio de Sistemas</h2>
      <p>
        En esta práctica se analizan dos sistemas dinámicos modelados mediante ecuaciones
        diferenciales ordinarias de primer orden:
      </p>
      <ul>
        <li>
          <strong>Crecimiento o decaimiento exponencial:</strong> un modelo simple de
          población o cantidad que varía proporcionalmente a su valor actual.
        </li>
        <li>
          <strong>Tanque CSTR:</strong> un reactor perfectamente mezclado donde la
          concentración se ajusta gradualmente hacia la del flujo de entrada.
        </li>
      </ul>

      <hr />
      <h3 style={{ color: "#1e40af" }}>I. Crecimiento Exponencial</h3>
      <p>
        Modelo matemático:{" "}
        <span style={{ fontFamily: "monospace" }}>
          dP/dt = k P, &nbsp;&nbsp; P(t) = P₀ e^(k t)
        </span>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          maxWidth: 700,
          marginBottom: 20,
        }}
      >
        <div>
          <label>P₀ (valor inicial):</label>
          <input
            type="number"
            value={P0}
            step="10"
            onChange={(e) => setP0(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>k (constante de crecimiento):</label>
          <input
            type="number"
            value={k}
            step="0.05"
            onChange={(e) => setK(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Tiempo máximo:</label>
          <input
            type="number"
            value={tMax}
            step="5"
            onChange={(e) => setTmax(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <Plot
        data={[
          {
            x: crecimiento.map((p) => p.t),
            y: crecimiento.map((p) => p.P),
            type: "scatter",
            mode: "lines",
            line: { color: "#2563eb", width: 3 },
            name: "P(t)",
          },
          {
            x: [t2],
            y: [P0 * Math.exp(k * t2)],
            type: "scatter",
            mode: "markers+text",
            text: [`t₂ = ${t2.toFixed(2)} min`],
            textposition: "top right",
            marker: { color: "#ef4444", size: 10 },
            name: "Tiempo de duplicación",
          },
        ]}
        layout={{
          title: "Crecimiento Exponencial",
          xaxis: { title: "Tiempo t" },
          yaxis: { title: "P(t)" },
          height: 450,
          margin: { l: 60, r: 30, b: 50, t: 40 },
        }}
      />

      <div style={{ marginTop: 15, color: "#374151" }}>
        <p>
          <strong>Constante de tiempo:</strong> τ = 1/k = {(1 / k).toFixed(2)} unidades de
          tiempo.
        </p>
        <p>
          <strong>Tiempo de duplicación:</strong> t₂ = ln(2)/k = {t2.toFixed(2)}.
        </p>
        <p>
          <strong>Interpretación:</strong> si k&gt;0 el sistema crece exponencialmente;
          si k&lt;0 el sistema decae. La tasa k controla la velocidad de cambio.
        </p>
      </div>

      <hr />
      <h3 style={{ color: "#047857", marginTop: "2rem" }}>II. Tanque CSTR</h3>
      <p>
        Modelo matemático:{" "}
        <span style={{ fontFamily: "monospace" }}>
          dC/dt = (q/V)(C_in - C), &nbsp;&nbsp; C(t) = C_in + (C0 - C_in) * e^(-(q/V)t)
        </span>

      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          maxWidth: 700,
          marginBottom: 20,
        }}
      >
        <div>
          <label>q (caudal):</label>
          <input
            type="number"
            value={q}
            step="0.1"
            onChange={(e) => setQ(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>V (volumen):</label>
          <input
            type="number"
            value={V}
            step="0.1"
            onChange={(e) => setV(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>C₀ (inicial):</label>
          <input
            type="number"
            value={C0}
            step="0.1"
            onChange={(e) => setC0(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>C_in (entrada):</label>
          <input
            type="number"
            value={Cin}
            step="0.1"
            onChange={(e) => setCin(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <Plot
        data={[
          {
            x: tanque.map((p) => p.t),
            y: tanque.map((p) => p.C),
            type: "scatter",
            mode: "lines",
            line: { color: "#10b981", width: 3 },
            name: "C(t)",
          },
          {
            x: [0, 5 * V / q],
            y: [Cin, Cin],
            type: "scatter",
            mode: "lines",
            line: { color: "#f59e0b", dash: "dot" },
            name: "Estado estacionario",
          },
          {
            x: [T],
            y: [Cin + (C0 - Cin) * Math.exp(-a * T)],
            type: "scatter",
            mode: "markers+text",
            text: [`τ = ${T.toFixed(1)}`],
            textposition: "top right",
            marker: { color: "#dc2626", size: 10 },
            name: "Constante de tiempo",
          },
          {
            x: [t95],
            y: [Cin + (C0 - Cin) * Math.exp(-a * t95)],
            type: "scatter",
            mode: "markers+text",
            text: [`t95 = ${t95.toFixed(1)}`],
            textposition: "top right",
            marker: { color: "#1d4ed8", size: 10 },
            name: "95% del equilibrio",
          },
        ]}
        layout={{
          title: "Concentración en tanque CSTR",
          xaxis: { title: "Tiempo t" },
          yaxis: { title: "C(t)" },
          height: 450,
          margin: { l: 60, r: 30, b: 50, t: 40 },
        }}
      />

      <div style={{ marginTop: 15, color: "#374151" }}>
        <p>
          <strong>Constante de tiempo:</strong> τ = V/q = {T.toFixed(2)}.
        </p>
        <p>
          <strong>Tiempo al 95% del equilibrio:</strong> t₉₅ = {t95.toFixed(2)}.
        </p>
        <p>
          <strong>Interpretación:</strong> el sistema alcanza el 95% de su valor
          estacionario tras aproximadamente tres constantes de tiempo. La concentración
          final coincide con la de entrada C_in.
        </p>
      </div>

      <hr />
      <h3 style={{ marginTop: "2rem", color: "#6b21a8" }}>Conclusión Didáctica</h3>
      <p>
        Ambos sistemas muestran cómo las ecuaciones diferenciales describen la evolución
        de cantidades en el tiempo. En ambos casos, el parámetro de tiempo característico
        (τ) define la velocidad de ajuste o crecimiento del sistema.
      </p>
    </div>
  );
}

// --- 1. Modelación por medio de sistemas ---
function GeometriaSistema() {
  const [k, setK] = useState(0.5);
  const [Ta, setTa] = useState(20);
  const [T0, setT0] = useState(80);
  const [data, setData] = useState([]);
  const [derivativeData, setDerivativeData] = useState([]);

  // --- Ley de enfriamiento de Newton ---
  const dTdt = (T, k, Ta) => -k * (T - Ta);

  const simulate = () => {
    const dt = 0.2;
    const totalTime = 20;
    let T = T0;
    const tempResults = [];
    const derivResults = [];

    for (let t = 0; t <= totalTime; t += dt) {
      const deriv = dTdt(T, k, Ta);
      tempResults.push({ t: t.toFixed(1), T: T.toFixed(2) });
      derivResults.push({ t: t.toFixed(1), dTdt: deriv.toFixed(4) });
      T += dt * deriv;
    }

    setData(tempResults);
    setDerivativeData(derivResults);
  };

  useEffect(() => {
    simulate();
  }, [k, Ta, T0]);

  return (
    <div>
      <h2 className="titulo-modulo">Práctica: Geometría de Sistemas</h2>
      <p>
        En esta práctica explorarás geométricamente la{" "}
        <strong>Ley de Enfriamiento de Newton</strong>.
        Ajusta los parámetros para observar cómo la temperatura evoluciona y cómo su
        velocidad de cambio tiende a cero al alcanzar el equilibrio{" "}
        <em>T = Tₐ</em>.
      </p>

      {/* --- Controles --- */}
      <div
        className="parametros"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
          maxWidth: 500,
        }}
      >
        <div>
          <label>k (constante):</label>
          <input
            type="number"
            step="0.1"
            value={k}
            onChange={(e) => setK(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label>Tₐ (ambiente °C):</label>
          <input
            type="number"
            value={Ta}
            onChange={(e) => setTa(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label>T₀ (inicial °C):</label>
          <input
            type="number"
            value={T0}
            onChange={(e) => setT0(parseFloat(e.target.value) || 0)}
          />
        </div>
        <button onClick={simulate}>Simular</button>
      </div>

      {/* ====== 1️⃣ Gráfica T(t) ====== */}
      {data.length > 0 && (
        <>
          <h3 style={{ color: "#1e40af", marginBottom: "8px" }}>
            Evolución de la Temperatura T(t)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                label={{ value: "Tiempo (horas)", position: "bottom" }}
              />
              <YAxis
                domain={[
                  Math.min(...data.map((d) => parseFloat(d.T))) - 5,
                  Math.max(...data.map((d) => parseFloat(d.T))) + 5,
                ]}
                label={{
                  value: "Temperatura T(t) (°C)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />

              <Line
                type="monotone"
                dataKey="T"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                name="Temperatura del cuerpo"
              />

              {/* Línea verde de equilibrio */}
              <Line
                data={[
                  { t: 0, T: Ta },
                  { t: 20, T: Ta },
                ]}
                type="linear"
                stroke="#22c55e"
                strokeDasharray="5 5"
                dot={false}
                name={`Equilibrio Tₐ = ${Ta}°C`}
              />

              {/* Punto final */}
              <ReferenceDot
                x={data[data.length - 1].t}
                y={data[data.length - 1].T}
                r={6}
                fill="#ef4444"
              >
                <Label
                  value={`T = ${data[data.length - 1].T}°C`}
                  position="top"
                  fill="#ef4444"
                  fontSize={12}
                />
              </ReferenceDot>
            </LineChart>
          </ResponsiveContainer>

          {/* Texto explicativo */}
          <div style={{ marginTop: 15, color: "#374151" }}>
            <strong>Punto final:</strong> t = {data[data.length - 1].t} h, T(t) ={" "}
            {data[data.length - 1].T}°C <br />
            <strong>Equilibrio:</strong> T → {Ta}°C con k = {k}
          </div>

          {/* ====== 2️⃣ Gráfica dT/dt ====== */}
          <h3 style={{ color: "#b45309", marginTop: "2rem", marginBottom: "8px" }}>
            Derivada de la temperatura: dT/dt
          </h3>

          <p
            style={{
              background: "#f3f4f6",
              padding: "8px 10px",
              borderRadius: "6px",
              fontFamily: "Courier New, monospace",
              display: "inline-block",
              marginBottom: "1rem",
            }}
          >
            dT/dt = -k · (T - Tₐ)
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={derivativeData}
              margin={{ top: 20, right: 30, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                label={{ value: "Tiempo (horas)", position: "bottom" }}
              />
              <YAxis
                label={{
                  value: "dT/dt (°C/h)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />

              <Line
                type="monotone"
                dataKey="dTdt"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                name="Velocidad dT/dt"
              />

              {/* Línea horizontal en dT/dt = 0 */}
              <Line
                data={[
                  { t: 0, dTdt: 0 },
                  { t: 20, dTdt: 0 },
                ]}
                stroke="#22c55e"
                strokeDasharray="5 5"
                dot={false}
                name="dT/dt = 0 (equilibrio)"
              />
            </LineChart>
          </ResponsiveContainer>

          <p style={{ color: "#4b5563", marginTop: "10px", lineHeight: 1.5 }}>
            Observa cómo la pendiente <strong>dT/dt</strong> comienza negativa (enfriamiento)
            y se aproxima a cero cuando <strong>T → Tₐ</strong>. Esto indica que el sistema
            alcanza su equilibrio térmico, donde la temperatura deja de cambiar.
          </p>

          {/* ====== 3️⃣ Tabla ====== */}
          <div style={{ marginTop: 25 }}>
            <h4>Evolución de la temperatura (detalle)</h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>t (h)</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>T(t) (°C)</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>dT/dt (°C/h)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.t}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.T}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>
                      {derivativeData[i]?.dTdt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}



// --- 3. Método analítico ---
function MetodoAnalitico() {
  const [Q, setQ] = useState(5); // Caudal (L/min)
  const [V, setV] = useState(100); // Volumen (L)
  const [Cin, setCin] = useState(2.0); // Concentración de entrada (g/L)
  const [C0, setC0] = useState(0.5); // Concentración inicial (g/L)
  const [Ctarget, setCtarget] = useState(1.8); // Para calcular tiempo de llegada
  const [data, setData] = useState([]);
  const [results, setResults] = useState({});

  const simulate = () => {
    const k = Q / V;
    const tau = 1 / k;
    const dt = 5; // paso temporal
    const totalTime = 300;
    const results = [];
    const exp = Math.exp;

    for (let t = 0; t <= totalTime; t += dt) {
      const C = Cin - (Cin - C0) * exp(-k * t);
      results.push({
        t,
        C: parseFloat(C.toFixed(4)),
        expTerm: parseFloat(exp(-k * t).toFixed(7)),
      });
    }

    // Cálculos complementarios
    const t90 = -Math.log(0.1) / k;
    const tToTarget = -Math.log((Cin - Ctarget) / (Cin - C0)) / k;

    setResults({
      k: k.toFixed(4),
      tau: tau.toFixed(2),
      t90: t90.toFixed(2),
      tToTarget: tToTarget.toFixed(2),
    });

    setData(results);
  };

  useEffect(() => {
    simulate();
  }, [Q, V, Cin, C0, Ctarget]);

  return (
    <div>
      <h2 className="titulo-modulo">Práctica: Método Analítico para Sistemas Especiales</h2>
      <p>
        En esta práctica se analiza un tanque perfectamente mezclado donde entra y sale una
        solución con concentración <strong>Cₐ = {Cin} g/L</strong> y flujo <strong>Q = {Q} L/min</strong>.
        La ecuación diferencial que modela el proceso es:
      </p>

      <p
        style={{
          background: "#f3f4f6",
          padding: "10px",
          borderRadius: "8px",
          fontFamily: "Courier New, monospace",
          display: "inline-block",
        }}
      >
        dC/dt = (Q/V) (C<sub>in</sub> - C)
      </p>

      <p>
        Su solución analítica es:
        <br />
        <strong>
          C(t) = C<sub>in</sub> - (C<sub>in</sub> - C₀)·e<sup>-k·t</sup> , con k = Q/V
        </strong>
      </p>

      {/* Controles */}
      <div
        className="parametros"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 20,
          maxWidth: 700,
        }}
      >
        <div>
          <label>Q (L/min):</label>
          <input
            type="number"
            value={Q}
            onChange={(e) => setQ(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>V (L):</label>
          <input
            type="number"
            value={V}
            onChange={(e) => setV(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>C<sub>in</sub> (g/L):</label>
          <input
            type="number"
            step="0.1"
            value={Cin}
            onChange={(e) => setCin(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>C₀ (g/L):</label>
          <input
            type="number"
            step="0.1"
            value={C0}
            onChange={(e) => setC0(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>C objetivo (g/L):</label>
          <input
            type="number"
            step="0.1"
            value={Ctarget}
            onChange={(e) => setCtarget(parseFloat(e.target.value))}
          />
        </div>
        <button onClick={simulate}>Simular</button>
      </div>

      {/* ===== Gráfica ===== */}
      {data.length > 0 && (
        <>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                label={{ value: "Tiempo (min)", position: "bottom" }}
              />
              <YAxis
                domain={[
                  Math.min(...data.map((d) => d.C)) - 0.5,
                  Math.max(...data.map((d) => d.C)) + 0.5,
                ]}
                label={{
                  value: "Concentración C(t) (g/L)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />

              <Line
                type="monotone"
                dataKey="C"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                name="C(t)"
              />
              <Line
                data={[
                  { t: 0, C: Cin },
                  { t: 300, C: Cin },
                ]}
                stroke="#22c55e"
                strokeDasharray="5 5"
                dot={false}
                name={`Equilibrio C* = ${Cin} g/L`}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* ===== Resultados ===== */}
          <div style={{ marginTop: 15, color: "#374151" }}>
            <h4>Resultados del sistema</h4>
            <ul>
              <li>k = {results.k} min⁻¹</li>
              <li>Constante de tiempo τ = {results.tau} min</li>
              <li>Tiempo para 90% del equilibrio: {results.t90} min</li>
              <li>
                Tiempo para alcanzar C = {Ctarget} g/L: {results.tToTarget} min
              </li>
            </ul>
          </div>

          {/* ===== Tabla ===== */}
          <div style={{ marginTop: 25 }}>
            <h4>Valores calculados</h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>t (min)</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>e<sup>-k·t</sup></th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>C(t) (g/L)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.t}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.expTerm}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.C}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ===== Explicación final ===== */}
          <p style={{ color: "#4b5563", marginTop: 20 }}>
            El sistema evoluciona hacia el equilibrio <strong>C* = C<sub>in</sub></strong>,
            de forma exponencial decreciente en la diferencia <em>(C<sub>in</sub> - C)</em>.
            Cuanto mayor es el caudal Q (y por tanto k = Q/V), más rápido se alcanza
            el equilibrio. El modelo analítico describe exactamente el comportamiento del
            tanque sin necesidad de resolver numéricamente la EDO.
          </p>
        </>
      )}
    </div>
  );
}


// --- 4. Método de Euler ---
function MetodoEuler() {
  const [h, setH] = useState(0.1); // paso temporal
  const [tMax, setTmax] = useState(0.5); // tiempo máximo
  const [data, setData] = useState([]);
  const [errorData, setErrorData] = useState([]);

  // --- Ecuación diferencial: dy/dt = y, y(0)=1 ---
  const f = (t, y) => y;

  const simulate = () => {
    const t0 = 0;
    const y0 = 1;
    const N = Math.floor(tMax / h);
    const results = [];
    const errors = [];

    let t = t0;
    let y = y0;

    for (let n = 0; n <= N; n++) {
      const exact = Math.exp(t);
      const error = Math.abs(exact - y);

      results.push({
        paso: n,
        t: parseFloat(t.toFixed(3)),
        yEuler: parseFloat(y.toFixed(6)),
        yExacta: parseFloat(exact.toFixed(6)),
        error: parseFloat(error.toFixed(6)),
      });

      errors.push({ t, error });

      // Método de Euler: y_{n+1} = y_n + h * f(t_n, y_n)
      y = y + h * f(t, y);
      t = t + h;
    }

    setData(results);
    setErrorData(errors);
  };

  useEffect(() => {
    simulate();
  }, [h, tMax]);

  return (
    <div>
      <h2 className="titulo-modulo">Práctica: Método de Euler</h2>
      <p>
        En esta práctica aplicarás el <strong>método de Euler explícito</strong> a la ecuación
        diferencial <em>dy/dt = y</em> con condición inicial <em>y(0) = 1</em>.
        La solución exacta es <strong>y(t) = e<sup>t</sup></strong>.
      </p>

      <p
        style={{
          background: "#f3f4f6",
          padding: "8px 10px",
          borderRadius: "6px",
          fontFamily: "Courier New, monospace",
          display: "inline-block",
        }}
      >
        yₙ₊₁ = yₙ + h·f(tₙ, yₙ)
      </p>

      <div
        className="parametros"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
          maxWidth: 600,
        }}
      >
        <div>
          <label>h (paso):</label>
          <input
            type="number"
            step="0.01"
            value={h}
            onChange={(e) => setH(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>t máx (s):</label>
          <input
            type="number"
            step="0.1"
            value={tMax}
            onChange={(e) => setTmax(parseFloat(e.target.value))}
          />
        </div>
        <button onClick={simulate}>Simular</button>
      </div>

      {data.length > 0 && (
        <>
          {/* ====== Gráfica de y(t): Euler vs Exacta ====== */}
          <h3 style={{ color: "#1e40af", marginBottom: "8px" }}>
            Comparación entre y<sub>Euler</sub> y y<sub>Exacta</sub>
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                label={{ value: "Tiempo t", position: "bottom" }}
              />
              <YAxis
                label={{
                  value: "y(t)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />
              <Line
                type="monotone"
                dataKey="yExacta"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={false}
                name="Solución exacta e^t"
              />
              <Line
                type="monotone"
                dataKey="yEuler"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={true}
                name="Aproximación de Euler"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* ====== Gráfica del error ====== */}
          <h3 style={{ color: "#b45309", marginTop: "2rem", marginBottom: "8px" }}>
            Error global acumulado
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={errorData}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                label={{ value: "Tiempo t", position: "bottom" }}
              />
              <YAxis
                label={{
                  value: "|y_exacta - y_Euler|",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />
              <Line
                type="monotone"
                dataKey="error"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={true}
                name="Error absoluto"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* ====== Tabla ====== */}
          <div style={{ marginTop: 25 }}>
            <h4>Resultados paso a paso</h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>n</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>tₙ</th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>
                    y<sub>Euler</sub>
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>
                    y<sub>Exacta</sub>
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "6px" }}>Error</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.paso}>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.paso}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.t}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.yEuler}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.yExacta}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px" }}>{row.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ====== Interpretación ====== */}
          <p style={{ color: "#4b5563", marginTop: 20, lineHeight: 1.6 }}>
            <strong>Interpretación:</strong>
            Cada paso de Euler usa la pendiente local f(tₙ, yₙ) para avanzar una distancia h.
            El método aproxima la curva real mediante segmentos lineales, por lo que tiende a
            <em> subestimar </em> la solución creciente e<sup>t</sup>.
            <br />
            Reducir el paso <strong>h</strong> mejora la precisión aproximadamente de manera
            lineal (error O(h)).
          </p>
        </>
      )}
    </div>
  );
}


// --- 5. Ecuaciones de Lorenz ---
function PracticaLorenz() {
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(8 / 3);
  const [x0, setX0] = useState(1);
  const [y0, setY0] = useState(1);
  const [z0, setZ0] = useState(1);
  const [h, setH] = useState(0.01);
  const [tMax, setTmax] = useState(30);
  const [data3D, setData3D] = useState([]);
  const [dataXZ, setDataXZ] = useState([]);
  const [dataTime, setDataTime] = useState([]);

  const simulate = () => {
    const steps = Math.floor(tMax / h);
    let x = x0, y = y0, z = z0;
    const traj3D = [];
    const trajXZ = [];
    const trajTime = [];

    for (let i = 0; i < steps; i++) {
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;

      x += h * dx;
      y += h * dy;
      z += h * dz;

      const t = i * h;
      traj3D.push({ x, y, z });
      trajXZ.push({ x, z });
      trajTime.push({ t, x, y, z });
    }

    setData3D(traj3D);
    setDataXZ(trajXZ);
    setDataTime(trajTime);
  };

  useEffect(() => {
    simulate();
  }, [sigma, rho, beta, x0, y0, z0, h, tMax]);

  return (
    <div>
      <h2 className="titulo-modulo">
        Práctica: Ecuaciones de Lorenz y Dinámica Caótica
      </h2>

      <p>
        En esta práctica se explora el <strong>sistema de Lorenz</strong>, un conjunto de tres
        ecuaciones diferenciales que modelan la convección atmosférica y dan origen al
        <strong> caos determinista</strong>.
      </p>

      <p
        style={{
          background: "#f3f4f6",
          padding: "10px",
          borderRadius: "8px",
          fontFamily: "Courier New, monospace",
          display: "inline-block",
        }}
      >
        dx/dt = σ (y − x), &nbsp; dy/dt = x (ρ − z) − y, &nbsp; dz/dt = x y − β z
      </p>

      {/* === Controles === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 25,
          maxWidth: 800,
        }}
      >
        <div>
          <label>σ (Prandtl):</label>
          <input
            type="number"
            value={sigma}
            step="0.1"
            onChange={(e) => setSigma(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>ρ (Rayleigh):</label>
          <input
            type="number"
            value={rho}
            step="0.1"
            onChange={(e) => setRho(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>β:</label>
          <input
            type="number"
            value={beta}
            step="0.1"
            onChange={(e) => setBeta(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>h (paso):</label>
          <input
            type="number"
            value={h}
            step="0.001"
            onChange={(e) => setH(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>Tiempo máx (s):</label>
          <input
            type="number"
            value={tMax}
            step="1"
            onChange={(e) => setTmax(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>x₀:</label>
          <input
            type="number"
            value={x0}
            step="0.1"
            onChange={(e) => setX0(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>y₀:</label>
          <input
            type="number"
            value={y0}
            step="0.1"
            onChange={(e) => setY0(parseFloat(e.target.value))}
          />
        </div>
        <div>
          <label>z₀:</label>
          <input
            type="number"
            value={z0}
            step="0.1"
            onChange={(e) => setZ0(parseFloat(e.target.value))}
          />
        </div>
        <button onClick={simulate}>Simular</button>
      </div>

      {/* === Gráfico 3D === */}
      {data3D.length > 0 && (
        <>
          <h3 style={{ color: "#1d4ed8" }}>Atractor de Lorenz (trayectoria 3D)</h3>
          <Plot
            data={[
              {
                x: data3D.map((p) => p.x),
                y: data3D.map((p) => p.y),
                z: data3D.map((p) => p.z),
                type: "scatter3d",
                mode: "lines",
                line: { width: 3, color: "#2563eb" },
                name: "Trayectoria",
              },
            ]}
            layout={{
              autosize: true,
              height: 500,
              margin: { l: 0, r: 0, b: 0, t: 0 },
              scene: {
                xaxis: { title: "x" },
                yaxis: { title: "y" },
                zaxis: { title: "z" },
              },
            }}
          />

          {/* === Gráfico 2D (proyección x-z) === */}
          <h3 style={{ color: "#059669", marginTop: "2rem" }}>
            Proyección en el plano (x, z)
          </h3>
          <Plot
            data={[
              {
                x: dataXZ.map((p) => p.x),
                y: dataXZ.map((p) => p.z),
                type: "scatter",
                mode: "lines",
                line: { width: 2, color: "#10b981" },
              },
            ]}
            layout={{
              autosize: true,
              height: 400,
              margin: { l: 60, r: 30, b: 50, t: 10 },
              xaxis: { title: "x" },
              yaxis: { title: "z" },
            }}
          />

          {/* === Gráfico temporal === */}
          <h3 style={{ color: "#b91c1c", marginTop: "2rem" }}>
            Evolución temporal de las variables
          </h3>
          <Plot
            data={[
              {
                x: dataTime.map((p) => p.t),
                y: dataTime.map((p) => p.x),
                type: "scatter",
                mode: "lines",
                name: "x(t)",
                line: { color: "#2563eb" },
              },
              {
                x: dataTime.map((p) => p.t),
                y: dataTime.map((p) => p.y),
                type: "scatter",
                mode: "lines",
                name: "y(t)",
                line: { color: "#16a34a" },
              },
              {
                x: dataTime.map((p) => p.t),
                y: dataTime.map((p) => p.z),
                type: "scatter",
                mode: "lines",
                name: "z(t)",
                line: { color: "#dc2626" },
              },
            ]}
            layout={{
              autosize: true,
              height: 400,
              margin: { l: 60, r: 30, b: 50, t: 10 },
              xaxis: { title: "Tiempo (s)" },
              yaxis: { title: "Valor de variable" },
            }}
          />

          {/* === Interpretación === */}
          <div style={{ marginTop: 25, color: "#374151" }}>
            <h4>Interpretación de resultados</h4>
            <ul>
              <li>
                <strong>Para ρ=28</strong>: el sistema entra en un régimen caótico; las trayectorias
                nunca se repiten.
              </li>
              <li>
                <strong>Para ρ&lt;10</strong>: el sistema tiende a un punto fijo, sin caos.
              </li>
              <li>
                Pequeñas variaciones en las condiciones iniciales producen trayectorias
                completamente distintas (efecto mariposa).
              </li>
            </ul>
            <p>
              El gráfico 3D muestra el <em>atractor de Lorenz</em>, una figura fractal que representa
              la región donde el sistema “vive” de manera estable pero impredecible.
            </p>
          </div>
        </>
      )}
    </div>
  );
}


