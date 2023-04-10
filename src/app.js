// server.js
import express from "express";
import cors from "cors";
import items from "./routes/item.routes.js";
import indexRouter from "./routes/index.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import useragent from "useragent";
import geoip from "geoip-lite";
import requestCounterMiddleware from "./requestCounterMiddleware.js";

import { PORT } from "./config.js";

const app = express();
const server = createServer(app); // Crear un servidor HTTP para Express y Socket.IO
const io = new Server(server, { cors: { origin: "*" } }); // Configurar Socket.IO

app.use(cors());
app.use(express.json());
//incorporar para ver cuantos consumen mi servicio
app.use(requestCounterMiddleware(io)); // Agrega el middleware para ver cuantos consultan la api en tiempo real
app.use(indexRouter);
app.use("/api", items);

// Contador de usuarios activos
let activeUsers = 0;
let datosUsuario = [];

// Manejar conexiones y desconexiones de Socket.IO
io.on("connection", (socket) => {
  activeUsers++;

  // Obtener información sobre el navegador y dispositivo del cliente
  const userAgent = socket.handshake.headers["user-agent"];
  const agent = useragent.parse(userAgent);
  const browser = agent.toAgent(); // Nombre y versión del navegador
  const os = agent.os.toString(); // Sistema operativo
  const deviceType = agent.device.toString(); // Dispositivo (podría ser "Other" si no se puede determinar)

  // Obtener la dirección IP del cliente y buscar su ubicación (país)
  const clientIp =
    socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
  const geo = geoip.lookup(clientIp);
  const country = geo ? geo.country : "Desconocido";
  ///datos para el traking
  console.log(
    `Cliente conectado: Navegador - ${browser}, Sistema operativo - ${os}, Dispositivo - ${deviceType}, País - ${country}`
  );
  datosUsuario.push({
    navegador: browser,
    sistema: os,
    dispositivo: deviceType,
    pais: country,
    id: socket.id,
  });

  const conteo = datosUsuario.reduce(
    (acumulador, valorActual) => {
      acumulador.navegadores[valorActual.navegador] =
        (acumulador.navegadores[valorActual.navegador] || 0) + 1;
      acumulador.sistemas[valorActual.sistema] =
        (acumulador.sistemas[valorActual.sistema] || 0) + 1;
      acumulador.dispositivos[valorActual.dispositivo] =
        (acumulador.dispositivos[valorActual.dispositivo] || 0) + 1;
      acumulador.paises[valorActual.pais] =
        (acumulador.paises[valorActual.pais] || 0) + 1;
      return acumulador;
    },
    { navegadores: {}, sistemas: {}, dispositivos: {}, paises: {} }
  );

  console.log(conteo);

  io.emit("datosUsuario", conteo);

  io.emit("activeUsers", activeUsers);
  io.emit("idUsuario", socket.id);
  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("activeUsers", activeUsers);
    //eliminar usuario de la lista  de usuarios conectados
    datosUsuario = datosUsuario.filter((item) => item.id !== socket.id);
  });
});

app.use(express.static("public"));

export default server;

/// donde esta el servidor
///https://railway.app/project/2a24385c-f6d0-46e2-a79e-ce4460940421/service/4719a159-1bd3-433e-87bd-d5b5bd538b91?id=e38a0adf-18f8-45a7-a0f9-c9a75d0cf90d
