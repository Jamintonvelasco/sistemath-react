import React, { useState, useEffect, useRef } from "react";
import "./JuegoMemo.css";

export default function JuegoMemo() {
  const [temaSeleccionado, setTemaSeleccionado] = useState(1);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [avance, setAvance] = useState(0);
  const [jugando, setJugando] = useState(true);
  const [elementos, setElementos] = useState([]);
  const pezRef = useRef(null);
  const canvasRef = useRef(null);
  const [pezPos, setPezPos] = useState({ x: 10, y: 50 });
  const [pezRot, setPezRot] = useState(0);
  const [pantalla, setPantalla] = useState("inicio");

  const temas = [
    { id: 1, nombre: "Modelación por medio de sistemas" },
    { id: 2, nombre: "Geometría de sistemas" },
    { id: 3, nombre: "Método analítico para sistemas especiales" },
    { id: 4, nombre: "Método de Euler para sistemas" },
    { id: 5, nombre: "Ecuaciones de Lorenz" },
  ];

  // Pregunta principal
  useEffect(() => {
    setPregunta(
      "Un tanque CSTR tiene entrada q, volumen V y concentración de entrada Cin. ¿Cuál es la ecuación diferencial que describe C(t)?"
    );
  }, []);

  // Movimiento del pez (siguiendo el mouse)
  useEffect(() => {
    const moverPez = (e) => {
      const rio = document.querySelector(".rio");
      if (!rio) return;
      const rect = rio.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const deltaX = x - pezPos.x;
      const deltaY = y - pezPos.y;
      const angulo = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      setPezPos({
        x: Math.max(0, Math.min(90, x)),
        y: Math.max(10, Math.min(90, y)),
      });
      setPezRot(angulo);
    };

    window.addEventListener("mousemove", moverPez);
    return () => window.removeEventListener("mousemove", moverPez);
  }, [pezPos]);

  // Generar elementos flotantes
  useEffect(() => {
    if (!jugando) return;
    const intervalo = setInterval(() => {
      const nuevo = {
        id: Math.random(),
        x: Math.random() * 90,
        y: 0,
        simbolo: ["+", "-", "*", "/", "(", ")", "q", "v", "C", "Cin", "t"][
          Math.floor(Math.random() * 11)
        ],
      };
      setElementos((prev) => [...prev, nuevo]);
    }, 1500);
    return () => clearInterval(intervalo);
  }, [jugando]);

  // Movimiento río abajo
  useEffect(() => {
    if (!jugando) return;
    const anim = setInterval(() => {
      setElementos((prev) =>
        prev
          .map((el) => ({ ...el, y: el.y + 1.5 }))
          .filter((el) => el.y < 95)
      );
    }, 80);
    return () => clearInterval(anim);
  }, [jugando]);

  // Colisiones pez-elementos
  useEffect(() => {
    const pez = pezRef.current?.getBoundingClientRect();
    if (!pez) return;
    setElementos((prev) =>
      prev.filter((el) => {
        const elDom = document.getElementById(`el-${el.id}`);
        if (!elDom) return true;
        const rect = elDom.getBoundingClientRect();
        const colision =
          rect.left < pez.right &&
          rect.right > pez.left &&
          rect.top < pez.bottom &&
          rect.bottom > pez.top;
        if (colision) {
          setRespuesta((r) => (r.endsWith(el.simbolo) ? r : r + el.simbolo));
          return false;
        }
        return true;
      })
    );
  });

  // Limpiar mensaje y gráfica al escribir
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    setMensaje("");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [respuesta]);

  // Agregar símbolo
  const agregarSimbolo = (s) => setRespuesta((r) => r + s);

  // Verificar respuesta
  const manejarRespuesta = () => {
    const ecuacion = respuesta.replace(/\s+/g, "").toLowerCase();
    const ecuacionCorrecta = "dc/dt=(q/v)(cin-c)";
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calcular coincidencia progresiva
    let coincidencias = 0;
    for (let i = 0; i < ecuacion.length; i++) {
      if (ecuacion[i] === ecuacionCorrecta[i]) coincidencias++;
      else break;
    }

    const progreso = Math.round(
      (coincidencias / ecuacionCorrecta.length) * 100
    );
    setAvance(progreso);

    if (ecuacion === ecuacionCorrecta) {
      setMensaje("✅ Correcto. ¡Ecuación completada!");
      setAvance(100);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dibujarGrafica();
    } else if (coincidencias > 0) {
      setMensaje("⚙️ Muy bien, sigue completando la ecuación...");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      setMensaje("❌ Ecuación incorrecta o incompleta.");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Dibujar gráfica
  const dibujarGrafica = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const marginLeft = 45;
    const marginBottom = 25;
    const marginTop = 15;
    const marginRight = 15;
    const width = canvas.width - marginLeft - marginRight;
    const height = canvas.height - marginTop - marginBottom;

    ctx.lineWidth = 1.3;
    ctx.font = "11px Arial";
    ctx.strokeStyle = "#222";
    ctx.fillStyle = "#222";

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 5; i++) {
      const x = marginLeft + (i * width) / 5;
      ctx.beginPath();
      ctx.moveTo(x, marginTop);
      ctx.lineTo(x, marginTop + height);
      ctx.stroke();

      const y = marginTop + height - (i * height) / 5;
      ctx.beginPath();
      ctx.moveTo(marginLeft, y);
      ctx.lineTo(marginLeft + width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, marginTop + height);
    ctx.lineTo(marginLeft + width, marginTop + height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft - 4, marginTop + 8);
    ctx.lineTo(marginLeft + 4, marginTop + 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(marginLeft + width, marginTop + height);
    ctx.lineTo(marginLeft + width - 8, marginTop + height - 4);
    ctx.lineTo(marginLeft + width - 8, marginTop + height + 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#222";
    ctx.textAlign = "center";

    for (let i = 0; i <= 5; i++) {
      const x = marginLeft + (i * width) / 5;
      ctx.beginPath();
      ctx.moveTo(x, marginTop + height - 3);
      ctx.lineTo(x, marginTop + height + 3);
      ctx.stroke();
      ctx.fillText(`${i * 20}`, x, marginTop + height + 15);
    }

    ctx.textAlign = "right";
    for (let j = 0; j <= 5; j++) {
      const y = marginTop + height - (j * height) / 5;
      ctx.beginPath();
      ctx.moveTo(marginLeft - 3, y);
      ctx.lineTo(marginLeft + 3, y);
      ctx.stroke();
      ctx.fillText(`${j * 20}`, marginLeft - 8, y + 3);
    }

    ctx.font = "12px Arial";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.fillText("t", marginLeft + width + 10, marginTop + height + 5);
    ctx.save();
    ctx.translate(marginLeft - 25, marginTop - 5);
    ctx.fillText("C(t)", 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2;
    let first = true;
    for (let t = 0; t <= 100; t += 2) {
      const x = marginLeft + (t / 100) * width;
      const C = 100 * (1 - Math.exp(-t / 25));
      const y = marginTop + height - (C / 100) * height;
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    const arrowX = marginLeft + (70 / 100) * width;
    const arrowY =
      marginTop + height - (100 * (1 - Math.exp(-70 / 25)) / 100) * height;
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX + 6, arrowY - 2);
    ctx.lineTo(arrowX + 6, arrowY + 2);
    ctx.closePath();
    ctx.fillStyle = "#007bff";
    ctx.fill();
  };

  const iniciar = () => setJugando(true);
  const pausar = () => setJugando(false);
  const reiniciar = () => {
    setRespuesta("");
    setMensaje("");
    setAvance(0);
    setElementos([]);
    setJugando(true);
  };

  // 🔷 Pantalla de inicio
  if (pantalla === "inicio") {
    return (
      <div className="pantalla-inicio">
        <h2>🎮 Bienvenido al simulador de sistemas dinámicos</h2>
        <p>Selecciona un tema para comenzar:</p>
        <div className="lista-temas">
          {temas.map((t) => (
            <button
              key={t.id}
              className="boton-tema"
              onClick={() => {
                setTemaSeleccionado(t.id);
                setPantalla("juego");
                setRespuesta("");
                setMensaje("");
                setAvance(0);
                setElementos([]);
                setJugando(true);
              }}
            >
              {t.nombre}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 🔹 Juego del tema 1
  if (pantalla === "juego" && temaSeleccionado === 1) {
    return (
      <div className="juego-memo-completo">
        <div className="sol"></div>


        {/* Aves realistas */}
        <div className="aves">
          <div className="ave" style={{ animationDelay: "0s" }}></div>
          <div className="ave" style={{ animationDelay: "2s" }}></div>
          <div className="ave" style={{ animationDelay: "4s" }}></div>
        </div>
        {/* Barra de progreso */}
        <div className="barra-progreso">
          <div
            className="progreso"
            style={{
              width: `${avance}%`,
              transition: "width 0.4s ease-in-out",
              backgroundColor: avance < 100 ? "#00bfff" : "#28a745",
            }}
          ></div>
        </div>

        {/* Pregunta */}
        <div className="panel-pregunta compacto">
          <h3>Modelación por medio de sistemas</h3>
          <p>{pregunta}</p>
        </div>

        {/* Escenario */}
        {/* === ESCENARIO COMPLETO === */}
        <div className="escenario">
          {/* 🏔️ Montañas */}
          <div className="montanas"></div>

          {/* 🌲 Bosque alineado sobre las montañas */}
          <div className="bosque">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="arbol"
                style={{
                  left: `${i * 8}%`, // posición fija
                }}
              >
                <div className="tronco"></div>
                <div className="copa"></div>
              </div>
            ))}
          </div>


          {/* 🌊 Río */}
          <div className="rio">
            {elementos.map((el) => (
              <div
                id={`el-${el.id}`}
                key={el.id}
                className="elemento-flotante"
                style={{ left: `${el.x}%`, top: `${el.y}%` }}
              >
                {el.simbolo}
              </div>
            ))}

            {/* 🐟 Pez */}
            <div
              ref={pezRef}
              className="pez-memo"
              style={{
                top: `${pezPos.y}%`,
                left: `${pezPos.x}%`,
                transform: `rotate(${pezRot}deg)`,
              }}
            >
              <div className="cabeza"></div>
              <div className="cola"></div>
              <div className="ojo"></div>
            </div>
          </div>
        </div>





        {/* Panel inferior */}
        <div className="panel-inferior">
          <div className="bloque-grafica">
            <canvas ref={canvasRef} width="200" height="120"></canvas>
            <span className="etiqueta-grafica">Gráfica</span>
          </div>

          <div className="bloque-comandos">
            <h4>Comandos básicos</h4>
            <div className="barra-operaciones">
              {["-", "+", "*", "/", "=", "(", ")"].map((op) => (
                <button key={op} onClick={() => agregarSimbolo(op)}>
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="bloque-respuesta">
            <label>Tu respuesta:</label>
            <input
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
            />
            <button onClick={manejarRespuesta}>Comprobar</button>
            <p className="mensaje">{mensaje}</p>

            <div className="botones-control">
              <button onClick={iniciar}>▶️</button>
              <button onClick={pausar}>⏸️</button>
              <button onClick={reiniciar}>🔁</button>
            </div>

            <button className="volver-temas" onClick={() => setPantalla("inicio")}>
              ⬅ Volver a los temas
            </button>
          </div>
        </div>

        {/* Explicación visual fuera del área del juego */}
        {mensaje === "✅ Correcto. ¡Ecuación completada!" && (
          <div className="panel-explicacion">
            <h4>¿Por qué esta ecuación es correcta?</h4>
            <p>
              En un tanque CSTR (Continuous Stirred-Tank Reactor), la
              concentración de salida <strong>C(t)</strong> cambia con el tiempo
              según el equilibrio entre entrada y salida:
            </p>
            <code>dC/dt = (q/V)(Cin - C)</code>
            <p>
              Si C &lt; Cin → aumenta. <br />
              Si C = Cin → equilibrio. <br />
              Si C &gt; Cin → disminuye hasta estabilizarse.
            </p>
            <p>
              Este comportamiento corresponde a un sistema dinámico de primer
              orden, y la curva muestra cómo C(t) alcanza su valor estacionario.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Otros temas
  if (pantalla === "juego" && temaSeleccionado !== 1) {
    return (
      <div className="pantalla-desarrollo">
        <h2>🧩 {temas.find((t) => t.id === temaSeleccionado)?.nombre}</h2>
        <p>Este tema está en desarrollo. ¡Pronto podrás jugarlo! 🎮</p>
        <button className="volver-temas" onClick={() => setPantalla("inicio")}>
          ⬅ Volver al menú
        </button>
      </div>
    );
  }
}
