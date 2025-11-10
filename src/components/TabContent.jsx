// TabContent.jsx

import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css'; // ⭐️ Importa los estilos de KaTeX

// La prop 'content' ahora puede ser una cadena (viejo formato) o un array (nuevo formato)
const TabContent = ({ title, content, color, handleNext, isLastTab, showNextButton = true }) => {
  
  // Función de ayuda para renderizar el contenido
  const renderContent = (item, index) => {
    if (item.type === 'html') {
      // Si es HTML, renderizar con dangerouslySetInnerHTML
      return <div key={index} dangerouslySetInnerHTML={{ __html: item.value }} />;
    } else if (item.type === 'math') {
      // Si es Math, usar BlockMath (para fórmulas centradas y grandes)
      if (item.mode === 'block') {
        // La fórmula LaTeX debe ir en la prop 'math'
        return <BlockMath key={index} math={item.value} />; 
      }
      // Si es 'inline' (dentro de un párrafo) se usaría InlineMath
      return <InlineMath key={index} math={item.value} />; 
    }
    return null;
  };
    
  return (
    // Agregamos la clase 'tab-content' para facilitar el estilo flexible
    <div className="tab-content">
      <div className={`tab-content-header bg-${color}`}>
        <h2>{title}</h2>
      </div>
      
      <div className="tab-content-body">
        {/* Verifica si el contenido es el nuevo formato (array) */}
        {Array.isArray(content) ? (
          content.map(renderContent)
        ) : (
          // Si el contenido es una cadena (el formato original), lo renderiza como HTML
          <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>

      {showNextButton && (
        <button onClick={handleNext} disabled={isLastTab}>
          {isLastTab ? 'Finalizar' : 'Siguiente'}
        </button>
      )}
    </div>
  );
};

export default TabContent;