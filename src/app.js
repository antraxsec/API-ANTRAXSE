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
import { mensajeFacebook, productoFacebook } from './funciones.js'
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
	console.log("entro normal de los nuevos ")

	if (request.body.entry &&
		request.body.entry[0] &&
		request.body.entry[0].changes &&
		request.body.entry[0].changes[0] &&
		request.body.entry[0].changes[0].value &&
		request.body.entry[0].changes[0].value.messages &&
		request.body.entry[0].changes[0].value.messages[0]) {

		console.log("numero celular:", request.body.entry[0].changes[0].value.contacts);///contacto que te envia mensaje
		console.log("datos del mensaje:", request.body.entry[0].changes[0].value.messages);///datos del mensaje
		console.log("tipo de mensaje:", request.body.entry[0].changes[0].value.messages[0].type); //tipo de mensaje 
		console.log("numero de contacto:", request.body.entry[0].changes[0].value.messages[0].from); //numero de contacto
		console.log("numero celular:", request.body.entry[0].changes[0].value.messages[0].text.body); //mensaje
		console.log(WHATSAPP_API_KEY)
		let numero = request.body.entry[0].changes[0].value.messages[0].from//numero contacto
		let mensaje = request.body.entry[0].changes[0].value.messages[0].text.body//mensaje enviado
		// Verificar el tipo de mensaje, si es de texto y contiene contenido.
		if (request.body.entry[0].changes[0].value.messages[0].type === 'text') {
			// Enviar el mensaje de respuesta
			if (mensaje === 'dos') {
				const dia = obtenerDiaActual();
				mensajeFacebook(numero, `¡Hola! Puedes encontrar todos los detalles y realizar la compra de la Samsung Galaxy Book en nuestra tienda 👉 multi.bz/samsung 🛒💻.`);
				mensajeFacebook(numero, `Si realizas tu compra, pedido o reserva hoy, ${dia}, puedes retirarlo en nuestra tienda física desde las 11:00 a 19:00 o solicitar el envío a donde estés.`);
				mensajeFacebook(numero, `Te dejo algunos modelos de nuestros productos más demandados. Si deseas ver los precios actualizados, simplemente haz clic en el enlace proporcionado.`);
				let uno = `*Código SKU:* 100279
				*Procesador:* Intel Core i3 a 4,1Ghz de 11a. Gen.
					*Memoria RAM:* 8GB a 2666 Mhz
					*Almacenamiento:* SSD NVME 256 GB
					*Pantalla:* 15,6" LED FULLHD (1920 x 1080)
					*Gráficos:* UHD Intel Core`
				let unofooter = `*(Bs. 3300) Ver precio actualizado 👉* https://multilaptops.net/producto/100279`
				productoFacebook(numero, "100354", uno, unofooter)
			}
			if (mensaje === 'Pro') {
				productoFacebook(numero, "100354", `*Código SKU:* 100279
*Procesador:* Intel Core i3 a 4,1Ghz de 11a. Gen.
*Memoria RAM:* 8GB a 2666 Mhz
*Almacenamiento:* SSD NVME 256 GB
*Pantalla:* 15,6" LED FULLHD (1920 x 1080)
*Gráficos:* UHD Intel Core`, `*(Bs. 3300) Ver precio actualizado 👉* https://multilaptops.net/producto/100279`)
			}
			////fecha
			async function obtenerDiaActual() {

				const fecha = new Date();
				const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
				const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

				const diaLiteral = dias[fecha.getDay()];
				const diaNumero = fecha.getDate().toString();
				const mesLiteral = meses[fecha.getMonth()]; // Obtener el nombre del mes

				// Concatenar el día y mes en el formato deseado
				const fechaActual = `${diaLiteral} ${diaNumero} de ${mesLiteral}`;

				console.log('Fecha actual:', fechaActual); // Ejemplo: "Fecha actual: Miércoles 09 de agosto"

				return fechaActual;
			}
		}
	}

	response.sendStatus(200);
});

app.use("/whatsapp", whatsapps);
/////funciones para el bot





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
