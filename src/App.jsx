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
  CHECK_INTERVAL: 5000 // Si no hay datos en 5s, borra los números
};

function App() {
  // Ahora el estado inicial tiene las llaves pero con valores null
  const [data, setData] = useState({
    carros: null,
    motos: null,
    discapacitados: null
  });
  
  const watchdogRef = useRef(null);

  const startWatchdog = () => {
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    
    watchdogRef.current = setTimeout(() => {
      // Ponemos los valores en null, pero mantenemos las llaves para que los iconos sigan ahí
      setData({ carros: null, motos: null, discapacitados: null });
      console.warn("⚠️ Conexión inactiva. Ocultando números...");
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
      <div className="stats-grid">
        {Object.keys(data).map((key) => (
          <div className="row-item" key={key}>
            {/* El icono SIEMPRE se renderiza */}
            <div className="icon-container">
              <img src={CONFIG.ICONS[key]} alt={key} className="category-icon" />
            </div>
            
            {/* El número SOLO se renderiza si no es null */}
            <div className="number" style={{ color: CONFIG.COLORS[key] }}>
              {data[key] !== null ? data[key] : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;