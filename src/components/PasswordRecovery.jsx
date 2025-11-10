import React, { useState } from 'react';

const PasswordRecovery = ({ onViewLogin }) => {
  const [email, setEmail] = useState('');

  const handleSend = () => {
    alert(`Se ha enviado un correo de recuperación a: ${email}`);
  };

  return (
    <div className="recovery-page">
      <div className="recovery-container">
        <div className="recovery-form">
          <p>Ingrese el correo electrónico</p>
          <label htmlFor="email">Correo:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="recovery-buttons">
            <button onClick={onViewLogin}> &lt;-- Volver</button>
            <button onClick={handleSend}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecovery;