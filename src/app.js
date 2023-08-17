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
import { mensajeFacebook, productoFacebook, ubicacionFacebook } from './funciones.js'
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

// app.post("/webhookwhatsapp", async function (request, response) {
// 	console.log("Incoming webhook: " + JSON.stringify(request.body));
// 	console.log("entro normal de los nuevos ")

// 	const { entry } = request.body;
// 	const { changes } = entry?.[0] || {};
// 	const { value } = changes?.[0] || {};
// 	const { messages } = value || {};
// 	const message = messages?.[0];

// 	if (message) {
// 		handleIncomingMessage(message);
// 	}

// 	response.sendStatus(200);
// });

app.post("/webhookwhatsapp", async function (request, response) {
	console.log("Incoming webhook: " + JSON.stringify(request.body));

	const { entry } = request.body;
	const { changes } = entry?.[0] || {};
	const { value } = changes?.[0] || {};
	const { messages } = value || {};
	const messageDetails = messages?.[0];
	const message = messages?.[0];

	// if (message) {
	// 	const chatId = messageDetails?.chat?.id;
	// 	const messageText = messageDetails?.message?.text;
	// 	if (chatId && message) {
	// 		await handleIncomingMessage(chatId, message);
	// 	} else {
	// 		console.log("Falta información en el mensaje entrante");
	// 	}
	// }
	if (message) {
		const chatId = messageDetails?.chat?.id;
		handleIncomingMessage(chatId, message);
	}

	response.sendStatus(200);
});


// function handleIncomingMessage(message) {
// 	const numero = message.from;
// 	const textoMensaje = message.text.body.toLowerCase();

// 	const mensajeInicial = ["¡Hola! Estoy interesado en la Samsung Galaxy Book3"];
//     const mensajeGracias = ["Gracias"];

// 	if (message.type === 'text') {
// 		// mensajeFacebook("59168249790", textoMensaje);

// 		if (textoMensaje === 'Dos') {
// 			sendProductDetails(numero);
// 		}
// 	}
// }

async function handleIncomingMessage(chatId, message) {
	const currentState = chatStates.get(chatId) || "initial";

	const numero = message.from;
	const messageText = message.text.body.toLowerCase();

	const mensajeInicial = ["¡Hola! Estoy interesado en la Samsung Galaxy Book3"];

	// await mensajeFacebook(numero, "¡Hola! 🤗 Bienvenido a Multilaptopsxxx " + currentState + messageText);

	switch (currentState) {
		case "initial":
			if (messageText === "hola mundo") {
				await mensajeFacebook(numero, "¡Hola! 🤗 Bienvenido a Multilaptops");
				// chatStates.set(numero, "welcomed");
			}
			else if (mensajeInicial.some(phrase => messageText.indexOf(phrase.toLowerCase()) !== -1)) {
				await promocionFlow(numero);
			}
			else if (messageText === "admin") {
				await adminFlow(numero);
				chatStates.set(chatId, "admin");
			}
			break;
		case "admin":
			switch (messageText) {
				case "1":
					mensajeFacebook(numero, `Ingresa el número [Promo] ⬇`);
					chatStates.set(chatId, "reenviarPromocion");
					break;
				case "2":
					break;
				case "3":
					mensajeFacebook(numero, `Ingresa el número [Ubica]⬇`);
					chatStates.set(chatId, "reenviarUbicacion");
					break;
				case "4":
					mensajeFacebook(numero, `Ingresa el número [ProcesoCompra]⬇`);
					chatStates.set(chatId, "reenviarProcesoCompra");
					break;
				case "5":
					mensajeFacebook(numero, `Ingresa el número [FormaPago]⬇`);
					chatStates.set(chatId, "reenviarFormasPago");
					break;
				case "9":
					mensajeFacebook(numero, `Saliendo`);
					chatStates.set(chatId, "initial");
					break;
				default:
					await adminFlow();
					chatStates.set(chatId, "admin");
			}
			break;
		// case "reenviarPromocion":
		//     if (validarNumerocelular(message.body)) {
		//         await promocionFlow(message.body, true);
		//         chatStates.set(chatId, "reenviarPromocion");
		//     }
		//     else if (message.body === "1") {
		//         chatStates.set(chatId, "admin");
		//     }
		//     else{
		//         client.sendMessage(message.from, [
		//             `Ingresa un número de celular válido.`,
		//             ` 1️⃣ Salir.`,
		//         ].join('\n'));
		//         chatStates.set(chatId, "reenviarPromocion");
		//     }
		// break;
		case "reenviarUbicacion":
			if (validarNumerocelular(message.text.body)) {
				await reenviarUbicacion(message.text.body, true);
				chatStates.set(chatId, "reenviarUbicacion");
			}
			else if (message.text.body === "1") {
				chatStates.set(chatId, "admin");
			}
			else {
				mensajeFacebook(numero, [
					`Ingresa un número de celular válido.`,
					` 1️⃣ Salir.`,
				].join('\n'));
				chatStates.set(chatId, "reenviarUbicacion");
			}
			break;
	}
}

async function promocionFlow(numero) {
	const dia = await obtenerDiaActual();

	await mensajeFacebook(numero, `¡Hola! Puedes encontrar todos los detalles y realizar la compra de la Samsung Galaxy Book en nuestra tienda 👉 multi.bz/samsung 🛒💻.`);
	await mensajeFacebook(numero, `Si realizas tu compra, pedido o reserva hoy, ${dia}, puedes retirarlo en nuestra tienda física desde las 11:00 a 19:00 o solicitar el envío a donde estés.`);
	await mensajeFacebook(numero, `Te dejo algunos modelos de nuestros productos más demandados. Si deseas ver los precios actualizados, simplemente haz clic en el enlace proporcionado.`);

	const products = [
		{
			code: "100353",
			processor: "Intel Core i7 a 5Ghz de 13a. Gen.",
			ram: "8GB a 4267 Mhz",
			storage: "SSD NVME 512 GB",
			screen: "15,6 FULLHD AMOLED Touchscreen Convertible",
			graphics: "Intel® Iris® Xᵉ Graphics",
			priceUrl: "https://multilaptops.net/producto/100353",
			price: "Bs. 3300"
		},
		{
			code: "100345",
			processor: "Intel Core i9-13980HX a 5,6Ghz de 13a Gen. con 24 núcleos físicos",
			ram: "16GB a 4800 Mhz DDR5",
			storage: "SSD 1TB PCIe® 4.0 NVMe™ M.2",
			screen: "16\" LED IPS FHD (1920x1200), actualización de 165Hz",
			graphics: "NVIDIA® GeForce RTX™ 4070 (8GB de GDDR6)",
			priceUrl: "https://multilaptops.net/producto/100345",
			price: "Bs. 19890"
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

async function adminFlow(numero) {
	mensajeFacebook(numero, [
		`🔒 *Modo Admin* 🔒`,
		``,
		` 1️⃣ Reenviar promoción 1 ➜`,
		` 2️⃣ Seleccionar productos ➜`,
		` 3️⃣ Enviar ubicación ➜`,
		` 4️⃣ Enviar Proceso de compra ➜`,
		` 5️⃣ Formas de pago ➜`,
		` 8️⃣ ChatGPT 🤖`,
		`9️⃣ Salir`,
	].join('\n'));
}

async function reenviarUbicacion(contactId, isReflow = false) {
	const contact = isReflow ? `591${contactId}@c.us` : contactId;



	// const imagen = await MessageMedia.fromUrl(
	// 	"https://multilaptops.net/recursos/imagenes/tiendaonline/mapa-uyustus2.webp"
	// );
	const texto = [
		`👉 Visítanos en *Multilaptops* - Ubicados en Calle Uyustus #990 (Esquina Calatayud, primera casa bajando por la acera izquierda), La Paz - Bolivia`,
		``,
		`▸ Atendemos con cita previa de lunes a sábado.`,
		`▸ Durante feriados y días festivos, solo atendemos compras previamente confirmadas.`,
		``,
		`Encuentra nuestra ubicación aquí: https://goo.gl/maps/g3gX5UsfrCkL2r7g8`,
		``,
		`🚩 Recuerda agendar tu visita para una mejor atención. ¡Te esperamos con gusto! 😊`,
	].join('\n');
	await ubicacionFacebook("59175258005", "-16.5047299", "-68.1550654", 'Multilaptops', texto)
	// await client.sendMessage(contact, imagen, { caption: texto });
	mensajeFacebook(contact, `Esta es nuestr aubucaicaoin::: jeje`);
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

function validarNumerocelular(numero) {
	// Convertir a string para asegurarnos de tener exactamente 11 caracteres
	numero = numero.toString();
	// Verificar que tenga 11 caracteres y devolver true o false en consecuencia
	return numero.length === 8;
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