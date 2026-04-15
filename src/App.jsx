import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import "./App.css";

const CONFIG = {
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
  // MODIFICA ESTO PARA MOVER TODO EL DISEÑO
  LAYOUT: {
    gridGap: "2vh",           // Separación vertical entre filas
    iconSize: "30vh",         // Tamaño de los iconos (alto y ancho)
    numberFontSize: "32vh",   // Tamaño de la fuente de los números
    spacingIconNumber: "4cm", // Espacio entre el icono y el número
    alignment: "center"       // Alineación general
  },
  CHECK_INTERVAL: 5000 
};

function App() {
  const [data, setData] = useState({
    carros: null,
    motos: null,
    discapacitados: null
  });
  
  const watchdogRef = useRef(null);

  const startWatchdog = () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      setData({ carros: null, motos: null, discapacitados: null });
    }, CONFIG.CHECK_INTERVAL);
  };

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(CONFIG.API_URL)
      .withAutomaticReconnect()
      .build();

    connection.on("update", (newData) => {
      setData(newData); 
      startWatchdog(); 
    });

    connection.start()
      .then(() => console.log("✅ Conectado"))
      .catch(err => console.error("❌ Error:", err));

    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      connection.stop();
    };
  }, []);

  return (
    <div className="main-container">
      <div className="stats-grid" style={{ gap: CONFIG.LAYOUT.gridGap }}>
        {Object.keys(data).map((key) => (
          <div className="row-item" key={key} style={{ gap: CONFIG.LAYOUT.spacingIconNumber }}>
            
            {/* Mitad Izquierda: El icono se pega a la derecha de su contenedor */}
            <div className="icon-wrapper">
              <div 
                className="icon-container" 
                style={{ width: CONFIG.LAYOUT.iconSize, height: CONFIG.LAYOUT.iconSize }}
              >
                <img src={CONFIG.ICONS[key]} alt={key} className="category-icon" />
              </div>
            </div>
            
            {/* Mitad Derecha: El número se pega a la izquierda de su contenedor */}
            <div className="number-wrapper">
              <div 
                className="number" 
                style={{ 
                  color: CONFIG.COLORS[key], 
                  fontSize: CONFIG.LAYOUT.numberFontSize 
                }}
              >
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