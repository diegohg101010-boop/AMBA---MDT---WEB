// Componente de efectos de fondo animados
export default function BackgroundEffects() {
  return (
    <>
      {/* Partículas flotantes */}
      <div className="particles-container">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      {/* Hexágonos flotantes */}
      <div className="hexagon-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="hexagon"></div>
        ))}
      </div>

      {/* Círculos concéntricos pulsantes */}
      <div className="pulse-circles">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="pulse-circle"></div>
        ))}
      </div>

      {/* Código binario cayendo */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="binary-rain">
          {Array(50).fill(0).map((_, j) => (
            <div key={j}>{Math.random() > 0.5 ? '1' : '0'}</div>
          ))}
        </div>
      ))}

      {/* Ondas electromagnéticas */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="em-wave"></div>
      ))}

      {/* Estrellas parpadeantes */}
      {[...Array(15)].map((_, i) => (
        <div key={i} className="star"></div>
      ))}

      {/* Líneas de conexión */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="connection-line horizontal"></div>
      ))}

      {/* Puntos de datos */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="data-point"></div>
      ))}

      {/* Grid 3D en perspectiva */}
      <div className="grid-3d"></div>

      {/* Línea de escaneo */}
      <div className="scan-line"></div>

      {/* Vignette (oscurecimiento en bordes) */}
      <div className="vignette"></div>

      {/* Glow en esquinas */}
      <div className="glow-corner top-left"></div>
      <div className="glow-corner top-right"></div>
      <div className="glow-corner bottom-left"></div>
      <div className="glow-corner bottom-right"></div>

      {/* Líneas laterales */}
      <div className="side-lines left"></div>
      <div className="side-lines right"></div>

      {/* Radar sweep */}
      <div className="radar-sweep"></div>

      {/* Data streams */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="data-stream"></div>
      ))}

      {/* Efecto de interferencia (glitch) */}
      <div className="glitch-overlay"></div>
    </>
  );
}
