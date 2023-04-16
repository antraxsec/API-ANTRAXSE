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
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(requestCounterMiddleware(io));
app.use(indexRouter);
app.use("/api", items);

let dataTracking = [];
let dataUsuarios = [];
let usuariosActivos = 0;
const usuarios = new Map();

io.on("connection", (socket) => {
	
	usuariosActivos++;
	console.log("que tal metal");

	io.emit("idUsuario", socket.id);
	io.emit("usuariosActivos", usuariosActivos);

	let usuario = {};
		usuario.id = socket.id;
		dataUsuarios.push(usuario);

	// socket.on("user connected", (username) => {
	// 	socket.username = username;
	// 	console.log('Este es nombre de usuairo:: ', username);
	// 	usuarios.set(socket.id, { id: socket.id, name: username });
	// 	io.emit("update users", Array.from(usuarios.values()));
	// });

	socket.on("userTracer", (data) => {
		console.log(data);

		const dispositivo = data.dispositivo_cookie;
		const pais 	      = data.pais_trackingsesion;
		const idsesion    = data.id_sesion;

		const existeSesion = dataTracking.some((item) => item.id_sesion === idsesion);
		if (!existeSesion) {
			dataTracking.push(data);
		}
		else{
			console.log('Esta sesion ya existe, continua');
		}

		if (pais !== null) {
			console.log("El país es:: ".pais);
		} else {
			console.log("No llego datos de geolocalización");
		}

		io.emit("serverTracer", dataTracking, dataUsuarios);
	});

	socket.on("disconnect", () => {
		usuariosActivos--;
		io.emit("usuariosActivos", usuariosActivos);
		// //eliminar usuario de la lista  de usuarios conectados
		dataUsuarios = dataUsuarios.filter((item) => item.id !== socket.id);
		console.log(dataUsuarios);

		usuarios.delete(socket.id);
		io.emit("update users", Array.from(usuarios.values()));
	  });
});

app.use(express.static("public"));

export default server;
