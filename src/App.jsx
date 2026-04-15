import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import "./App.css";

const DEFAULT_CONFIG = {
  API_URL: "https://serverparking-production.up.railway.app/Hub",
  COLORS: {
    carros: "#008450",
    motos: "#EFB810",
    discapacitados: "#1a66eb",
  },
  ICONS: {
    carros: "/icons/carros.png",
    motos: "/icons/motos.png",
    discapacitados: "/icons/discapacitados.png"
  },
  LAYOUT: {
    gridGap: 2,           
    iconSize: 30,         
    numberFontSize: 32,   
    spacingIconNumber: 4, 
  },
  CHECK_INTERVAL: 5000 
};

function App() {
  const [data, setData] = useState({ carros: null, motos: null, discapacitados: null });
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPos, setAdminPos] = useState({ x: 50, y: 50 });
  
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("parking_layout");
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG.LAYOUT;
  });

  const watchdogRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const startWatchdog = () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      setData({ carros: null, motos: null, discapacitados: null });
    }, DEFAULT_CONFIG.CHECK_INTERVAL);
  };

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(DEFAULT_CONFIG.API_URL)
      .withAutomaticReconnect()
      .build();

    connection.on("update", (newData) => {
      setData(newData); 
      startWatchdog(); 
    });

    connection.start()
      .then(() => console.log("✅ Conectado"))
      .catch(err => console.error("❌ Error:", err));

    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'a') setShowAdmin(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      connection.stop();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Lógica para arrastrar la ventana
  const onMouseDown = (e) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - adminPos.x,
      y: e.clientY - adminPos.y
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      setAdminPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y
      });
    };
    const onMouseUp = () => isDragging.current = false;

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [adminPos]);

  const handleLayoutChange = (e) => {
    const { name, value } = e.target;
    const newLayout = { ...layout, [name]: parseFloat(value) };
    setLayout(newLayout);
    localStorage.setItem("parking_layout", JSON.stringify(newLayout));
  };

  return (
    <div className="main-container" onDoubleClick={() => setShowAdmin(!showAdmin)}>
      
      {showAdmin && (
        <div 
          className="admin-window" 
          style={{ left: `${adminPos.x}px`, top: `${adminPos.y}px` }}
        >
          <div className="admin-header" onMouseDown={onMouseDown}>
            <span>⚙️ Ajustes de Pantalla</span>
            <button onClick={() => setShowAdmin(false)}>×</button>
          </div>
          <div className="admin-content">
            <div className="control-group">
              <label>Separación Filas: {layout.gridGap}vh</label>
              <input type="range" name="gridGap" min="0" max="20" step="0.5" value={layout.gridGap} onChange={handleLayoutChange} />
            </div>
            <div className="control-group">
              <label>Tamaño Iconos: {layout.iconSize}vh</label>
              <input type="range" name="iconSize" min="10" max="60" step="1" value={layout.iconSize} onChange={handleLayoutChange} />
            </div>
            <div className="control-group">
              <label>Tamaño Números: {layout.numberFontSize}vh</label>
              <input type="range" name="numberFontSize" min="10" max="80" step="1" value={layout.numberFontSize} onChange={handleLayoutChange} />
            </div>
            <div className="control-group">
              <label>Espacio Icono-Número: {layout.spacingIconNumber}cm</label>
              <input type="range" name="spacingIconNumber" min="0" max="15" step="0.5" value={layout.spacingIconNumber} onChange={handleLayoutChange} />
            </div>
            <p style={{fontSize: '10px', color: '#888'}}>Doble clic en fondo o tecla 'A' para cerrar</p>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ gap: `${layout.gridGap}vh` }}>
        {Object.keys(data).map((key) => (
          <div className="row-item" key={key} style={{ gap: `${layout.spacingIconNumber}cm` }}>
            <div className="icon-wrapper">
              <div className="icon-container" style={{ width: `${layout.iconSize}vh`, height: `${layout.iconSize}vh` }}>
                <img src={DEFAULT_CONFIG.ICONS[key]} alt={key} className="category-icon" />
              </div>
            </div>
            <div className="number-wrapper">
              <div className="number" style={{ color: DEFAULT_CONFIG.COLORS[key], fontSize: `${layout.numberFontSize}vh` }}>
                {data[key] !== null ? data[key] : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;