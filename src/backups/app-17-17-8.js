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

const chatStates = new Map();

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

app.post("/webhookwhatsapp", async function (request, response) {
	console.log("Incoming webhook: " + JSON.stringify(request.body));
	console.log("entro normal de los nuevos ")

	const { entry } = request.body;
	const { changes } = entry?.[0] || {};
	const { value } = changes?.[0] || {};
	const { messages } = value || {};
	const message = messages?.[0];

	if (message) {
		handleIncomingMessage(message);
	}

	response.sendStatus(200);
});

function handleIncomingMessage(message) {
	const numero = message.from;
	const textoMensaje = message.text.body.toLowerCase();

	const mensajeInicial = ["¡Hola! Estoy interesado en la Samsung Galaxy Book3"];
    const mensajeGracias = ["Gracias"];

	if (message.type === 'text') {
		// mensajeFacebook("59168249790", textoMensaje);

		if (textoMensaje === 'Dos') {
			sendProductDetails(numero);
		}
	}
}

async function sendProductDetails(numero) {
	const dia = await obtenerDiaActual();

	await mensajeFacebook(numero, `¡Hola! Puedes encontrar todos los detalles y realizar la compra de la Samsung Galaxy Book en nuestra tienda 👉 multi.bz/samsung 🛒💻.`);
	await mensajeFacebook(numero, `Si realizas tu compra, pedido o reserva hoy, ${dia}, puedes retirarlo en nuestra tienda física desde las 11:00 a 19:00 o solicitar el envío a donde estés.`);
	await mensajeFacebook(numero, `Te dejo algunos modelos de nuestros productos más demandados. Si deseas ver los precios actualizados, simplemente haz clic en el enlace proporcionado.`);

	const products = [
		{
			code: 		"100353",
			processor: 	"Intel Core i7 a 5Ghz de 13a. Gen.",
			ram: 		"8GB a 4267 Mhz",
			storage: 	"SSD NVME 512 GB",
			screen: 	"15,6 FULLHD AMOLED Touchscreen Convertible",
			graphics: 	"Intel® Iris® Xᵉ Graphics",
			priceUrl: 	"https://multilaptops.net/producto/100353",
			price: 		"Bs. 3300"
		  },
		{
			code: 		"100345",
			processor: 	"Intel Core i9-13980HX a 5,6Ghz de 13a Gen. con 24 núcleos físicos",
			ram: 		"16GB a 4800 Mhz DDR5",
			storage: 	"SSD 1TB PCIe® 4.0 NVMe™ M.2",
			screen: 	"16\" LED IPS FHD (1920x1200), actualización de 165Hz",
			graphics: 	"NVIDIA® GeForce RTX™ 4070 (8GB de GDDR6)",
			priceUrl: 	"https://multilaptops.net/producto/100345",
			price: 		"Bs. 19890"
		},
		// ... Agrega más productos aquí ...
	];

	for (const product of products) {
		const productText = createProductText(product);
		await productoFacebook(numero, product.code, productText, "Equipo de ventas Multilaptops");
	}

	await mensajeFacebook(numero, `Si te interesa uno de nuestros productos, necesitas más información o estás listo para comprar, estoy aquí para ayudarte. Puedo agendarte una llamada, y un asesor de ventas se pondrá en contacto contigo para facilitar todo el proceso.`);
	await mensajeFacebook(numero, `Nos esforzamos por hacer tu experiencia de compra lo más sencilla y cómoda posible. Como empresa moderna y líder en innovación tecnológica, revisa todos nuestros productos en multilaptops.net. ¡No dudes en contactarnos con cualquier pregunta!`);
}

function createProductText(product) {
	return [
	  `*Código SKU:* ${product.code}`,
	  `*Procesador:* ${product.processor}`,
	  `*Memoria RAM:* ${product.ram}`,
	  `*Almacenamiento:* ${product.storage}`,
	  `*Pantalla:* ${product.screen}`,
	  `*Gráficos:* ${product.graphics}`,
	  `-----------------------------------`,
	  `*(${product.price}) Ver precio actualizado 👉* ${product.priceUrl}`,
	  `-----------------------------------`,
	].join('\n');
}

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
// Hola mundo
// git add .
// git commit -m "16/08/23 : 16:20"
// git push origin master