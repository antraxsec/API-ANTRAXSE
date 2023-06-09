// server.js
import express from "express";
import axios from 'axios';
import cors from "cors";
import items from "./routes/item.routes.js";
import whatsapps from "./routes/whatsapp.routes.js";
import indexRouter from "./routes/index.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import requestCounterMiddleware from "./requestCounterMiddleware.js";
import { WHATSAPP_API_KEY } from "./config.js";

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

///api de whatsapp
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

	if (request.body.entry &&
		request.body.entry[0] &&
		request.body.entry[0].changes &&
		request.body.entry[0].changes[0] &&
		request.body.entry[0].changes[0].value &&
		request.body.entry[0].changes[0].value.messages &&
		request.body.entry[0].changes[0].value.messages[0]) {

		console.log(request.body.entry[0].changes[0].value.contacts);///contacto que te envia mensaje
		console.log(request.body.entry[0].changes[0].value.messages);///datos del mensaje
		console.log(request.body.entry[0].changes[0].value.messages[0].type); //tipo de mensaje 
		console.log(request.body.entry[0].changes[0].value.messages[0].from); //numero de contacto
		console.log(request.body.entry[0].changes[0].value.messages[0].text.body); //mensaje

		// Verificar el tipo de mensaje, si es de texto y contiene contenido.
		if (request.body.entry[0].changes[0].value.messages[0].type === 'text') {
			// Enviar el mensaje de respuesta
			if (request.body.entry[0].changes[0].value.messages[0].text.body === 'dos') {
				sendMessage(request.body.entry[0].changes[0].value.messages[0].from, "¡Hola! Este es un mensaje automático.");
			}
		}
	}

	response.sendStatus(200);
});

app.use("/whatsapp", whatsapps);
/////funciones para el bot



function sendMessage(to, textBody) {
	var message = {
		"messaging_product": 'whatsapp',
		"recipient_type": 'individual',
		"to": to,
		"type": "text",
		"text": {
			"preview_url": false,
			"body": textBody
		}
	};

	var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
	var token = WHATSAPP_API_KEY

	axios.post(url, message, {
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		}
	})
		.then(response => {
			console.log("Mensaje enviado con éxito");
		})
		.catch(error => {
			console.log("Error al enviar el mensaje: ", error);
		});
}


//////end funciones para bot

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
