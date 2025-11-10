// src/App.jsx
import React, { useState } from "react";
import Login from "./components/Login";
import StudentMenu from "./components/StudentMenu";
import TeacherMenu from "./components/TeacherMenu";
import PasswordRecovery from "./components/PasswordRecovery";

function App() {
  const [view, setView] = useState("login");
  const [rol, setRol] = useState(null);

  const handleLoginSuccess = (rolUsuario) => {
    const rolLimpio = rolUsuario?.toLowerCase()?.trim();
    setRol(rolLimpio);
    if (rolLimpio === "estudiante") setView("estudiante");
    else if (rolLimpio === "profesor") setView("profesor");
    else setView("login");
  };

  const handleLogout = (target) => {
    if (target === "panelProfesor") {
      setView("profesor");
      return;
    }
    setRol(null);
    setView("login");
  };

  return (
    <div className="app-container">
      {view === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onViewRecovery={() => setView("recovery")}
        />
      )}

      {view === "recovery" && (
        <PasswordRecovery onViewLogin={() => setView("login")} />
      )}

      {view === "estudiante" && <StudentMenu onLogout={handleLogout} />}

      {view === "profesor" && <TeacherMenu onLogout={handleLogout} />}
    </div>
  );
}

export default App;
