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

  console.log(clientIp);
  const geo = geoip.lookup(clientIp);
  const country = geo ? geo.country : "Desconocido";

  console.log(
    `Cliente conectado: Navegador - ${browser}, Sistema operativo - ${os}, Dispositivo - ${deviceType}, País - ${country}`
  );

  io.emit("activeUsers", activeUsers);

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("activeUsers", activeUsers);
  });
});

app.use(express.static("public"));

export default server;
