// StudentMenu.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TabContent from './TabContent';
import TeoriaMenu from './TeoriaMenu';
import Practica from './Practica';
import JuegoMemo from "./JuegoMemo/JuegoMemo";

const StudentMenu = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('teoria');
  const [contenidoActual, setContenidoActual] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [contenidosHabilitados, setContenidosHabilitados] = useState([]);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarContenidos, setMostrarContenidos] = useState(false);
  const [contenidosTema, setContenidosTema] = useState([]);
  const [cargandoContenido, setCargandoContenido] = useState(false);





  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.idEstudiante) return;

    let minutos = 0;

    // Cada 60 segundos incrementa el tiempo y guarda
    const intervalo = setInterval(async () => {
      minutos += 1;

      try {
        const res = await fetch("http://localhost:3001/api/estadistica/registrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idEstudiante: user.idEstudiante,
            tiempoInvertido: 1, // cada minuto
            ejerciciosResueltos: 0,
            nivelAvance: 0,
          }),
        });

        if (!res.ok) {
          console.warn("⚠️ Error actualizando estadística del estudiante:", res.status);
        } else {
          console.log(`⏱️ Tiempo actualizado (${minutos} min) para estudiante ${user.idEstudiante}`);
        }
      } catch (err) {
        console.error("❌ Error al actualizar estadísticas:", err);
      }
    }, 60000); // 1 minuto

    // Limpia el intervalo al salir del componente
    return () => clearInterval(intervalo);
  }, []);

  const obtenerContenidos = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/estudiante/contenido/${encodeURIComponent(activeTopic)}/${encodeURIComponent(activeTab)}`
      );

      const { contenidos = [], archivos = [] } = res.data;

      // Mismo formato que ya usas en el otro efecto
      const combinados = [
        ...contenidos.map(c => ({
          id: c.idContenido,
          tipo: "Enunciado",
          descripcion: c.descripcion,
        })),
        ...archivos.map(a => ({
          id: a.storedFilename,
          tipo: "Archivo",
          nombreArchivo: a.nombreArchivo,
          rutaArchivo: a.rutaArchivo,
        })),
      ];

      setContenidosHabilitados(combinados);
    } catch (err) {
      console.error("❌ Error al obtener contenidos:", err);
    }
  };

  // ✅ AGREGA SOLO ESTA NUEVA FUNCIÓN (NO DUPLIQUES handleVerContenido)
  const handleHabilitarContenido = async (idContenido, habilitadoActual) => {
    try {
      const res = await axios.put(
        `http://localhost:3001/api/contenido/habilitar/${idContenido}`,
        { habilitado: !habilitadoActual }
      );

      console.log(res.data.message);

      // ✅ Actualiza estado local
      setContenidosHabilitados((prev) =>
        prev.map((c) =>
          c.idContenido === idContenido
            ? { ...c, habilitado: !c.habilitado }
            : c
        )
      );
    } catch (err) {
      console.error("❌ Error al cambiar habilitado:", err);
    }
  };

  const handleVerContenido = (contenido) => {
    setContenidoSeleccionado(contenido);
    setMostrarModal(true);
  };



  const tabNames = ['teoria', 'ejemplos', 'practica', 'jugar'];


  const handleNext = () => {
    const currentIndex = tabNames.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabNames.length;
    handleTabChange(tabNames[nextIndex]);
  };

  // ⭐️ CONTENIDO DETALLADO DE TEORÍA (usando el formato de array para manejar texto y fórmulas)
  const teoriaContents = {
    'Modelación por medio de sistemas': {
      color: 'blue',
      title: 'Modelación por Medio de Sistemas (Ecuaciones de Primer Orden)',
      content: [
        {
          type: 'html',
          value: `
        <p>En modelación, una ecuación diferencial de primer orden se utiliza para describir cómo cambia una variable en el tiempo, dependiendo de su estado actual y de entradas externas.</p>
        <h4>La forma general es:</h4>
      `
        },
        // Fórmula general sin entrada
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx(t)}{dt} = f(x(t),t)'
        },
        {
          type: 'html',
          value: `
        <p>o, si hay una entrada u(t):</p>
      `
        },
        // Fórmula general con entrada
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx(t)}{dt} = f(x(t),u(t),t)'
        },
        {
          type: 'html',
          value: `
            <h4>Ejemplo Típico 1: Crecimiento Poblacional (Modelo Exponencial)</h4>
            <p>El sistema se describe como:</p>
        `
        },
        // Sistema de crecimiento poblacional
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{dt} = kP'
        },
        {
          type: 'html',
          value: `
            <ul>
                <li>P(t): población en el tiempo t.</li>
                <li>k: tasa de crecimiento.</li>
            </ul>
            <p>La solución es:</p>
        `
        },
        // Solución del modelo exponencial
        {
          type: 'math',
          mode: 'block',
          value: 'P(t) = P_0 e^{kt}'
        },
        {
          type: 'html',
          value: `
            <h4>Ejemplo Típico 2: Tanque con Flujo</h4>
            <p>Describe la tasa de cambio del volumen de líquido en función de los flujos de entrada y salida:</p>
        `
        },
        // Sistema de tanque
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dV}{dt} = q_{in}(t) - q_{out}(t)'
        },
        {
          type: 'html',
          value: `
            <ul>
                <li>V(t): volumen de líquido en el tanque.</li>
                <li>q_in(t): flujo de entrada.</li>
                <li>q_out(t): flujo de salida.</li>
            </ul>
            <h4>Ejemplo Típico 3: Circuito RC (Eléctrico)</h4>
        `
        },
        // Circuito RC
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dV_c}{dt} + \\frac{1}{RC}V_c = \\frac{1}{C} i(t)'
        },
        {
          type: 'html',
          value: `
            <ul>
                <li>V_c(t): voltaje en el condensador.</li>
                <li>R, C: resistencia y capacitancia.</li>
                <li>i(t): corriente de entrada.</li>
            </ul>
            <p>👉 La clave es que cualquier sistema dinámico de primer orden se describe con una sola ecuación diferencial de primer orden, y de ahí se puede analizar la respuesta del sistema en el tiempo.</p>
        `
        },
      ],
    },
    'Geometría de sistemas': {
      color: 'blue',
      title: 'Geometría de Sistemas (Ecuaciones de Primer Orden)',
      content: [
        {
          type: 'html',
          value: `
        <p>La **geometría de sistemas** estudia el comportamiento de las soluciones de las ecuaciones diferenciales desde un punto de vista gráfico y cualitativo (sin necesidad de resolver la ecuación de forma exacta).</p>
        <p>Es muy útil porque muchas veces no podemos encontrar la solución analítica, pero sí podemos dibujar la geometría del sistema: trayectorias, direcciones y equilibrios.</p>
        <h4>🔹 1. Forma General</h4>
      `
        },
        // Forma General
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx}{dt} = f(x,t)'
        },
        {
          type: 'html',
          value: `
        <ul>
            <li>x(t): variable de estado.</li>
            <li>f(x,t): función que define la dinámica del sistema.</li>
        </ul>
        <p>Si el sistema no depende explícitamente del tiempo ($t$):</p>
      `
        },
        // Sistema Autónomo
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx}{dt} = f(x)'
        },
        {
          type: 'html',
          value: `
        <p>se llama autónomo → el más común en geometría de sistemas.</p>
        <h4>🔹 2. Conceptos Geométricos Básicos</h4>
        <p>a) Campo direccional: Es un conjunto de flechas que indican la pendiente dx/dt en cada punto. Muestra cómo evoluciona la variable en el tiempo.</p>
        <p>b) Trayectorias (órbitas o soluciones):Curvas que representan la evolución de x(t) a lo largo del tiempo. Se obtienen al integrar la ecuación diferencial.</p>
        <p>c) Puntos de equilibrio: Son los valores de x donde el sistema no cambia:</p>
      `
        },
        // Puntos de equilibrio
        {
          type: 'math',
          mode: 'block',
          value: 'f(x^*) = 0'
        },
        {
          type: 'html',
          value: `
        <p>Geométricamente: puntos donde el campo vectorial es nulo (sin flechas).</p>
        <p>d) Estabilidad: Un equilibrio puede ser:</p>
        <ul>
            <li>Estable (atractor): las trayectorias cercanas tienden hacia él.</li>
            <li>Inestable (repulsor): las trayectorias se alejan.</li>
            <li>Neutro: las trayectorias oscilan o se mantienen sin acercarse ni alejarse.</li>
        </ul>
        <h4>🔹 3. Métodos Gráficos (Ecuaciones de Primer Orden)</h4>
        <p>a) Diagrama de fase en una dimensión: En el eje x, se dibujan flechas hacia la derecha si dx/dt > 0 y hacia la izquierda si dx/dt< 0. Se marcan los equilibrios y se analiza su estabilidad.</p>
        <p>b) Plano de fase (sistemas de dos variables): Para sistemas de dos ecuaciones:</p>
      `
        },
        // Plano de fase (sistema de 2 variables)
        {
          type: 'math',
          mode: 'block',
          value: '\\begin{cases} \\dot{x} = f(x,y) \\\\ \\dot{y} = g(x,y) \\end{cases}'
        },
        {
          type: 'html',
          value: `
        <p>Cada punto (x,y) tiene una flecha (f(x,y), g(x,y)). Las trayectorias se dibujan en el plano. Permite ver comportamientos más complejos (ciclos, espirales, centros).</p>
        <h4>🔹 4. Ejemplos Clásicos</h4>
        <p>- Ejemplo 1: Crecimiento Poblacional (Modelo Logístico)__</p>
      `
        },
        // Modelo Logístico
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{dt} = rP\\left(1-\\frac{P}{K}\\right)'
        },
        {
          type: 'html',
          value: `
        <p>Equilibrios: P=0 y P=K.</p>
        <p>Geometría: P=0: inestable (repulsor). P=K: estable (atractor). El sistema crece hasta estabilizarse en la capacidad de carga K.</p>
        <p>- Ejemplo 2: Enfriamiento de Newton</p>
      `
        },
        // Enfriamiento de Newton
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dT}{dt} = -k(T - T_{amb})'
        },
        {
          type: 'html',
          value: `
        <p>Equilibrio: T = Tamb. Geometría: siempre apunta hacia la temperatura ambiente → estable.</p>
        <p>- Ejemplo 3: Circuito RC</p>
      `
        },
        // Circuito RC
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dV_c}{dt} + \\frac{1}{RC}V_c = \\frac{1}{C}i(t)'
        },
        {
          type: 'html',
          value: `
        <p>Geometría: el voltaje en el condensador siempre tiende a estabilizarse según la entrada.</p>
        <h4>🔹 5. Resumen (Lo que debes recordar)</h4>
        <ul>
            <li>Toda ecuación diferencial de primer orden genera un campo geométrico.</li>
            <li>Los puntos de equilibrio se encuentran resolviendo f(x)=0.</li>
            <li>La estabilidad se analiza mirando el signo de la derivada alrededor del equilibrio.</li>
            <li>Los diagramas de fase (en 1D o 2D) son la herramienta visual clave.</li>
            <li>La geometría del sistema permite entender el comportamiento aunque no tengamos la solución exacta.</li>
        </ul>
      `
        },
      ],
    },
    'Método analítico para SE': {
      color: 'blue',
      title: 'Método Analítico para Sistemas Especiales',
      content: [
        {
          type: 'html',
          value: `
        <p>Cuando hablamos de sistemas especiales, nos referimos a ecuaciones diferenciales que, aunque no siempre son fáciles de resolver en forma general, admiten **métodos analíticos específicos** para encontrar su solución.</p>
        <p>La idea es aplicar técnicas matemáticas exactas que permiten integrar la ecuación y obtener la trayectoria del sistema sin depender solo de métodos gráficos o numéricos.</p>
        <h4>🔹 1. Forma General</h4>
        <p>Un sistema de primer orden se expresa como:</p>
      `
        },
        // Forma general
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx}{dt} = f(x,t)'
        },
        {
          type: 'html',
          value: `
        <p>La solución analítica es una función x(t) que satisface la ecuación.</p>
        <h4>🔹 2. Tipos de Sistemas Especiales y Métodos Analíticos</h4>
      `
        },
        // a) Ecuaciones Separables
        {
          type: 'html',
          value: `
        <p>a) Ecuaciones separables: Se pueden escribir como:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx}{dt} = g(x)h(t)'
        },
        {
          type: 'html',
          value: `
        <p>Método: separar variables e integrar:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\int \\frac{1}{g(x)} dx = \\int h(t) dt'
        },
        {
          type: 'html',
          value: `
        <p>📌 Ejemplo:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx}{dt} = kx \\quad \\Rightarrow \\quad \\int \\frac{1}{x} dx = \\int k dt \\quad \\Rightarrow \\quad x(t) = Ce^{kt}'
        },
        // b) Ecuaciones Lineales de Primer Orden
        {
          type: 'html',
          value: `
        <p>b) Ecuaciones lineales de primer orden:</p>
        <p>Forma:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dx}{dt} + p(t)x = q(t)'
        },
        {
          type: 'html',
          value: `
        <p>Método: usar el factor integrante:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mu(t) = e^{\\int p(t) dt}'
        },
        {
          type: 'html',
          value: `
        <p>La solución es:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'x(t) = \\frac{1}{\\mu(t)} \\left[ \\int \\mu(t) q(t) dt + C \\right]'
        },
        // c) Ecuaciones Homogéneas (1er orden)
        {
          type: 'html',
          value: `
        <p>c) Ecuaciones homogéneas (1er orden):</p>
        <p>Forma:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dy}{dx} = F\\left(\\frac{y}{x}\\right)'
        },
        {
          type: 'html',
          value: `
        <p>Método: sustitución v = y/x → reduce a ecuación separable.</p>
      `
        },
        // d) Ecuaciones Exactas
        {
          type: 'html',
          value: `
        <p>d) Ecuaciones exactas:</p>
        <p>Forma:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'M(x,y)dx + N(x,y)dy = 0'
        },
        {
          type: 'html',
          value: `
        <p>Condición de exactitud:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}'
        },
        {
          type: 'html',
          value: `
        <p>Si se cumple, existe una función potencial $\\phi(x,y)$ tal que:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{\\partial \\phi}{\\partial x} = M, \\quad \\frac{\\partial \\phi}{\\partial y} = N'
        },
        {
          type: 'html',
          value: `
        <p>La solución general es:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\phi(x,y) = C'
        },
        // e) Sistemas Lineales con Coeficientes Constantes
        {
          type: 'html',
          value: `
        <p>e) Sistemas lineales con coeficientes constantes:</p>
        <p>Forma matricial:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\dot{X}(t) = AX(t) + B'
        },
        {
          type: 'html',
          value: `
        <p>Método: resolver con la exponencial de matrices:</p>
      `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'X(t) = e^{At}X(0) + \\int_0^t e^{A(t-\\tau)} B \\, d\\tau'
        },
        {
          type: 'html',
          value: `
        <h4>🔹 3. ¿Por qué se llaman “sistemas especiales”?</h4>
        <p>Porque no todas las ecuaciones diferenciales admiten solución exacta. Estas categorías (separables, lineales, homogéneas, exactas, etc.) son **casos especiales** donde el método analítico sí funciona.</p>
        <p>En otros casos más complejos, se requieren:</p>
        <ul>
            <li>Métodos numéricos (Euler, Runge-Kutta).</li>
            <li>Métodos cualitativos (geometría de sistemas).</li>
        </ul>
        <h4>🔹 4. Relación con la Geometría de Sistemas</h4>
        <p>El método analítico te da la solución exacta x(t). La geometría te da la *ntuición gráfica (trayectorias, estabilidad). Ambos se complementan:</p>
        <ul>
            <li>Analítico → exactitud.</li>
            <li>Geométrico → comprensión visual.</li>
        </ul>
        <p>✅ En resumen: El método analítico para sistemas especiales consiste en identificar si una ecuación diferencial de primer orden pertenece a una clase particular y aplicar la técnica de integración correspondiente para obtener la solución explícita.</p>
      `
        },
      ],
    },
    'Métodos de Euler para sistemas': {
      color: 'blue',
      title: 'Método de Euler (Aproximación Numérica)',
      content: [
        {
          type: 'html',
          value: `
        <p>El Método de Euler es un método numérico para aproximar soluciones de ecuaciones diferenciales de primer orden cuando no se puede (o no se quiere) resolver la ecuación de manera analítica.</p>
        <p>Se basa en la idea de usar la derivada como pendiente para ir construyendo paso a paso la curva de solución.</p>
        <h4>🔹 1. Forma General del Problema</h4>
        <p>Buscamos una aproximación de y(t) para una ecuación de primer orden con condición inicial:</p>
      `
        },
        // Forma General
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dy}{dt} = f(t,y), \\quad y(t_0) = y_0'
        },
        {
          type: 'html',
          value: `
        <h4>🔹 2. Idea del Método</h4>
        <p>A partir de un punto inicial (t_0, y_0), avanzamos un paso h en el tiempo y estimamos el nuevo valor. La derivada dy/dt indica la pendiente que debemos seguir:</p>
        <p>Es como “dar pasos” siguiendo la dirección de la pendiente.</p>
      `
        },
        // Iteración de Euler (fórmula principal)
        {
          type: 'math',
          mode: 'block',
          value: 'y_{n+1} = y_n + h \\cdot f(t_n, y_n)'
        },
        {
          type: 'math',
          mode: 'block',
          value: 't_{n+1} = t_n + h'
        },
        {
          type: 'html',
          value: `
        <p>donde:</p>
        <ul>
            <li>h: tamaño de paso (mientras más pequeño, más preciso).</li>
            <li>n: número de iteraciones.</li>
        </ul>
        <h4>🔹 3. Ejemplo Numérico: dy/dt = y</h4>
        <p>Resolver numéricamente con Euler, usando condición inicial y(0)=1 y paso =0.1.</p>
        <p>Fórmula Simplificada: y_n+1 = y_n + h y_n = y_n(1+h)</p>
        <p>Primeros pasos:</p>
        <ul>
            <li>y_0 = 1</li>
            <li>y_1 = 1(1+0.1) = 1.1</li>
            <li>y_2 = 1.1(1.1) = 1.21</li>
            <li>y_3 = 1.21(1.1) \\approx 1.331</li>
        </ul>
        <p>👉 Resultado de Euler: Aproximación de y(0.3) \\approx 1.331.</p>
        <p>👉 Solución exacta: y(t)=e^t. En t=0.3: e^0.3 \\approx 1.3499.</p>
        <p>👉 Error: \\approx 0.0189.</p>
        
        <h4>🔹 4. Propiedades y Relación con la Geometría</h4>
        <ul>
            <li>Simple y fácil de implementar.</li>
            <li>Poco preciso si el paso h no es muy pequeño (error de truncamiento).</li>
            <li>Es la base para otros métodos más avanzados (Runge-Kutta).</li>
        </ul>
        <p>En geometría de sistemas dibujamos las pendientes (campo direccional) ---> Euler camina sobre esas pendientes paso a paso, construyendo la trayectoria numéricamente.</p>
        <p>✅ En resumen: El método de Euler aproxima la solución de una ecuación diferencial de primer orden avanzando en pasos pequeños h, sumando a la solución actual el cambio dado por la pendiente. Es el método numérico más básico, pero fundamental.</p>
      `
        },
      ],
    },
    'Ecuaciones de Lorenz': {
      color: 'blue',
      title: 'Teoría de las Ecuaciones de Lorenz',
      content: [
        {
          type: 'html',
          value: `
        <h4>1. Contexto Histórico</h4>
        <p>En 1963, el meteorólogo Edward Lorenz buscaba un modelo matemático que explicara la convección atmosférica. Simplificó un sistema de ecuaciones de fluidos (ecuaciones de Navier-Stokes) y obtuvo un conjunto de tres ecuaciones diferenciales ordinarias no lineales.</p>
        <p>Este modelo reveló que sistemas deterministas (sin azar) pueden tener un comportamiento impredecible ---> origen de la "teoría del caos".</p>
        <h4>2. Sistema Dinámico de Lorenz</h4>
        <p>Las ecuaciones son:</p>
      `
        },
        // Ecuaciones de Lorenz (el sistema 3x3)
        {
          type: 'math',
          mode: 'block',
          value: '\\begin{cases} \\frac{dx}{dt} = \\sigma (y - x) \\\\ \\frac{dy}{dt} = x(\\rho - z) - y \\\\ \\frac{dz}{dt} = xy - \\beta z \\end{cases}'
        },
        {
          type: 'html',
          value: `
        <p>Interpretación de parámetros:</p>
        <ul>
            <li>σ número de Prandtl (viscosidad vs. difusión térmica).</li>
            <li>ρ número de Rayleigh (gradiente de temperatura vs. difusión térmica).</li>
            <li>𝛽 parámetro metrico.</li>
        </ul>
        <p>Interpretación de variables:</p>
        <ul>
            <li>x: velocidad de convección del fluido.</li>
            <li>y: diferencia de temperatura entre corrientes.</li>
            <li>z: variación de la temperatura vertical.</li>
        </ul>
        <h4>3. Propiedades Matemáticas</h4>
        <p>a) No Linealidad: Los términos xy y xz hacen que el sistema sea no lineal y complejo.</p>
        <p>b) Sensibilidad a Condiciones Iniciales: Pequeñas variaciones en x(0), y(0), z(0) producen trayectorias completamente distintas con el tiempo. Esto se conoce como el Efecto Mariposa.</p>
        <p>c) Atractor Extraño: El sistema no tiende a un punto fijo ni a un ciclo periódico, sino a una figura fractal en 3D \\rightarrow el Atractor de Lorenz.</p>
        <p>d) Estados del Sistema:</p>
        <ul>
            <li>Para valores bajos de ρ: el sistema tiende a un punto de equilibrio estable (no hay caos).</li>
            <li>Para valores altos de ρ: aparecen oscilaciones y finalmente caos determinista.</li>
        </ul>
        <h4>4. Importancia Teórica</h4>
        <ul>
            <li>Climatología: Explica la imposibilidad de predicciones exactas a largo plazo.</li>
            <li>Matemáticas: Primer ejemplo de caos en un sistema determinista.</li>
            <li>Física y Computación: Base para estudios en dinámica de fluidos y generación de números pseudoaleatorios.</li>
        </ul>
        <h4>5. Conceptos Clave Vinculados</h4>
        <ul>
            <li>Caos Determinista: Comportamiento irregular generado por ecuaciones sin azar.</li>
            <li>Sensibilidad a Condiciones Iniciales: Característica fundamental del caos.</li>
            <li>Sistemas Dinámicos No Lineales: El marco matemático de estas ecuaciones.</li>
            <li>Fractales: El atractor de Lorenz tiene estructura fractal.</li>
        </ul>
      `
        },
      ],
    },
  };
  const ejemplosContents = {
    'Modelación por medio de sistemas': {
      color: 'green',
      title: 'EJEMPLO: Crecimiento Exponencial Y Modelación - Tanque CSTR  ',
      content: [
        {
          type: 'html',
          value: `
                <h4>1) Planteamiento físico y ecuación</h4>
                <p>Supongamos una población P(t) que crece de forma proporcional a su tamaño (por ejemplo bacterias en un cultivo donde no hay limitación de recursos). La hipótesis física es:</p>
                <ul>
                    <li>La tasa de crecimiento instantánea es proporcional a la población actual.</li>
                    <li>La proporcionalidad se modela con una constante k (positiva si hay crecimiento, negativa para decaimiento).</li>
                </ul>
                <p>Entonces la ecuación es:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{dt} = k\\,P(t), \\qquad P(0) = P_0.'
        },
        {
          type: 'html',
          value: `
                <h4>2) Método escogido y por qué</h4>
                <p>La ecuación es una ODE de primer orden y separable: la derivada depende solo de P y aparece multiplicada por una constante.</p>
                <p>Por eso el método natural es **separación de variables**: pasar todas las dependencias de P a un lado y las de t al otro, de forma que ambas se integren.</p>
                <h4>3) Derivación paso a paso (sin errores)</h4>
                <p>Partimos de:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{dt} = k P.'
        },
        {
          type: 'html',
          value: `
                <p>Separación de variables (suponiendo $P \\neq 0$):</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{P} = k\\,dt.'
        },
        {
          type: 'html',
          value: `<p>Por qué: queremos integrar con respecto a t; separar permite integrar cada lado respecto a su variable.</p><p>Integramos ambos lados:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\int \\frac{dP}{P} = \\int k\\,dt \\quad\\Rightarrow\\quad \\ln|P| = k t + C.'
        },
        {
          type: 'html',
          value: `<p>Por qué: la integral de 1/P es ln|P|; constante de integración C.</p><p>Exponenciamos para despejar P:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: 'P(t) = e^{k t + C} = e^{C} e^{k t} = C_1 e^{k t},'
        },
        {
          type: 'html',
          value: `<p>donde C_1 = e^C es una constante positiva.</p><p>Aplicamos condición inicial P(0)=P_0:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: 'P(0) = C_1 e^{0} = C_1 = P_0 \\quad\\Rightarrow\\quad C_1 = P_0.'
        },
        {
          type: 'html',
          value: `<p>Solución final (forma cerrada):</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\,P(t) = P_0 \\, e^{k t}\\,}'
        },
        {
          type: 'html',
          value: `
                <h4>4) Interpretación y cantidades útiles</h4>
                <ul>
                    <li>Si k>0 ---> crecimiento exponencial.</li>
                    <li>Si k<0 ---> decaimiento exponencial (ej.: desintegración radioactiva).</li>
                    <li>Constante de tiempo: t = 1/k(caracteriza la escala temporal del cambio).</li>
                    <li>Tiempo de duplicación: t_2 = ln 2/k. En general, P(t_2) = 2 P_0.</li>
                </ul>
                <p>En el ejemplo numérico de la gráfica usé P_0=100 y k=0.2.</p>
                <p>Entonces:</p>
                <ul>
                    <li>t = 1/k = 5.</li>
                    <li>t_2 = ln(2)/0.2 = 3.465736.</li>
                    <li>P(t_2) = 200 (exactamente 2P_0).</li>
                </ul>
                <h4>5) Gráfica (ya ejecutada)</h4>
                <p>He calculado y mostrado la gráfica de P(t)=P_0 e^kt en [0,40] con P_0=10$ y k=0.2. La gráfica marca el tiempo de duplicación t_2 y el punto (t_2, P(t_2)).</p>
            `
        },
        // Inserción de la gráfica
        {
          type: 'html',
          value: '<p style="text-align: center;"><img src="/ejemplo11.png" alt="Gráfica de crecimiento exponencial P(t) = Po e^{kt}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>'
        },
        {
          type: 'html',
          value: `
                <h4>6) Siguientes pasos didácticos sugeridos</h4>
                <ul>
                    <li>Permitir al alumno variar P_0 y k con sliders y ver la gráfica y los valores (t, t_2).</li>
                    <li>Comparar solución continua con un modelo discreto (p. ej. P_n+1 = (1 + r) P_n) para ilustrar la relación entre crecimiento continuo y crecimiento por pasos.</li>
                    <li>Mostrar caso k<0 e interpretar (decaimiento).</li>
                    <li>Pedir que prueben errores numéricos con Euler vs RK4 para la misma ODE (útil para introducir solvers).</li>
                </ul>
            `
        },
        {
          type: 'html',
          value: `
                <h4>2) EJEMPLO 2: </h4>
                <h4>2) ------------------- Planteamiento físico y ecuación-----------------------</h4>
                <p>Consideramos un tanque de volumen constante V con mezcla instantánea. Entra líquido con caudal q$y concentración C_in(t), y sale por el mismo caudal $q$. Variable de estado: la concentración en el tanque $C(t)$.</p>
                <p>Balance de masa (por especie): Tasa de acumulación = entrada - salida</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'V\\frac{dC}{dt} = q\\,C_{in}(t) - q\\,C(t).'
        },
        {
          type: 'html',
          value: `<p>Dividiendo por V (suponiendo V constante):</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\;\\frac{dC}{dt} = \\frac{q}{V}\\big(C_{in}(t) - C(t)\\big)\\;}'
        },
        {
          type: 'html',
          value: `<p>Este es el modelo fundamental. Si C_in es constante se consigue solución analítica cerrada; si C_in varía, se puede usar factor integrante o integrar numéricamente.</p>
                <h4>2) Forma estándar y método a usar</h4>
                <p>Es una ecuación lineal de primer orden de la forma</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dC}{dt} + a\\,C = a\\,C_{in}(t),\\quad\\text{con } a=\\frac{q}{V}.'
        },
        {
          type: 'html',
          value: `<p>El método general para resolverla es **factor integrante** porque transforma la ecuación en una derivada exacta. Para el caso particular $C_{in}(t)=$ constante la integración es directa y sencilla.</p>
                <h4>3) Derivación paso a paso (caso C_in constante)</h4>
                <p>Partimos de:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dC}{dt} + a C = a C_{in},\\qquad a=\\frac{q}{V}.'
        },
        {
          type: 'html',
          value: `<p>Factor integrante:</p><p>Definimos μ(t) = e^∫adt = e^at.</p><p>Por qué: multiplicando por μ(t) convertimos el lado izquierdo en la derivada de C e^at:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: 'e^{a t}\\frac{dC}{dt} + a e^{a t} C = \\frac{d}{dt}\\big( C e^{a t} \\big).'
        },
        {
          type: 'html',
          value: `<p>Multiplicamos la ecuación por e^at:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{d}{dt}\\big( C e^{a t} \\big) = a C_{in} e^{a t}.'
        },
        {
          type: 'html',
          value: `<p>Integramos ambos lados respecto de t:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: 'C e^{a t} = a C_{in} \\int e^{a t}\\,dt + K = a C_{in}\\cdot\\frac{1}{a} e^{a t} + K = C_{in} e^{a t} + K,'
        },
        {
          type: 'html',
          value: `<p>donde K es la constante de integración.</p><p>Despejamos C(t):</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: 'C(t) = C_{in} + K e^{-a t}.'
        },
        {
          type: 'html',
          value: `<p>Imponemos la condición inicial C(0)=C_0:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: 'C_0 = C_{in} + K \\quad\\Rightarrow\\quad K = C_0 - C_{in}.'
        },
        {
          type: 'html',
          value: `<p>Solución final:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\,C(t) = C_{in} + (C_0 - C_{in})\\,e^{-a t}\\,} \\quad\\text{con } a=\\frac{q}{V}.'
        },
        {
          type: 'html',
          value: `
                <h4>4) Interpretación física y cantidades útiles</h4>
                <ul>
                    <li>Estado estacionario: cuando t-->∞, C(t)--> C_in. Es intuitivo: si se mezcla indefinidamente, el tanque adquiere la concentración de entrada.</li>
                    <li>Constante de tiempo:  T= 1/a = V/q. Representa la escala temporal del ajuste; tras t=T la diferencia |C(t)-C_in| se ha reducido a 1/e (-36.8%) de su valor inicial.</li>
                    <li>Tiempo aproximado para alcanzar un porcentaje dado: por ejemplo el tiempo para llegar al 95% del valor estacionario: C(t95) = C_in + 0.05(C_0 - C_in) ==> t_95 = -ln0.05/a</li>
                </ul>
                <h4>5) Ejemplo numérico y gráfica</h4>
                <p>He usado los parámetros (ejemplo pedagógico):</p>
                <ul>
                    <li>q=1.0 (unidad de volumen/unidad tiempo)</li>
                    <li>V=10.0</li>
                    <li>C_in=2.0</li>
                    <li>C_0=0.0</li>
                </ul>
                <p>De ellos: a=q/V=0.1, T=1/a=V/q=10, estado estacionario C_ss=C_in=2.0, tiempo al 95%: t_95 = 29.9573.</p>
                <p>La gráfica (generada y mostrada) dibuja C(t) en 0 ≤ t ≤ 5T, marca la línea de estado estacionario, la constante de tiempo y el t_95, y muestra puntos indicativos en esas verticales.</p>
              
              
            `
        },
        {
          type: 'html',
          // ⭐️ ¡Esta es la línea corregida! Usa <img> y el atributo src.
          value: '<p style="text-align: center;"><img src="/ejmplo2.png" alt="Gráfica de concentración en tanque CSTR" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>'
        },

      ],
    },


    'Geometría de sistemas': {
      color: 'green',
      title: 'EJEMPLO COMPLETO: Geometría y Analítico - Enfriamiento de Newton',
      content: [
        {
          type: 'html',
          value: `
                <h4>1) Planteamiento físico (lenguaje claro)</h4>
                <p>Tienes un objeto caliente (por ejemplo una taza de café) con temperatura T(t) que está en contacto con un ambiente cuya temperatura es T_a.</p>
                <p>La hipótesis física (modelo) es: la velocidad de cambio de la temperatura del objeto es proporcional a la diferencia entre su temperatura y la ambiente.</p>
                <p>Esto significa que cuanto más lejos esté T de T_a, más rápido cambia, y cuando se acerca a T_a el cambio disminuye.</p>
                <h4>2) Ecuación diferencial que modela el fenómeno</h4>
                <p>La ecuación es:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\displaystyle \\frac{dT}{dt} = -k\\,(T - T_a)}'
        },
        {
          type: 'html',
          value: `
                <p>donde:</p>
                <ul>
                    <li>k>0 es la constante de enfriamiento (unidades: 1/tiempo),</li>
                    <li>T(t) es la temperatura del objeto en el tiempo t,</li>
                    <li>T_a es la temperatura ambiente (constante).</li>
                </ul>
                <p>El signo negativo indica que si T>T_a entonces dT/dt<0 (la temperatura baja), y si T<T_a entonces dT/dt>0 (sube hacia T_a).</p>
                <h4>3) Tipo de ecuación y método a usar — por qué</h4>
                <p>Es una EDO autónoma lineal de primer orden.</p>
                <p>Dos métodos válidos: Separación de variables (directo aquí) o Factor integrante / forma lineal — en este caso la separación es sencilla y clara, así que la usamos.</p>
                <p>Por qué separación: porque podemos reordenar de modo que todos los términos con T queden a un lado y los de t al otro, y así integrar cada parte respecto a su variable.</p>
                <h4>4) Resolución paso a paso (con justificación en cada paso)</h4>
                <p>Ecuación inicial:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dT}{dt} = -k\\,(T - T_a).'
        },
        {
          type: 'html',
          value: `
                <p><strong>Paso 1 — separar variables</strong> (suponiendo T diferente T_a localmente — el caso T = T_a es solución trivial):</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dT}{T - T_a} = -k\\,dt.'
        },
        {
          type: 'html',
          value: `
                <p>Por qué: así tenemos T-s por un lado y t-s por el otro; cada integral se hace respecto a su variable.</p>
                <p><strong>Paso 2 — integrar ambos lados:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\int \\frac{dT}{T - T_a} = \\int -k\\,dt.'
        },
        {
          type: 'html',
          value: `
                <p>La integral del lado izquierdo es ln|T - T_a| porque d/dT ln|T - T_a| = 1/T - T_a.</p>
                <p>Entonces:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\ln|T - T_a| = -k t + C,'
        },
        {
          type: 'html',
          value: `
                <p>donde C es la constante de integración.</p>
                <p> - Paso 3 — exponenciar para despejar T:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '|T - T_a| = e^{-k t + C} = e^C e^{-k t}.'
        },
        {
          type: 'html',
          value: `
                <p>Denotamos $C_1 = e^C > 0$. Así:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '|T - T_a| = C_1 e^{-k t}.'
        },
        {
          type: 'html',
          value: `
                <p>Quitando el valor absoluto (y permitiendo C_2 con signo para cubrir ambos casos), escribimos</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'T(t) = T_a + C_2 e^{-k t},'
        },
        {
          type: 'html',
          value: `
                <p>donde C_2 es una constante real (puede ser positiva o negativa, según la condición inicial).</p>
                <p> - Paso 4 — aplicar condición inicial para fijar la constante:</p>
                <p>Si T(0)=T_0, entonces:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'T_0 = T(0) = T_a + C_2 e^{0} = T_a + C_2 \\quad\\Rightarrow\\quad C_2 = T_0 - T_a.'
        },
        {
          type: 'html',
          value: `<p>Solución particular final:</p>`
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\,T(t) = T_a + (T_0 - T_a)\\,e^{-k t}\\,}'
        },
        {
          type: 'html',
          value: `
                <p>Resumen del porqué: Se separó para integrar cada variable, la integral de 1/(T-T_a) es ln|T-T_a|, se exponenció para despejar, y la condición inicial fija la constante.</p>
                <h4>5) Propiedades y significado físico de la solución</h4>
                <ul>
                    <li>- Equilibrio: T(t)=T_a es una solución constante (si T_0=T_a el sistema no cambia).</li>
                    <li>-Estabilidad: T_a es un equilibrio estable: si T está por encima o por debajo de T_a, las soluciones convergen a T_a cuando t -->∞.</li>
                    <li>- Razón: si T>T_a entonces dT/dt<0 (baja), si T<T_a entonces dT/dt>0 (sube) — siempre hacia T_a.</li>
                    <li>- Constante de tiempo:t = 1/k. Indica la escala de tiempo en la que las diferencias se atenúan; después de un tiempo t la diferencia T-T_a se ha reducido aproximadamente a e^-1 = (0.3679) de su valor inicial.</li>
                    <li>- Tiempo de “mitad” (reducción a la mitad de la diferencia): t_1/2 = ln 2/k. Es el tiempo necesario para que |T(t)-T_a|$sea la mitad de |T_0 - T_a|.</li>
                </ul>
                <h4>6) Ejemplo numérico (cálculos digit-by-digit para que no haya errores)</h4>
                <p>Tomemos parámetros concretos (para que el estudiante haga números concretos):</p>
                <ul>
                    <li>k=0.5h^-1 (constante de enfriamiento),</li>
                    <li>T_a = 20.0^°C (ambiente),</li>
                    <li>T_0 = 80.0^°C (temperatura inicial del objeto),</li>
                </ul>
                <p>calculamos para t=0, 1, 2, 4, 10 horas.</p>
                <p>Constantes numéricas:</p>
                <ul>
                    <li>t=1/k=1/0.5=2.0 horas </li>
                    <li>n 2 = 0.6931471805599453 (valor con 16 decimales).</li>
                    <li>t_1/2 = ln 2/k = 0.6931471805599453 / 0.5 = 1.3862943611198906 horas </li>
                </ul>
                <p><strong>Fórmula:</strong></p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'T(t) = 20 + (80-20)\\,e^{-0.5 t} = 20 + 60\\,e^{-0.5 t}.'
        },
        {
          type: 'html',
          value: `
                <p>Calculemos cada T(t) paso a paso (cada paso explicado):</p>
                <p>t=0</p>
                <ul>
                    <li>e^-0.5 0 = e^0 = 1.0000000000000000.</li>
                    <li>T(0) = 20 + 60 * 1 = 20 + 60 = 80.00000000000000 °C</li>
                </ul>
                <p>t=1:</s'</p>
                <ul>
                    <li>e^-0.5.1 = e^-0.5 = 0.6065306597126334 valor preciso</li>
                    <li>60 * 0.6065306597126334 = 36.391839582758004</li>
                    <li>T(1) = 20 + 36.391839582758004 = 56.391839582758004 = 56.39184 °C</li>
                </ul>
                <p>t=2:</p>
                <ul>
                    <li>e^-0.5.2 = e^-1 = 0.36787944117144233</li>
                    <li>60 * 0.36787944117144233 = 22.072766470286538.</li>
                    <li>T(2) = 20 + 22.072766470286538 = 42.072766470286538 = 42.07277 °C</li>
                </ul>
                <p>t=4:</p>
                <ul>
                    <li>e^-0.5.4 = e^-2 = 0.1353352832366127.</li>
                    <li>60 * 0.1353352832366127 = 8.120116994196762.</li>
                    <li>T(4) = 20 + 8.120116994196762 = 28.120116994196762 = 28.12012 °C</li>
                </ul>
                <p>t=10:</p>
                <ul>
                    <li>e^-0.5.10 = e^-5 = 0.006737946999085467.</li>
                    <li>60 * 0.006737946999085467 = 0.40427681994512802.</li>
                    <li>T(10) = 20 + 0.40427681994512802 = 20.404276819945128 = 20.40428 °C</li>
                </ul>
                <p>Interpretación numérica: a las 10 horas la temperatura ya está casi en la ambiental 20.40 °C), porque la constante de tiempo T=2h hace que en unos pocos t la diferencia sea muy pequeña.</p>

                <h4>8) Geometría del sistema — campo de direcciones y línea de fases (qué mirar y por qué)</h4>
                <p>Fórmula del campo de direcciones: en cada punto (t,T) la pendiente (dirección) es</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dT}{dt} = -k (T - T_a).'
        },
        {
          type: 'html',
          value: `
                <p><strong>Observaciones:</strong></p>
                <ul>
                    <li>Si T > T_a entonces T - T_a > 0 --> dT/dt < 0: flechas hacia abajo (el sistema baja hacia T_a).</li>
                    <li>Si T < T_a entonces T - T_a < 0 --> dT/dt > 0: flechas hacia arriba (sube hacia T_a).</li>
                    <li>En T=T_a la pendiente es 0 (equilibrio), por eso en la gráfica se ve la recta horizontal T=T_a como centro al que convergen las trayectorias.</li>
                </ul>
                <p><strong>Interpretación gráfica:</strong></p>
                <ul>
                    <li>El campo de direcciones (pequeñas flechas) te dice localmente “hacia dónde se mueve la solución si empiezas en ese punto”.</li>
                    <li>Las trayectorias (curvas T(t) para distintas condiciones iniciales) siguen esas flechas.</li>
                    <li>La línea de fases (gráfico 1D del eje T con flechas) muestra claramente la estabilidad: todas las flechas apuntan hacia T_a, por tanto T_a es estable.</li>
                </ul>
                <p style="text-align: center;"><img src="/ejemplo3.png" alt="Gráfica de la Ley de Enfriamiento de Newton" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>
            `
        },
        {
          type: 'html',
          value: `
                <p>2. ejemplo: -CRECIMIENTO LOGISTICO- </p>
                <p>Ecuación original:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{dt} = rP\\Big(1-\\frac{P}{K}\\Big)'
        },
        {
          type: 'html',
          value: `
                <h4>1) Separar variables</h4>
                <p>Queremos dejar todos los términos con P a un lado y los de t al otro:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{P(1 - P/K)} = rdt.'
        },
        {
          type: 'html',
          value: `
                <h4>2) Reescribir el denominador para facilitar la descomposición</h4>
                <p>Multiplicamos numerador y denominador por K para tener una forma más manejable:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dP}{P(1 - P/K)} = \\frac{K\\,dP}{P(K-P)}.'
        },
        {
          type: 'html',
          value: `
                <p>(La razón: factorizar 1-P/K=(K-P)/K deja K fuera y facilita usar fracciones parciales).</p>
                <h4>3) Fracciones parciales — ¿por qué y cómo?</h4>
                <p>Buscamos constantes A y B tales que</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{K}{P(K-P)} = \\frac{A}{P} + \\frac{B}{K-P}.'
        },
        {
          type: 'html',
          value: `
                <p>Multiplicamos por P(K-P):</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'K = A(K-P) + B P = A K + (B-A)P.'
        },
        {
          type: 'html',
          value: `
                <p>Igualando coeficientes (constante y término en P):</p>
                <ul>
                    <li>Constante: A K = K ==> A=1.</li>
                    <li>Coeficiente de P: B - A = 0 ==> B = A = 1.</li>
                </ul>
                <p>Por tanto:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{K}{P(K-P)} = \\frac{1}{P} + \\frac{1}{K-P}.'
        },
        {
          type: 'html',
          value: `
                <p>(Esta descomposición es crucial porque convierte la integral en la suma de dos integrales elementales.)</p>
                <h4>4) Integrar ambos lados</h4>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\int \\left(\\frac{1}{P} + \\frac{1}{K-P}\\right)\\,dP = \\int r,dt.'
        },
        {
          type: 'html',
          value: `
                <p>Calcular las integrales:</p>
                <ul>
                    <li>∫ 1 / P dP = ln|P|.</li>
                    <li>∫ 1 / K-P\\,dP = -ln|K-P| (usando sustitución u=K-P ==> du = -dp -->  la integral es: -ln|k - p|.).</li>
                </ul>
                <p>Entonces:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\ln|P| - \\ln|K-P| = r t + C \\quad\\Rightarrow\\quad \\ln\\Big(\\frac{P}{K-P}\\Big) = r t + C.'
        },
        {
          type: 'html',
          value: `
                <h4>5) Exponenciar y despejar P</h4>
                <p>Sea C_1 = e^C. Entonces:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{P}{K-P} = C_1 e^{r t}.'
        },
        {
          type: 'html',
          value: `
                <p>Despejamos P:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'P = \\frac{K C_1 e^{r t}}{1 + C_1 e^{r t}}.'
        },
        {
          type: 'html',
          value: `
                <h4>6) Aplicar condición inicial P(0)=P_0 para fijar la constante</h4>
                <p>En t=0:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{P_0}{K-P_0} = C_1.'
        },
        {
          type: 'html',
          value: `
                <p>Definimos A = K-P_0 / P_0 = 1 / C_1. Reescribiendo, la forma más usada es:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\,P(t)=\\dfrac{K}{1 + A e^{-r t}}\\,\\quad A=\\dfrac{K-P_0}{P_0}\\,}'
        },
        {
          type: 'html',
          value: `
                <p>(Esta forma es muy útil porque muestra claramente el papel de K, r, y la dependencia con la condición inicial P_0.)</p>
                <hr>
                <h4>CÁLCULOS NUMÉRICOS (digit-by-digit) para $r=0.3,\\ K=100,\\ P_0=10$</h4>
                <p>Primero calculamos A:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'A = \\frac{K-P_0}{P_0} = \\frac{100-10}{10} = \\frac{90}{10} = 9.000000000000000.'
        },
        {
          type: 'html',
          value: `
                <p>La fórmula a evaluar:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'P(t) = \\frac{100}{1 + 9\\,e^{-0.3 t}}.'
        },
        {
          type: 'html',
          value: `
                <p>Evaluamos para t=0, 2, 5, 10, 30.</p>
                <p>- Resultados (valores con alta precisión):</p>
                <p>- t=0:</p>
                <ul>
                    <li>e^-0.3.0 = 1.000000000000000.</li>
                    <li>denom=1 + 9 * 1 = 10.000000000000000.</li>
                    <li>P(0)=100/10=10.000000000000000.</li>
                </ul>
                <p>t=2:</p>
                <ul>
                    <li>e^-0.3*2=e^-0.6=0.548811636094026.</li>
                    <li>denom=1 + 9* 0.548811636094026 = 5.939304724846237.</li>
                    <li>P(2)=100/5.939304724846237 = 16.836987599182141.</li>
                </ul>
                <p>t=5:</p>
                <ul>
                    <li>e^-0.3*5=e^-1.5=0.223130160148430.</li>
                    <li>denom=1 + 9 * 0.223130160148430 = 3.008171441335868.</li>
                    <li>P(5)=100/3.008171441335868 = 33.242786174311931.</li>
                </ul>
                <p>t=10</p>
                <ul>
                    <li>e^-0.3 * 10=e^-3=0.049787068367864.</li>
                    <li>denom=1 + 9 * 0.049787068367864 = 1.448083615310775.</li>
                    <li>P(10):=100/1.448083615310775 = 69.056785770301559.</li>
                </ul>
                <p>t=30:</p>
                <ul>
                    <li>e^-0.3 * 30=e^-9=0.000123409804087.</li>
                    <li>denom=1 + 9 * 0.000123409804087 = 1.001110688236780.</li>
                    <li>P(30)=100/1.001110688236780 = 99.889054402292274.</li>
                </ul>
                <hr>
                <h4>Interpretación geométrica (qué ver en las gráficas)</h4>
                <p><strong>Campo de direcciones: en cada punto (t,P) la pendiente es rP(1-P/K).</p>
                <ul>
                    <li>Si 0 < PK, la pendiente es positiva (crecimiento).</li>
                    <li>Si P > K, la pendiente se vuelve negativa (la población se reduce hacia K).</li>
                </ul>
                <p>Las flechas del campo muestran la dirección local del flujo (hacia arriba si P<K, hacia abajo si P>K).</p>
                <p>- Trayectorias: las curvas para distintas P_0 muestran que todas tienden al equilibrio P=K cuando r>0, salvo la solución P = 0.</p>
                <p>- Línea de fases (1D): en el eje P las flechas indican que P=0 y P=K son puntos críticos; para r>0, P=K es estable y P=0 es típicamente inestable frente a pequeñas perturbaciones positivas.</p>
                <p style="text-align: center;"><img src="/ejemplo4.png" alt="Gráfica del Modelo Logístico con campo de direcciones" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>
            `
        },
      ],
    },

    'Método analítico para SE': {
      color: 'blue',
      title: 'MÉTODO ANALÍTICO PARA SISTEMAS ESPECIALES',
      content: [
        {
          type: 'html',
          value: `
                <h3>Problema (planteamiento)</h3>
                <p>Un tanque perfectamente mezclado contiene V=100 L de solución. Entra y sale la solución con el mismo caudal Q=5 L/min. La concentración de soluto en la corriente que entra es Cin=2.0 g/L. Inicialmente la concentración en el tanque es C(0)=0.5 g/L.</p>
                <p><b>Pregunta:</b> Obtener la solución analítica C(t), interpretar el equilibrio y calcular:</p>
                <ul>
                    <li>C(t) en t=0, 10, 30, 60, 120, 300 min (valores numéricos).</li>
                    <li>La constante de tiempo T y el tiempo para alcanzar el 90% del ajuste al equilibrio.</li>
                    <li>El tiempo para alcanzar C=1.8 g/L.</li>
                </ul>
                <hr>
                <h3>1) Modelado físico → ecuación diferencial</h3>
                <p>Balance de soluto (entrada - salida) en un tanque perfectamente mezclado:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{d}{dt}(V\\,C) = Q\\,Cin() - Q\\,C(t).'
        },
        {
          type: 'html',
          value: `
                <p>Como V es constante, V dC/dt = Q (C_in - C). Dividiendo por V:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\displaystyle \\frac{dC}{dt} = \\frac{Q}{V}\\bigl(C_{\\text{in}}-C(t)\\bigr).}'
        },
        {
          type: 'html',
          value: `
                <p>Esta es una EDO lineal de primer orden con coeficientes constantes.</p>
                <p>Definimos k=Q/V. Con nuestros valores:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'k=\\frac{5}{100}=0.05\\ \\text{min}^{-1},\\qquad \\tau=\\frac{1}{k}=20\\ \\text{min}.'
        },
        {
          type: 'html',
          value: `
                <hr>
                <h3>2) Método elegido y por qué</h3>
                <p>Esta ecuación es lineal de primer orden constante y se resuelve por <b>separación de variables</b> (es directo y pedagógico).</p>
                <hr>
                <h3>3) Resolución paso a paso (separación e integración)</h3>
                <p>Partimos de:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dC}{dt} = k(C_{\\text{in}}-C).'
        },
        {
          type: 'html',
          value: `
                <p><b>Paso A — separar variables:</b></p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dC}{C_{\\text{in}}-C} = k\\, dt.'
        },
        {
          type: 'html',
          value: `
                <p><b>Paso B — integrar ambos lados:</b></p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\int \\frac{dC}{C_{\\text{in}}-C} = \\int k\\, dt.'
        },
        {
          type: 'html',
          value: `
            
                <p>Observamos que ∫ dc / Cin - C = - Ln|Cin - C|..</p>
                <p>Por tanto:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '-\\ln|C_{\\text{in}}-C| = k t + C_1,'
        },
        {
          type: 'html',
          value: `
                <p><b>Paso C — despejar:</b> Exponenciando y reordenando, llegamos a:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'Ln|Cin - C| = -kt - C1 = -kt +C2, c2 = -c1.'

        },
        {
          type: 'math',
          mode: 'block',
          value: 'Ln|Cin - C| = ec2e-kt ==> Cin-//C=//Ae-kt',
        },



        {
          type: 'html',
          value: `
                <p><b>Paso D — aplicar condición inicial: C(0)=C-A ==>A = C_in-C_0.</p>
                <p>Así la solución particular es:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\,C(t) = C_{\\text{in}} - (C_{\\text{in}}-C_0)\\,e^{-k t} = C_{\\text{in}} + (C_0 - C_{\\text{in}}) e^{-k t}\\,.}'
        },
        {
          type: 'html',
          value: `
                <hr>
                <h3>4) Sustituyendo números (cálculos digit-by-digit)</h3>
                <p>Parámetros: C_in=2.0 g/L, C_0=0.5 g/L, k=0.05^-1.</p>
                <p>Fórmula numérica:</p>
            `
        },
        {
          type: 'html',
          value: `
        <p><b>Valores pedidos:</b></p>
    `
        },
        // --- CÁLCULOS PASO A PASO EN HTML y MATH INLINE (Usando C) ---
        {
          type: 'html',
          value: `
        <h4>t=0 :</h4>
        <p>e^-0.05*0=1.0000000000</p>
        <p>C(0)=2.0 - 1.5 * 1 = 0.5 g/L.</p>
        
        <h4>t=10:</h4>
        <p>e^-0.5=0.60653065971</p>
        <p>1.5 * e^-0.5=0.90979598957</p>
        <p>C(10)=2.0 - 0.90979598957 = 1.09020401043 g/L.</p>
        
        <h4t=30:</h4>
        <p>e^{-1.5}=0.22313016015</p>
        <p>1.5 *  e^-1.5=0.33469524022</p>
        <p>C(30)=2.0 - 0.33469524022 = 1.66530475978 g/L.</p>

        <h4>t=60: </h4>
        <p>e^-3=0.04978706837</p>
        <p>1.5 * e^{-3}=0.07468060255</p>
        <p>C(60)=2.0 - 0.07468060255 = 1.92531939745 g/L.</p>

        <h4>t=120:</h4>
        <p>e^{-6}=0.00247875218</p>
        <p>1.5 *  e^{-6}=0.00371812826</p>
        <p>C(120)=2.0 - 0.00371812826 = 1.99628187174 g/L.</p>

        <h4>t=300:</h4>
        <p>e^-15 = 3.059 10^-7</p>
        <p>1.5 * e^-15 = 4.589 10^-7</p>
        <p>C(300)  2.0 - 4.589 10^-7 =1.999999541 g/L.</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'C(t)=2.0 - 1.5\\,e^{-0.05 t}.'
        },
        {
          type: 'html',
          value: `
                <p><b>Resultados (valores pedidos):</b></p>
                <table>
                    <thead>
                        <tr><th>   t (min)</th><th>e^-0.05t</th><th>C(t) (g/L)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>0</td><td>1.0000000000</td><td>0.5</td></tr>
                        <tr><td>10</td><td>0.6065306597</td><td>1.0902040104</td></tr>
                        <tr><td>30</td><td>0.2231301601</td><td>1.6653047598</td></tr>
                        <tr><td>60</td><td>0.0497870684</td><td>1.9253193974</td></tr>
                        <tr><td>120</td><td>0.0024787522</td><td>1.9962818717</td></tr>
                        <tr><td>300</td><td>0.000003059<td><td>1.999999541</td></tr>
                    </tbody>
                </table>
                <hr>
                <h3>5) Cantidades útiles e interpretación</h3>
                <p><b>Constante de tiempo: T = 1/k = 20 min.</p>
                <p><b>Tiempo para alcanzar el 90% del ajuste al equilibrio reduce e^-1 = 0.3679 de su valor inicia. tiempo para alcanzar al 10%): resolver 1 - e^-kt90 = 0.9 => e^-kt90 = 0.1 :</b></p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 't_{90} = -\\frac{\\ln(0.1)}{k} \\approx \\frac{2.302585093}{0.05} \\approx 46.0517\\ \\text{min}.'

        },
        {
          type: 'html',
          value: `
                <p><b>Tiempo para alcanzar $C=1.8$ g/L:</b></p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 't = -\\frac{\\ln(0.1333333)}{0.05}\\approx 40.2981\\ \\text{min}.'
        },
        {
          type: 'html',
          value: `
                <p><b>Equilibrio y estabilidad:</b> El equilibrio es C^*=C_in=2.0 g/L, el cual es <b>asintóticamente estable</b>.</p>
                <p style="text-align: center;"><img src="/ejemplo5.png" alt="Gráfica del Modelo Logístico con campo de direcciones" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>
                <p style="text-align: center;"><img src="/ejemplo6.png" alt="Gráfica del Modelo Logístico con campo de direcciones" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>
            
            
            `
        },
      ],
    },

    'Métodos de Euler para sistemas': {
      color: 'green',
      title: 'MÉTODO DE EULER — FÓRMULA Y POR QUÉ DE CADA PASO',
      content: [
        {
          type: 'html',
          value: `
                <h3>Problema General</h3>
                <p>Tenemos la EDO:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dy}{dt}=f(t,y),\\qquad y(t_0)=y_0,'
        },
        {
          type: 'html',
          value: `
                <p>y queremos aproximar y(t) en adelante.</p>
                <hr>
                <h3>Idea Básica (Intuitiva)</h3>
                <p>La derivada dy / dt en (t_n,y_n) nos da la pendiente de la solución en ese punto. Si avanzamos un pequeño paso $h$ en el tiempo, la variación  Δy se aproxima por la pendiente multiplicada por el paso:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\Delta y \\approx f(t_n,y_n)\\,h.'
        },
        {
          type: 'html',
          value: `
                <h3>Fórmula de Euler (Avance Explícito)</h3>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\boxed{\\,y_{n+1} = y_n + h\\; f(t_n,y_n),\\qquad t_{n+1}=t_n+h\\,}'
        },
        {
          type: 'html',
          value: `
                <h3>Por qué cada parte de la fórmula:</h3>
                <ul>
                    <li>f(t_n,y_n): Es la **pendiente** en el punto actual — se usa la pendiente local porque la EDO define la derivada en ese punto.</li>
                    <li>Multiplicar por h Transforma la pendiente (derivada) en un **incremento aproximado** Δy (porque f = Δy/h => Δy = fh).</li>
                    <li>Supongamos y_n + Δy Sumamos para obtener la aproximación en el nuevo tiempo t_n+1. Es un método iterativo (paso a paso).</li>
                </ul>
                <hr>
                <h3>Notas Conceptuales Importantes</h3>
                <ul>
                    <li><strong>Es una aproximación: Euler traza, en cada intervalo [t_n,t_n+1], el segmento con pendiente constante f(t_n,y_n). Si la verdadera solución curva mucho, el error aumenta.</li>
                    <li><strong>Error global típico: del orden O(h). Reducir h mejora la precisión linealmente (aprox.).</li>
                    <li><strong>Estabilidad: para sistemas lineales con autovalores λ, la aproximación es estable si |1+h λ| < 1.</li>
                </ul>
                <hr>
                <h2>EJEMPLO 1 — ESCALAR CLÁSICO</h2>
                <p><strong>Ecuación:</strong></p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\frac{dy}{dt}=y,\\qquad y(0)=1.'
        },
        {
          type: 'html',
          value: `
                <p>Queremos aproximar hasta $t=0.3$ con paso $h=0.1$.</p>

                <h3>Paso 0 — Inicialización (por qué)</h3>
                <p>Tomamos t_0=0 y y_0=1.</p>
                <p><strong>Por qué:</strong> Condición inicial dada; es el punto de partida.</p>
                <p>Fórmula a aplicar:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'y_{n+1} = y_n + h\\cdot f(t_n,y_n)\\quad\\text{con }f(t,y)=y.'
        },
        {
          type: 'html',
          value: `
                <p><strong>Por qué:</strong> La derivada es y, y esa es la pendiente que usaremos para el pequeño paso $h$.</p>

                <h3>Paso 1 (n=0 → n=1) — Cálculo y Explicación Detallada</h3>
                <p>Datos: t_0=0, y_0=1, h=0.1.</p>
                <ul>
                    <li><strong>Pendiente:</strong> f(t_0,y_0)=y_0=1.</li>
                    <li><strong>Por qué:</strong> La EDO dice que en (0,1) la derivada vale 1.</li>
                    <li><strong>Incremento:</strong> Δy = h * f(t_0,y_0) = 0.1 * 1 = 0.1</li>
                    <li><strong>Por qué:</strong> Multiplicamos la pendiente por el paso para estimar el cambio.</li>
                    <li><strong>Actualización:</strong> y_1 = y_0 Δy = 1+0.1 = 1.1</li>
                    <li><strong>Por qué:</strong> Esa es la aproximación de la solución en t_1=0.1.</li>
                </ul>

                <h3>Paso 2 (n=1 → n=2) — Cálculo y Explicación Detallada</h3>
                <p>Ahora t_1=0.1,\\ y_1=1.1.</p>
                <ul>
                    <li><strong>Pendiente:</strong> f(t_1,y_1)=y_1=1.1</li>
                    <li><strong>Por qué:</strong> La EDO sigue siendo dy/dt=y.</li>
                    <li><strong>Incremento:</strong> Δy = 0.1 * 1.1 = 0.11.</li>
                    <li><strong>Actualización:</strong> y_2 = y_1+0.11 = 1.1+0.11 = 1.21.</li>
                    <li><strong>Por qué:</strong> Seguimos la pendiente local para avanzar otro paso.</li>
                </ul>

                <h3>Paso 3 (n=2 → n=3) — Cálculo y Explicación Detallada</h3>
                <p>Ahora t_2=0.2,\\ y_2=1.21.</p>
                <ul>
                    <li><strong>Pendiente:</strong> f(t_2,y_2)=y_2= 1.21.</li>
                    <li><strong>Incremento:</strong> Δy = 0.1 *  1.21 = 0.121 .(1.21*0.1 = 0.121</li>
                    <li><strong>Actualización:</strong> y_3 = y_2+0.121 = 1.21+0.121 = 1.331.</li>
                </ul>
                <hr>
                <h3>Interpretación Intermedia (Por qué Importa)</h3>
                <p>En cada paso, hemos utilizado la pendiente en el extremo izquierdo del subintervalo [t_n,t_n+1].</p>
                <p>Por eso, si la curva sube rápido (como e^t), Euler se queda "por debajo" de la verdadera trayectoria. Si se reduce h (p. ej., h=0.05), el incremento en cada paso sería menor, y la recta local aproximaría mejor la curvatura real, reduciendo el error.</p>
                <hr>
                <h3>Comparación con la Solución Exacta y Error</h3>
                <p><strong>Solución exacta:</strong> y(t)=e^t.</p>
                <p><strong>Valores Exactos (aproximacion con alta presición):</strong></p>
                <ul>
                     <li>y=(0) e^0.1 = 1.0000000000</li>
                    <li>y=(0.1) = y^0.1 = 1.1051709180756477</li>
                    <li>y(0.2) = y(0.2) =1.2214027581601699 </li>
                    <li>y(0.3) = e^0.3 = 1.3498584970625382.</li>

                    <p><strong>Errores (por qué calcularlos):</strong> Muestran cuánto se desvía la aproximación de Euler de la solución exacta (la verdad). El error crece a medida que avanzamos en el tiempo.</p>
        <ul>
            <li>t=0.1: Error |1.1051709180756477 - 1.1|0.0051709181.</li>
            <li>t=0.2: Error |1.2214027581601699 - 1.21|0.0114027582.</li>
            <li>t=0.3: Error |1.3498584970625382 - 1.331|0.0188584971.</li>
        </ul>
        <p><strong>Conclusión pedagógica:</strong> El error se acumula. Se recomienda comparar con la solución exacta (si existe) para cuantificar el error y experimentar con distintos $h$ para ver cómo mejora la precisión.</p>
        <p style="text-align: center;"><img src="/ejemploE.png" alt="Gráfica del Modelo Logístico con campo de direcciones" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>
                    
            `
        },

        {
          type: 'html',
          value: `
        <hr>
        <h2>EJEMPLO 2 — SISTEMA LINEAL 2×2 (TODO PASO A PASO Y POR QUÉ)</h2>
        <h3>Sistema (Forma Matricial):</h3>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mathbf{X}\'(t)=A\\,\\mathbf{X}(t),\\qquad A=\\begin{pmatrix}0 & 1\\\\ -2 & -3\\end{pmatrix},\\quad \\mathbf{X}(0)=\\begin{pmatrix}2\\\\0\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p>Es equivalente al sistema escalar:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\begin{cases} x_1\' = x_2,\\[4pt] x_2\' = -2x_1 -3x_2.\\end{cases}'
        },
        {
          type: 'html',
          value: `
        <p>Usamos paso h=0.1. Aplicamos Euler vectorial:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mathbf{X}_{n+1} = \\mathbf{X}_n + h\\,A\\,\\mathbf{X}_n.'
        },
        {
          type: 'html',
          value: `
        <h3>Razón del método (por qué)</h3>
        <ul>
            <li>$AX_n es la derivada X' en t_n.</li>
            <li>Multiplicamos por h para convertir la derivada en un incremento aproximado.</li>
            <li>Sumamos al estado actual para obtener la aproximación al estado siguiente.</li>
        </ul>

        <h3>Paso 0 — Inicial</h3>
        <p>$X_0 = (2,0) (condición inicial)</p>
        
        <h3>Cálculo Detallado Paso por Paso</h3>
        <h4>Cálculo de AX_0 (por qué)</h4>
        <p>Multiplicación matriz–vector:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'A\\mathbf{X}_0 = \\begin{pmatrix}0 & 1\\\\ -2 & -3\\end{pmatrix}\\begin{pmatrix}2\\\\0\\end{pmatrix} = \\begin{pmatrix}0\\cdot 2 + 1\\cdot 0\\\\ -2\\cdot 2 + (-3)\\cdot 0\\end{pmatrix} = \\begin{pmatrix}0\\\\ -4\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p><strong>Por qué:</strong> La derivada en t_0 es (0,-4)^T.</p>

        <h4>Paso 1 (n=0 → n=1)</h4>
        <p><strong>Incremento:</strong></p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'h\\cdot A\\mathbf{X}_0 = 0.1\\cdot \\begin{pmatrix}0\\\\-4\\end{pmatrix} = \\begin{pmatrix}0\\\\-0.4\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p><strong>Actualización:</strong></p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mathbf{X}_1 = \\mathbf{X}_0 + \\begin{pmatrix}0\\\\-0.4\\end{pmatrix} = \\begin{pmatrix}2\\\\0\\end{pmatrix} + \\begin{pmatrix}0\\\\-0.4\\end{pmatrix} = \\begin{pmatrix}2.0\\\\-0.4\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p><strong>Por qué:</strong> Nueva aproximación en t_1=0.1.</p>

        <h4>Cálculo de AX_1 (por qué)</h4>
        <p>Multiplicamos A por X_1:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'A\\mathbf{X}_1 = \\begin{pmatrix}0 & 1\\\\ -2 & -3\\end{pmatrix}\\begin{pmatrix}2.0\\\\-0.4\\end{pmatrix} = \\begin{pmatrix}0\\cdot 2.0 + 1\\cdot(-0.4)\\\\ -2\\cdot2.0 + (-3)\\cdot(-0.4)\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p>Realizamos la aritmética paso a paso:</p>
        <ul>
            <li>Primera componente: 0+(-0.4)=-0.4.</li>
            <li>Segunda componente: -4.0 + 1.2 = -2.8. (porque -2 *  2.0 = -4.0 y -3 * (-0.4)=+1.2).</li>
        </ul>
        <p>Así:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'A\\mathbf{X}_1 = \\begin{pmatrix}-0.4\\\\ -2.8\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <h4>Paso 2 (n=1 → n=2)</h4>
        <p><strong>Incremento:</strong></p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '0.1\\cdot A\\mathbf{X}_1 = \\begin{pmatrix}-0.04\\\\ -0.28\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p>(Multiplicar por 0.1 desplaza el punto decimal).</p>
        <p><strong>Actualización:</strong></p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mathbf{X}_2 = \\mathbf{X}_1 + \\begin{pmatrix}-0.04\\\\ -0.28\\end{pmatrix} = \\begin{pmatrix}2.0 - 0.04\\\\ -0.4 - 0.28\\end{pmatrix} = \\begin{pmatrix}1.96\\\\ -0.68\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <h4>Cálculo de AX_2 (por qué)</h4>
        <p>Multiplicamos:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'A\\mathbf{X}_2 = \\begin{pmatrix}0 & 1\\\\ -2 & -3\\end{pmatrix}\\begin{pmatrix}1.96\\\\ -0.68\\end{pmatrix} = \\begin{pmatrix} -0.68 \\\\ -2\\cdot1.96 + (-3)\\cdot(-0.68)\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p>Aritmética paso a paso:</p>
        <ul>
            <li>Primera componente: 0 * 1.96 + 1 * (-0.68) = -0.68}.</li>
            <li>segunda componente: -2 * 1.96 = -3.92</li>
            <li>-3 * (-0.68) = +2.04</li>
            <li>suma-3.92 + 2.04 = -1.88.</li>
        </ul>
        <p>Entonces:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: 'A\\mathbf{X}_2 = \\begin{pmatrix}-0.68\\\\ -1.88\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <h4>Paso 3 (n=2 → n=3)</h4>
        <p><strong>Incremento:</strong></p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '0.1\\cdot A\\mathbf{X}_2 = \\begin{pmatrix}-0.068\\\\ -0.188\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <p><strong>Actualización:</strong></p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mathbf{X}_3 = \\mathbf{X}_2 + \\begin{pmatrix}-0.068\\\\ -0.188\\end{pmatrix} = \\begin{pmatrix}1.96 - 0.068\\\\ -0.68 - 0.188\\end{pmatrix} = \\begin{pmatrix}1.892\\\\ -0.868\\end{pmatrix}.'
        },
        {
          type: 'html',
          value: `
        <hr>
        <h3>Comparación con la Solución Exacta (por qué comprobar)</h3>
        <p>La solución exacta para esta condición inicial se puede escribir (por análisis espectral) como:</p>
    `
        },
        {
          type: 'math',
          mode: 'block',
          value: '\\mathbf{X}(t)=4\\begin{pmatrix}1\\\\-1\\end{pmatrix}e^{-t}-2\\begin{pmatrix}1\\\\-2\\end{pmatrix}e^{-2t}.'
        },
        {
          type: 'html',
          value: `
        <p>Evaluemos aproximadamente en t=0.1 (esto permite cuantificar el error de Euler en el primer paso):</p>
        <p>Calculamos e^-0.1 y e^-0.2 con precisión:</p>
        <p>e^-0.1 =  0.9048374180. e^-0.2 = 0.8187307531.</p>
        
        <p><strong>Cálculo de x_1 exacto:</strong></p>
        <p>x_1exact(0.1)=4 * 0.9048374180 - 2 * 0.8187307531 = 3.6193496720 - 1.6374615062 = 1.9818881658.</p>
        
        <p><strong>Cálculo de x_2 exacto:</strong></p>
        <p>x_2exact(0.1) = -4 * 0.9048374180 + 4 + 0.8187307531 = -3.6193496720 + 3.2749230124 = -0.3444266596.</p>
        
        <p>Euler en t=0.1 dio X_1 = (2.0, -0.4).</p>

        <h3>Cálculo del Error</h3>
        <ul>
            <li><strong>Vector de Error:</strong> e = X1 - Xexat(0.1) = (0.0181118342, −0.0555733404).</li>
            <li><strong>Norma (Error Global Típico):</strong> |e| = √0.01811^2 + 0.05557^2 = 0.0585/li>
        </ul>
        <p><strong>Por qué calcular la norma:</strong> Da una medida única del tamaño del error en el estado.</p>
        <hr>

        <h3>Observaciones de Estabilidad y Elección de h (por qué importa)</h3>
        <p>Para un sistema lineal X'=AX con autovalores λ, la iteración de Euler aplica el mapa multiplicativo (I + hA) por paso. Cada autovalor λ produce un factor 1+hλ en la dirección propia correspondiente.</p>
        <p>Si |1+hλ| > 1 para algún λ con parte real negativa, la aproximación numérica puede crecer y volverse inestable, aunque la solución exacta decaiga. Por eso se exige típicamente h pequeño para mantener estabilidad.</p>
        <p>En nuestro ejemplo, autovalores λ_1=-1, λ_2=-2:</p>
        <ul>
            <li>Para λ=-1: condición |1- h|<1 => h<2.</li>
            <li>Para λ=-2: |1-2h|<1 => h<1.</li>
        </ul>
        <p>Conjuntamente, elegir h<1 basta; con h=0.1 estamos seguros de **estabilidad numérica** (pero no exentos de error de truncamiento).</p>
        <hr>
        <p style="text-align: center;"><img src="/ejemploE2.png" alt="Gráfica de Soluciones: Euler (h=0.1) vs. Solución Exacta " style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 5px;"></p>

        
    `
        }
      ]
    },

    'Ecuaciones de Lorenz': {
      color: 'purple',
      title: 'EJEMPLOS DE LAS ECUACIONES DE LORENZ — DINÁMICA Y CAOS',
      content: [
        {
          type: 'html',
          value: `
                <h3>Ejemplo 1 — Sistema de Lorenz clásico</h3>
                <p>Consideremos el sistema original propuesto por Edward Lorenz en 1963:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: `
                \\begin{cases}
                \\dfrac{dx}{dt} = \\sigma (y - x), \\\\[4pt]
                \\dfrac{dy}{dt} = x (\\rho - z) - y, \\\\[4pt]
                \\dfrac{dz}{dt} = xy - \\beta z.
                \\end{cases}
            `
        },
        {
          type: 'html',
          value: `
                <p>Tomemos los parámetros clásicos del modelo:</p>
                <ul>
                    <li>σ = 10</li>
                    <li>ρ = 28</li>
                    <li>β = 8/3</li>
                </ul>

                <p>y las condiciones iniciales:</p>
                <p>(x₀, y₀, z₀) = (1, 1, 1).</p>

                <hr>
                <h3>Interpretación Física</h3>
                <ul>
                    <li>x: velocidad de convección del fluido.</li>
                    <li>y: diferencia de temperatura entre corrientes.</li>
                    <li>z: variación de la temperatura vertical.</li>
                </ul>

                <p>Este sistema muestra un comportamiento no lineal, con trayectorias que nunca se repiten pero que permanecen acotadas en una región del espacio tridimensional (el llamado <strong>atractor de Lorenz</strong>).</p>

                <hr>
                <h3>Simulación con el Método de Euler</h3>
                <p>Aplicamos Euler con paso h = 0.01 en el intervalo t ∈ [0, 25].</p>

                <p>El esquema iterativo es:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: `
                \\begin{aligned}
                x_{n+1} &= x_n + h\\,\\sigma (y_n - x_n),\\\\[4pt]
                y_{n+1} &= y_n + h\\,[x_n (\\rho - z_n) - y_n],\\\\[4pt]
                z_{n+1} &= z_n + h\\,(x_n y_n - \\beta z_n).
                \\end{aligned}
            `
        },
        {
          type: 'html',
          value: `
                <p><strong>Por qué:</strong> Cada ecuación representa la evolución temporal de una variable. El método de Euler aproxima la trayectoria mediante incrementos lineales proporcionales a las pendientes locales definidas por el sistema.</p>

                <hr>
                <h3>Pasos iniciales del cálculo (h=0.01)</h3>
                <ul>
                    <li>Paso 0: t₀=0, (x₀, y₀, z₀) = (1, 1, 1).</li>
                    <li>Pendientes iniciales:
                        <ul>
                            <li>dx/dt = 10(1 − 1) = 0</li>
                            <li>dy/dt = 1(28 − 1) − 1 = 26</li>
                            <li>dz/dt = 1×1 − (8/3)×1 = 1 − 2.6667 = −1.6667</li>
                        </ul>
                    </li>
                    <li>Actualización (Euler):</li>
                </ul>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: `
                \\begin{aligned}
                x_1 &= 1 + 0.01 \\times 0 = 1.0000,\\\\
                y_1 &= 1 + 0.01 \\times 26 = 1.26,\\\\
                z_1 &= 1 + 0.01 \\times (-1.6667) = 0.9833.
                \\end{aligned}
            `
        },
        {
          type: 'html',
          value: `
                <p>En el siguiente paso:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: `
                \\begin{aligned}
                dx/dt &= 10(1.26 - 1.000) = 2.6,\\\\
                dy/dt &= 1.000(28 - 0.9833) - 1.26 = 25.7567,\\\\
                dz/dt &= 1.000(1.26) - (8/3)(0.9833) = 1.26 - 2.622 = -1.362.
                \\end{aligned}
            `
        },
        {
          type: 'html',
          value: `
                <p>Avanzando con h=0.01:</p>
            `
        },
        {
          type: 'math',
          mode: 'block',
          value: `
                \\begin{aligned}
                x_2 &= 1.000 + 0.01(2.6) = 1.026,\\\\
                y_2 &= 1.26 + 0.01(25.7567) = 1.5176,\\\\
                z_2 &= 0.9833 + 0.01(-1.362) = 0.9697.
                \\end{aligned}
            `
        },
        {
          type: 'html',
          value: `
                <p>Este proceso se repite hasta t ≈ 25. Los valores comienzan a oscilar de forma impredecible, generando un patrón caótico.</p>

                <hr>
                <h3>Visualización del Atractor</h3>
                <p>La representación tridimensional de las trayectorias muestra dos lóbulos interconectados que recuerdan las alas de una mariposa:</p>
                <p style="text-align: center;">
                    <img src="/lorenzAttractor.png" alt="Atractor de Lorenz" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 5px;">
                </p>

                <hr>
                <h3>Ejemplo 2 — Sensibilidad a Condiciones Iniciales</h3>
                <p>Si repetimos el cálculo con condiciones ligeramente distintas, por ejemplo:</p>
                <p>(x₀, y₀, z₀) = (1.001, 1, 1),</p>
                <p>la trayectoria coincide con la original durante los primeros segundos, pero luego diverge completamente, aunque las ecuaciones son idénticas.</p>

                <p>Esta divergencia exponencial de trayectorias cercanas se conoce como <strong>Sensibilidad a las Condiciones Iniciales</strong>, y es una de las firmas del caos determinista.</p>

                <p style="text-align: center;">
                    <img src="/lorenzSensitivity.png" alt="Sensibilidad al estado inicial en el sistema de Lorenz" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 5px;">
                </p>

                <hr>
                <h3>Ejemplo 3 — Transición al Caos según ρ</h3>
                <p>El parámetro ρ controla la intensidad del forzamiento térmico. Variando ρ se observan tres regímenes distintos:</p>
                <ul>
                    <li><strong>ρ < 1</strong>: el sistema converge a un punto fijo (reposo estable).</li>
                    <li><strong>ρ ≈ 10</strong>: aparecen oscilaciones periódicas (no caóticas).</li>
                    <li><strong>ρ ≈ 28</strong>: surge el atractor caótico de Lorenz.</li>
                </ul>
                <p>Gráficamente, se puede ver la transición del comportamiento estable al caótico:</p>
                <p style="text-align: center;">
                    <img src="/lorenzTransition.png" alt="Transición al caos en el sistema de Lorenz según ρ" style="max-width: 100%; height: auto; border: 1px solid #ccc; border-radius: 5px;">
                </p>

                <hr>
                <h3>Conclusión Pedagógica</h3>
                <ul>
                    <li>El sistema de Lorenz demuestra que incluso ecuaciones deterministas simples pueden producir comportamientos impredecibles.</li>
                    <li>El método de Euler (con paso pequeño) permite explorar numéricamente la evolución de sistemas caóticos.</li>
                    <li>Las simulaciones visuales ayudan a comprender conceptos abstractos como el caos, los atractores y la sensibilidad a condiciones iniciales.</li>
                </ul>
            `
        }
      ]
    },





  }
  const tabContents = {
    teoria: {
      color: 'blue',
      title: 'Bienvenido al Módulo de Teoría de SISTEMAHT 📚',
      // El contenido de teoría debe ser la introducción cuando activeTopic es null
      content: [
        {
          type: 'html',
          value: `
                <p>Este software ha sido diseñado para apoyarte en el aprendizaje de los <strong>sistemas de ecuaciones diferenciales de primer orden</strong>.</p>
                <p>Para comenzar, selecciona cualquiera de los **temas en el menú lateral** (Modelación, Geometría, Métodos) y explora el contenido de la lección.</p>
                <p>¡Explora los temas y mejora tus habilidades!</p>
            `,
        },
      ],
    },
    ejemplos: {
      color: 'green',
      title: 'Módulo de Ejemplos y Aplicaciones',
      // ⭐️ CAMBIO A ARRAY DE OBJETOS
      content: [
        {
          type: 'html',
          value: `
                <p>En este módulo, verás la aplicación práctica de la teoría aprendida. Aquí podrás:</p>
                <ul>
                    <li><strong>Analizar casos de estudio</strong> como el modelo de Lotka-Volterra (presa-depredador).</li>
                    <li><strong>Revisar soluciones analíticas</strong> paso a paso para sistemas lineales.</li>
                    <li><strong>Comparar las soluciones numéricas</strong> de Euler con las soluciones exactas.</li>
                </ul>
                <p>¡Prepárate para llevar la teoría a la práctica!</p>
            `,
        },
      ],
    },
    practica: {
      color: 'green',
      title: 'Práctica Interactiva y Evaluación',
      // ⭐️ CAMBIO A ARRAY DE OBJETOS
      content: [
        {
          type: 'html',
          value: `
                <p>¡Pon a prueba tus conocimientos con nuestros ejercicios interactivos!</p>
                <p>Esta sección contiene:</p>
                <ul>
                    <li><strong>Ejercicios de Modelación:</strong> Plantea el sistema de ecuaciones para un problema dado.</li>
                    <li><strong>Cálculo de Equilibrios:</strong> Determina los puntos de equilibrio de un sistema.</li>
                    <li><strong>Simulación Numérica:</strong> Ejecuta pasos del método de Euler.</li>
                </ul>
                <p>Obtendrás retroalimentación instantánea para seguir tu progreso.</p>
            `,
        },
      ],
    },
    jugar: {
      color: 'green',
      title: 'Simulación y Exploración (Juego)',
      // ⭐️ CAMBIO A ARRAY DE OBJETOS
      content: [
        {
          type: 'html',
          value: `
                <p>¡Bienvenido al Sandbox! Este no es un juego tradicional, sino un entorno de **experimentación**.</p>
                <p>Aquí puedes:</p>
                <ul>
                    <li>**Modificar Parámetros:** Cambia $\\sigma, \\rho, \\beta$ en las ecuaciones de Lorenz y observa el cambio de caos a estabilidad.</li>
                    <li>**Condiciones Iniciales:** Varía $x_0, y_0, z_0$ para visualizar el Efecto Mariposa.</li>
                    <li>**Visualización en Tiempo Real:** Observa cómo las trayectorias se dibujan en el plano fase.</li>
                </ul>
                <p>Es la forma más divertida y visual de comprender el comportamiento dinámico de los sistemas.</p>
            `,
        },
      ],
    },
  };

  // ⭐️ LÓGICA DE RENDERIZADO: Decide qué contenido pasar a TabContent.
  let contentToRender = tabContents[activeTab];
  let currentKey = activeTab;

  // Decide qué conjunto de contenidos usar (teoriaContents o ejemplosContents)
  let specificContents = null;
  if (activeTab === 'teoria') {
    specificContents = teoriaContents;
  } else if (activeTab === 'ejemplos') {
    specificContents = ejemplosContents;
  }

  if (specificContents && activeTopic && specificContents[activeTopic]) {
    // SI estamos en Teoría o Ejemplos Y hay un sub-tema seleccionado,
    // usamos el contenido específico (teoría o ejemplos).
    contentToRender = specificContents[activeTopic];
    currentKey = activeTopic;
  }
  // SI activeTopic es null, contentToRender sigue siendo tabContents[activeTab] (la introducción).

  const verContenido = async (tema) => {
    if (!tema) return;

    setMostrarContenidos(true); // ✅ mostrar contenedor
    setCargandoContenido(true);
    setContenidosTema([]);

    try {
      const seccion = activeTab || "teoria";
      const temaLimpio = tema.trim().replace(/\.$/, "");

      const res = await fetch(
        `http://localhost:3001/api/estudiante/contenido/${encodeURIComponent(
          temaLimpio
        )}/${encodeURIComponent(seccion)}`
      );

      const data = await res.json();
      setCargandoContenido(false);

      if (!data || (!data.contenidos?.length && !data.archivos?.length)) {
        // Mostrar mensaje por 2 segundos y ocultar
        setContenidosTema([]);
        setTimeout(() => setMostrarContenidos(false), 2000);
        return;
      }

      const lista = [];
      data.contenidos?.forEach((item, i) => {
        lista.push({ tipo: "contenido", texto: `${i + 1}. ✏️ ${item.descripcion}` });
      });
      data.archivos?.forEach((file, i) => {
        lista.push({
          tipo: "archivo",
          texto: `${(data.contenidos?.length || 0) + i + 1}. 📄 ${file.nombreArchivo}`,
        });
      });

      setContenidosTema(lista);
    } catch (err) {
      console.error("❌ Error al obtener contenidos:", err);
      setContenidosTema([]);
      setTimeout(() => setMostrarContenidos(false), 2000);
      setCargandoContenido(false);
    }
  };


  // === SUMAR TIEMPO POR CONTENIDO ABIERTO (1 min) ===
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.idEstudiante || !contenidoActual) return;

    const fk_idContenido =
      contenidoActual?.idContenido ?? contenidoActual?.id ?? contenidoActual?.storedFilename;

    if (!fk_idContenido) return;

    let minutos = 0;

    const intervalo = setInterval(async () => {
      minutos += 1;
      try {
        await fetch("http://localhost:3001/api/estadistica/contenido", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idEstudiante: user.idEstudiante,
            fk_idContenido,
            tiempoInvertido: 1, // 👈 1 min
          }),
        });
        console.log(`⏱️ (+1) min en contenido ${fk_idContenido} (local=${minutos})`);
      } catch (err) {
        console.error("❌ Error sumando tiempo por contenido:", err);
      }
    }, 60000);

    return () => clearInterval(intervalo);
  }, [contenidoActual]);



  useEffect(() => {
    if (!activeTopic) return; // No cargar si no hay tema seleccionado

    const fetchContenidosPorTema = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/estudiante/contenido/${encodeURIComponent(activeTopic)}`
        );

        // 🔹 Combinar enunciados y archivos
        const { contenidos, archivos } = res.data;

        const combinados = [
          ...(contenidos || []).map((c) => ({
            idContenido: c.idContenido, // 👈 mantener este nombre
            tipo: c.tipo || "Enunciado",
            descripcion: c.descripcion,
          })),
          ...(archivos || []).map((a) => ({
            idContenido: a.idContenido || a.storedFilename,
            tipo: a.tipo || "Archivo",
            nombreArchivo: a.nombreArchivo,
            rutaArchivo: a.rutaArchivo,
          })),
        ];

        setContenidosHabilitados(combinados);
      } catch (err) {
        console.error("❌ Error al obtener contenidos por tema:", err);
        alert("❌ Error al obtener los contenidos habilitados");
      }
    };

    fetchContenidosPorTema();
  }, [activeTopic]);


  // ============================
  // ✅ REGISTRO DE VISTA DE CONTENIDO (módulo + tema correctos)
  // ============================
  const registrarVistaDeContenido = async (contenidoExtra = {}) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.idEstudiante) return;

      // 🔹 Mapeo entre pestañas y módulo
      const moduloMap = { teoria: "1", ejemplos: "2", practica: "3", jugar: "4" };

      // 🔹 Detectar módulo (si se forzó, se usa; si no, se usa el activo)
      const modulo =
        contenidoExtra?.moduloForzado && moduloMap[contenidoExtra.moduloForzado.toLowerCase()]
          ? moduloMap[contenidoExtra.moduloForzado.toLowerCase()]
          : moduloMap[activeTab?.toLowerCase()] || null;

      if (!modulo) {
        console.warn("⚠️ No se pudo determinar el módulo actual.");
        return;
      }

      // 🔹 Tema: prioriza el pasado por parámetro
      const tema =
        contenidoExtra?.tema && contenidoExtra.tema.trim() !== ""
          ? contenidoExtra.tema
          : activeTopic
            ? activeTopic
            : "Sin tema";

      const fk_idContenido = contenidoExtra?.fk_idContenido || null;
      const nombreArchivo = contenidoExtra?.nombreArchivo || null;

      const body = {
        idEstudiante: user.idEstudiante,
        modulo,
        tema,
        fk_idContenido,
        nombreArchivo,
      };

      console.log("📤 Enviando registro:", body);

      const res = await fetch("http://localhost:3001/api/estudiantecontenido/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error HTTP al registrar vista");
      console.log(`✅ Vista registrada → estudiante ${user.idEstudiante}, módulo ${modulo}, tema ${tema}`);
    } catch (err) {
      console.error("❌ Error registrando vista:", err);
    }
  };

  // ============================
  // ✅ CAMBIO DE PESTAÑA (MÓDULO)
  // ============================
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMostrarContenidos(false);
    setActiveTopic(null);

    // ✅ Usamos el valor directamente, no dependemos del estado asincrónico
    registrarVistaDeContenido({ moduloForzado: tab });
  };

  // ============================
  // ✅ SELECCIÓN DE TEMA
  // ============================
  const handleTopicSelect = (topic) => {
    setActiveTopic(topic);

    // ✅ Esperamos a que React actualice el estado (para evitar "viejo activeTab")
    setTimeout(() => {
      registrarVistaDeContenido({
        tema: topic,
        moduloForzado: activeTab || localStorage.getItem("lastTab") || "teoria",
      });
    }, 150);
  };

  // ============================
  // ✅ OPCIONAL: GUARDAR EL ÚLTIMO TAB ACTIVO EN LOCALSTORAGE
  // ============================
  useEffect(() => {
    if (activeTab) localStorage.setItem("lastTab", activeTab);
  }, [activeTab]);



  return (
    <div className="student-menu-container">
      <div className="header">
        <div className="logo">SisteMath</div>

        {/* 🔹 Encabezado dinámico con nombre del estudiante */}
        <div className="user-info">
          {(() => {
            const user = JSON.parse(localStorage.getItem("user"));
            const nombre = user?.nombre || "Estudiante";
            return <span>Bienvenido, {nombre}</span>;
          })()}
          <button
            onClick={() => {
              localStorage.removeItem("user");
              onLogout(); // mantiene tu flujo normal de cierre
            }}
            style={{ marginLeft: "10px" }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* === BOTONES DE CONTENIDOS HABILITADOS === */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "10px",
            justifyContent: "center",
          }}
        >

        </div>
      </div>

      <div className="nav-tabs">
        <button
          className={activeTab === "teoria" ? "active" : ""}
          onClick={() => handleTabChange("teoria")}
        >
          Teoría
        </button>
        <button
          className={activeTab === "ejemplos" ? "active" : ""}
          onClick={() => handleTabChange("ejemplos")}
        >
          Ejemplos
        </button>
        <button
          className={activeTab === "practica" ? "active" : ""}
          onClick={() => handleTabChange("practica")}
        >
          Práctica
        </button>
        <button
          className={activeTab === "jugar" ? "active" : ""}
          onClick={() => handleTabChange("jugar")}
        >
          Jugar
        </button>
      </div>
      <div className="content-sections">
        {/* ✅ MOSTRAR TeoriaMenu solo en Teoría y Ejemplos */}
        {(activeTab === "teoria" || activeTab === "ejemplos") && (
          <TeoriaMenu onTopicSelect={handleTopicSelect} activeTopic={activeTopic} />
        )}

        

        {/* 📘 Bloque de botón + lista de contenidos */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: "20px",
    marginTop: "10px",
  }}
>
  <button
    onClick={() => verContenido(activeTopic)}
    style={{
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      transition: "transform 0.2s ease",
    }}
    onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
    onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
  >
    📘 Ver contenidos de {activeTopic || "tema seleccionado"}
  </button>

  {/* 🧱 Caja que aparece justo debajo del botón */}
  {mostrarContenidos && (
    <div
      className="contenedor-contenidos"
      style={{
        marginTop: "12px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #d1d1d1",
        borderRadius: "8px",
        padding: "10px",
        width: "260px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {cargandoContenido ? (
        <p style={{ color: "#007bff", textAlign: "center" }}>⏳ Cargando contenidos...</p>
      ) : contenidosTema.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {contenidosTema.map((item, i) => (
            <li
              key={i}
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "6px",
                margin: "4px 0",
                padding: "6px 8px",
                fontSize: "13px",
                color: "#333",
              }}
            >
              {item.texto}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: "center", color: "#856404" }}>⚠️ No hay contenidos habilitados</p>
      )}
    </div>
  )}
</div>




        {/* ✅ Render según pestaña */}
        {activeTab === "jugar" ? (
          <JuegoMemo key="juego-memo" onTopicSelect={handleTopicSelect} />
        ) : activeTab === "practica" ? (
          <div style={{ width: "100%" }}>
            <Practica key="practica" onTopicSelect={handleTopicSelect} />
          </div>
        ) : (
          // 🔹 Teoría y Ejemplos (con menú y botón verde)
          <TabContent
            key={currentKey}
            {...contentToRender}
            handleNext={handleNext}
            isLastTab={activeTab === "jugar"}
            showNextButton={activeTab !== "teoria" && activeTab !== "ejemplos"}
          />
        )}
      </div>


      {/* 🪟 MODAL DE CONTENIDO */}
      {mostrarModal && contenidoSeleccionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setMostrarModal(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "60%",
              maxHeight: "80%",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{contenidoSeleccionado.tipo}</h3>
            <p>{contenidoSeleccionado.descripcion}</p>

            {contenidoSeleccionado.nombreArchivo && (
              <a
                href={`http://localhost:3001/uploads/${contenidoSeleccionado.rutaArchivo}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  background: "#007bff",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                📄 Ver archivo
              </a>
            )}

            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                onClick={() => setMostrarModal(false)}
                style={{
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
};

export default StudentMenu;