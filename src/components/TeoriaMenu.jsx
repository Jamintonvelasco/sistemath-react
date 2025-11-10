// TeoriaMenu.jsx

import React from 'react';

// Recibe la función para seleccionar el tema y el tema activo como props
const TeoriaMenu = ({ onTopicSelect, activeTopic }) => {
  const topics = [
    'Modelación por medio de sistemas',
    'Geometría de sistemas',
    'Método analítico para SE', // Usamos la abreviatura de la imagen original
    'Método de Euler para sistemas',
    'Ecuaciones de Lorenz',
  ];

  return (
    // Agrega una clase para estilizar el menú lateral
    <div className="teoria-menu-sidebar"> 
      {topics.map((topic) => (
        <button
          key={topic}
          // Si el tema es el activo, añade la clase 'active-topic' para resaltarlo
          className={activeTopic === topic ? 'active-topic' : ''} 
          // Llama a la función del padre con el tema al hacer clic
          onClick={() => onTopicSelect(topic)}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default TeoriaMenu;