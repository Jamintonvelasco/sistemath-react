import React, { useState } from "react";

const Login = ({ onLoginSuccess, onViewRecovery }) => {
  const [modo, setModo] = useState("login"); // "login" o "registro"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [isLoading, setIsLoading] = useState(false);

  // === LOGIN REAL ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/login", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: username, contrasena: password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Bienvenido ${data.usuario} (${data.rol})`);

        // 🔹 Guardar datos del usuario logueado (para mostrar nombre en TeacherMenu)
        const userData = {
          idUsuario: data.idUsuario,
          idProfesor: data.idProfesor ?? 0,
          idEstudiante: data.idEstudiante ?? 0,
          nombre: data.usuario,
          rol: data.rol,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ Usuario guardado:", userData);


        // 🔹 Redirigir según el rol
        onLoginSuccess(data.rol);
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // === REGISTRO REAL ===
  const handleRegister = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const res = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: username,
        correo,
        contrasena: password,
        rol,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Registro exitoso, ahora puedes iniciar sesión");

      // 🔹 Guardar datos del usuario recién registrado
      localStorage.setItem(
        "user",
        JSON.stringify({
          idUsuario: data.idUsuario,
          nombre: data.usuario || username,
          rol: data.rol || rol,
        })
      );

      console.log("✅ Usuario guardado en localStorage:", {
        idUsuario: data.idUsuario,
        nombre: data.usuario || username,
        rol: data.rol || rol,
      });

      // 🔹 Redirigir según el rol
      onLoginSuccess(data.rol || rol);
    } else {
      alert(data.message || "Error al registrar usuario");
    }

  } catch (error) {
    console.error("❌ Error al registrar:", error);
    alert("Error de conexión con el servidor");
  } finally {
    setIsLoading(false);
  }
};


return (
  <div className="login-page">
    <div className="login-container">
      <div className="login-form">
        <h2>{modo === "login" ? "Iniciar sesión" : "Registrar usuario"}</h2>

        {modo === "login" ? (
          <form onSubmit={handleLogin}>
            <label htmlFor="username">Correo:</label>
            <input
              type="email"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Cargando..." : "INICIAR SESIÓN"}
            </button>
            <p>
              <a href="#" onClick={onViewRecovery}>
                ¿Has olvidado tu contraseña?
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label>Nombre completo:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Correo electrónico:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label>Rol:</label>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="estudiante">Estudiante</option>
              <option value="profesor">Profesor</option>
              <option value="administrador">Administrador</option>
            </select>

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Registrando..." : "REGISTRAR"}
            </button>
          </form>
        )}

        <div className="switch-mode">
          {modo === "login" ? (
            <p>
              ¿No tienes cuenta?{" "}
              <button onClick={() => setModo("registro")}>Registrarse</button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => setModo("login")}>Inicia sesión</button>
            </p>
          )}
        </div>
      </div>

      <div className="image-section">{/* Imagen o fondo con CSS */}</div>
    </div>
  </div>
);
};

export default Login;
