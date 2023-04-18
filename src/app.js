// server.js
import express from "express";
import cors from "cors";
import items from "./routes/item.routes.js";
import indexRouter from "./routes/index.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import requestCounterMiddleware from "./requestCounterMiddleware.js";


const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(requestCounterMiddleware(io));
app.use(indexRouter);
app.use("/api", items);
app.post("/webhook", (req, res) => {
  //resive el webhook de stripe watsapi
  console.log(req.body);
});

//nuevo dos
//app.post("/webhookwhatsapp", (req, res) => {
  //resive el webhook de stripe watsapi
  //console.log(req.body);
//});

app.get("/webhookwhatsapp", function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == "david"
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/webhookwhatsapp", function (request, response) {
  console.log("Incoming webhook: " + JSON.stringify(request.body));
  response.sendStatus(200);
});





let dataTracking = [];
let dataUsuarios = [];

io.on('connection', (socket) => {
	console.log('Petición LIVE al servidor:', socket.id);

	socket.on('userTracer', (data) => {

		socket.id = data.id_sesion + '_' + socket.id;

		// let existeSesion = dataUsuarios.some((item) => item.id === socket.id);
		// if (existeSesion) {
		// 	console.log('Esta sesion ya existe, continua');
		// }
		// else{
			let usuario = {};
				usuario.id = socket.id;
				dataUsuarios.push(usuario);
				console.log('Usuarios actualizados:', dataUsuarios);

				data.id_socket = socket.id;
				dataTracking.push(data);
		// }

		io.emit('usuarioId', socket.id); 
		io.emit('usuariosConectados', dataUsuarios, dataUsuarios.length); 
		io.emit('serverTracer', dataTracking)

	});
	
	socket.on('disconnect', () => {
	  	console.log('Petición LIVE finalizada:', socket.id);
		dataUsuarios = dataUsuarios.filter(item => item.id !== socket.id);

		io.emit('usuariosConectados', dataUsuarios, dataUsuarios.length); 
		console.log('Usuarios actualizados:', dataUsuarios);

		dataTracking = dataTracking.filter(item => item.id_socket !== socket.id);
		// console.log('------------------------1');
		// console.log(dataTracking)
		// console.log('------------------------2');
		io.emit('serverTracer', dataTracking)
	});

});

app.use(express.static("public"));

export default server;
