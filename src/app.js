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
let datosDavid = [];
// Manejar conexiones y desconexiones de Socket.IO
io.on("connection", (socket) => {
  activeUsers++;

  io.emit("activeUsers", activeUsers);
  io.emit("idUsuario", socket.id);
  //resivir datos de david
  socket.on("datosDavid", (data) => {
    console.log(data);
    data.id = socket.id;
    datosDavid.push(data);
    io.emit("todosDatosDavid", datosDavid);
  });

  //console.log(datosDavid);

  socket.on("disconnect", () => {
    activeUsers--;
    io.emit("activeUsers", activeUsers);
    //eliminar usuario de la lista  de usuarios conectados
    console.log(datosDavid);
    datosDavid = datosDavid.filter((item) => item.id !== socket.id);
    console.log(datosDavid);

    console.log("usuario desconectado");
    io.emit("todosDatosDavid", datosDavid);
  });
});

app.use(express.static("public"));

export default server;

/// donde esta el servidor
///https://railway.app/project/2a24385c-f6d0-46e2-a79e-ce4460940421/service/4719a159-1bd3-433e-87bd-d5b5bd538b91?id=e38a0adf-18f8-45a7-a0f9-c9a75d0cf90d
