// server.js
import express from "express";
import axios from 'axios';
import cors from "cors";
import { config } from 'dotenv';
import fs from 'fs';  // Aquí está la importación del módulo fs
import fsPromises from 'fs/promises';
config();
import OpenAI from 'openai';
import items from "./routes/item.routes.js";
import whatsapps from "./routes/whatsapp.routes.js";
import indexRouter from "./routes/index.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import requestCounterMiddleware from "./requestCounterMiddleware.js";

import { ref, set } from "firebase/database";
import {db, gcsBucket, uploadFile} from '../src/firebase.js'


import { appendFile } from 'fs';
import {
	OPENAI_API_KEY,
} from "./config.js";
import { WHATSAPP_API_KEY } from "./config.js";
import { mensajeFacebook, productoFacebook, ubicacionFacebook, bottonesFacebook, imgFacebook, reaccionFacebook, bottonesDosFacebook, obtenerDescargarImagen } from './funciones.js'


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", methods:["GET", "POST"] }  });
const mensajes = ''; 

const chatStates = new Map();
//const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
		req.query["hub.verify_token"] == "david"//david ////token de verificacion
	) {
		res.send(req.query["hub.challenge"]);
	} else {
		res.sendStatus(400);
	}
});

const estado = new Map();

app.post("/webhookwhatsapp", async function (request, response) {
	// console.log("aaaaaa>> " + JSON.stringify(request.body));
	try {
		const { entry } = request.body;
		const { changes } = entry?.[0] || {};
		const { value } = changes?.[0] || {};
		const { messages, statuses } = value || {};
		const messageDetails = messages?.[0];
		const statusDetails = statuses?.[0];

		// Ahora puedes manejar los mensajes y los estados por separado
		if (messageDetails) {
			const chatId = messageDetails?.chat?.id;
			handleIncomingMessage(chatId, messageDetails); // Asegúrate de que esté implementada
			
			console.log('JEJEJE ', messageDetails)
			guardarEnFirebase(messageDetails);
		
		}

		if (statusDetails) {
			// console.log('Llego un estado desde whatsapp business')
		}

		response.sendStatus(200);
	} catch (error) {
		console.error(error);
		response.sendStatus(500);
	}

});

const STATES = {
	INITIAL: 	"initial",
	MENU: 		"menu",
	ASISTENTE:  "asistente",
	ADMIN: 		"admin",
	PROMO1: 	"reenviarPromocion",
	UBICACION: 	"reenviarUbicacion"
	// ... otros estados
};

function getCurrentState(chatId) {
	return chatStates.get(chatId) || STATES.INITIAL;
}

async function handleIncomingMessage(chatId, message) {
	const currentState = getCurrentState(chatId);
	const tipo 	 = message.type;
	const numero = message.from;
	console.warn(message)

	console.log('tipo: ', tipo);
	
	switch (currentState) {
		case STATES.INITIAL:
			nivelInitial(chatId, message, numero, tipo);
			break;
		case STATES.ADMIN:
			nivelAdmin(chatId, message, numero, tipo);
			break;
		case STATES.MENU:
			nivelMenu(chatId, message, numero, tipo);
			break;
		case STATES.PROMO1:
			if (validarNumerocelular(message.text.body)) {
				await promocionFlow(message.text.body, true);
				// await bottonesDosFacebook(message.text.body)
			}
			else if (message.text.body === "1") {
				chatStates.set(chatId, "admin");
				//chatStates.set(chatId, "initial"); new
				await adminFlow(numero);
			}
			else {
				mensajeFacebook(numero, [
					`Ingresa un número de celular válido.`,
					`1️⃣ Salir.`,
				].join('\n'));
				chatStates.set(chatId, "reenviarPromocion");
			}
			break;
		case STATES.UBICACION:
			if (validarNumerocelular(message.text.body)) {
				await reenviarUbicacion(message.text.body, true);
				// await bottonesDosFacebook(message.text.body)
			}
			else if (message.text.body === "1") {
				chatStates.set(chatId, "admin");
				await adminFlow(numero);
			}
			else {
				mensajeFacebook(numero, [
					`Ingresa un número de celular válido.`,
					`1️⃣ Salir.`,
				].join('\n'));
				chatStates.set(chatId, "reenviarUbicacion");
			}
			break;
		case STATES.ASISTENTE:
			mensajeFacebook(numero, "Estamos en el nivel del asistente");
			asistenteGPT(numero, false, message);
			break;			
	}
	
	console.log(currentState);
}

async function nivelInitial(chatId, message, numero, tipo) {
	console.log("1. Nivel inicial")

	const mensajeInicial = ["Producto"];
	if (tipo === 'text') {

		const messageText = message.text.body;
		console.log('mensaje::', messageText)

		if (messageText === "Admin") {
			// await mensajeFacebook(numero, "Administrador");
			await adminFlow(numero);
			chatStates.set(chatId, "admin");
		}
		if (messageText === "Menu") {
			await menuFlow(numero);
			chatStates.set(chatId, "menu");
		}
		if (messageText === "Hola") {
			
		}
		// else if (mensajeInicial.some(phrase => messageText.indexOf(phrase.toLowerCase()) !== -1)) {
		// 	await mensajeFacebook(numero, "¡Hola! 🤗 Bienvenido a Multilaptops");
		// }
	} 
	else if (tipo === 'interactive') {
		// Aquí puedes manejar la lógica interactiva, como botones o elementos seleccionables
		// await mensajeFacebook(numero, "¡Hola! 🤗 Bienvenido a Multilaptops");
	} 
	else if (tipo === 'reaction') {
		// Aquí puedes manejar las reacciones, como likes, dislikes, etc.
	}
	else if (tipo === 'image') {

	}
	else if (tipo === 'video') {
		// Aquí puedes manejar vídeos recibidos
	}
	else if (tipo === 'audio') {
		// Aquí puedes manejar audios recibidos, como procesar o guardar el archivo
	}
	else if (tipo === 'document') {
		// Aquí puedes manejar documentos recibidos
	}
	else if (tipo === 'location') {
		// Aquí puedes manejar la ubicación del usuario
	}
	else if (tipo === 'contacts') {
		// Aquí puedes manejar la información de contacto del usuario
	}
	else if (tipo === 'enlace') {
		// Aquí puedes manejar enlaces recibidos
	}
	else if (tipo === 'unsupported') {
		// Aquí puedes manejar enlaces recibidos
		console.log('No soportado')
	}
	else {
		// Tipo no reconocido o no soportado
		console.log('2. Tipo de mensaje no reconocido')
	}
	
}

async function nivelAdmin(chatId, message, numero, tipo) {
	console.log("2. Nivel Admin")
	await mensajeFacebook(numero, "Estamos en el nivel de administrador");

	const response = message;
	if (response.type === 'interactive' && response.interactive.type === 'button_reply') {
		const buttonId = response.interactive.button_reply.id;
		console.log("ID del botón seleccionado:", buttonId);

		switch (buttonId) {
			case "adminBoton_1":
				mensajeFacebook(numero, `Ingresa el número [Promo] ⬇`);
				chatStates.set(chatId, "reenviarPromocion");
				break;
			case "adminBoton_2":
				mensajeFacebook(numero, `Ingresa el número [Ubicación] ⬇`);
				chatStates.set(chatId, "reenviarUbicacion");
				break;
			case "adminBoton_3":
				// Lógica para el botón "Formas de "
				break;
			default:
				console.log("Botón no reconocido.");
		}	
	}	
}

async function nivelMenu(chatId, message, numero, tipo) {
	console.log("3. Nivel Menu")
	await mensajeFacebook(numero, "Estamos en el nivel del menu");

	const response = message;
	if (response.type === 'interactive' && response.interactive.type === 'button_reply') {
		const buttonId = response.interactive.button_reply.id;
		console.log("ID del botón seleccionado:", buttonId);

		switch (buttonId) {
			case "clienteBoton_1":
				promocionFlow(numero, false) 
				break;
			case "clienteBoton_2":
				reenviarUbicacion(numero, false) 
				break;
			case "clienteBoton_3":
				await mensajeFacebook(numero, "*Activando asistente*");
				await mensajeFacebook(numero, "Realiza tu consulta");
				chatStates.set(chatId, "asistente");
				break;
			default:
				console.log("Botón no reconocido.");
		}
		
	}

	else if (message.text.body === "1") {
		chatStates.set(chatId, "initial");
	}

	// switch (message.text.body) {
	// 	case "1":
	// 		mensajeFacebook(numero, `Ingresa el número [Promo] ⬇`);
	// 		chatStates.set(chatId, "reenviarPromocion");
	// 		break;
	// 	case "2":
	// 		break;
	// 	case "3":
	// 		mensajeFacebook(numero, `Ingresa el número [Ubica]⬇`);
	// 		chatStates.set(chatId, "reenviarUbicacion");
	// 		break;
	// 	case "4":
	// 		mensajeFacebook(numero, `Ingresa el número [ProcesoCompra]⬇`);
	// 		chatStates.set(chatId, "reenviarProcesoCompra");
	// 		break;
	// 	case "5":
	// 		mensajeFacebook(numero, `Ingresa el número [FormaPago]⬇`);
	// 		chatStates.set(chatId, "reenviarFormasPago");
	// 		break;
	// 	case "8":
	// 		mensajeFacebook(numero, `Escribe tu consulta aquí [GPT]⬇`);
	// 		chatStates.set(chatId, "asistenteGPT");
	// 		break;
	// 	case "9":
	// 		mensajeFacebook(numero, `Saliendo`);
	// 		chatStates.set(chatId, "initial");
	// 		break;
	// 	default:
	// 		await adminFlow();
	// 		chatStates.set(chatId, "admin");
	// }
	// break;
	
}

async function promocionFlow(contactId, isReflow = false) {

	const contact = isReflow ? `591${contactId}@c.us` : contactId;

	const dia = await obtenerDiaActual();
	console.log(`Estamos en promocionFlow ${contactId} ${contact} ${isReflow}`)

	await mensajeFacebook(contact, `¡Hola! Puedes encontrar todos los detalles y realizar la compra de la Samsung Galaxy Book en nuestra tienda 👉 multi.bz/samsung 🛒💻.`);
	// await mensajeFacebook(numero, `Si realizas tu compra, pedido o reserva hoy, ${dia}, puedes retirarlo en nuestra tienda física desde las 11:00 a 19:00 o solicitar el envío a donde estés.`);
	// await mensajeFacebook(numero, `Te dejo algunos modelos de nuestros productos más demandados. Si deseas ver los precios actualizados, simplemente haz clic en el enlace proporcionado.`);

	// const products = [
	// 	{
	// 		code: "100353",
	// 		processor: "Intel Core i7 a 5Ghz de 13a. Gen.",
	// 		ram: "8GB a 4267 Mhz",
	// 		storage: "SSD NVME 512 GB",
	// 		screen: "15,6 FULLHD AMOLED Touchscreen Convertible",
	// 		graphics: "Intel® Iris® Xᵉ Graphics",
	// 		priceUrl: "https://multilaptops.net/producto/100353",
	// 		price: "Bs. 3300"
	// 	},
	// 	{
	// 		code: "100345",
	// 		processor: "Intel Core i9-13980HX a 5,6Ghz de 13a Gen. con 24 núcleos físicos",
	// 		ram: "16GB a 4800 Mhz DDR5",
	// 		storage: "SSD 1TB PCIe® 4.0 NVMe™ M.2",
	// 		screen: "16\" LED IPS FHD (1920x1200), actualización de 165Hz",
	// 		graphics: "NVIDIA® GeForce RTX™ 4070 (8GB de GDDR6)",
	// 		priceUrl: "https://multilaptops.net/producto/100345",
	// 		price: "Bs. 19890"
	// 	},
	// 	// ... Agrega más productos aquí ...
	// ];

	// for (const product of products) {
	// 	const productText = createProductText(product);
	// 	await productoFacebook(numero, product.code, productText, "Equipo de ventas Multilaptops");
	// }

	// await mensajeFacebook(numero, `Si te interesa uno de nuestros productos, necesitas más información o estás listo para comprar, estoy aquí para ayudarte. Puedo agendarte una llamada, y un asesor de ventas se pondrá en contacto contigo para facilitar todo el proceso.`);
	// await mensajeFacebook(numero, `Nos esforzamos por hacer tu experiencia de compra lo más sencilla y cómoda posible. Como empresa moderna y líder en innovación tecnológica, revisa todos nuestros productos en multilaptops.net. ¡No dudes en contactarnos con cualquier pregunta!`);
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
	const arrayBtn = [
		{ id: "adminBoton_1", title: "Promoción" },
		{ id: "adminBoton_2", title: "Ubicación" },
		{ id: "adminBoton_3", title: "Proceso de compra" }
	];
	await bottonesFacebook(numero, "Menú del administrador", arrayBtn);
}

async function menuFlow(numero) {
	const arrayBtn = [
		{ id: "clienteBoton_1", title: "Promociones" },
		{ id: "clienteBoton_2", title: "Ubicación" },
		{ id: "clienteBoton_3", title: "Asesor de ventas" }
	];
	await bottonesFacebook(numero, "Menú del cliente", arrayBtn);
}

async function reenviarUbicacion(contactId, isReflow = false) {

	const contact = isReflow ? `591${contactId}@c.us` : contactId;

	const imagen = "https://multilaptops.net/recursos/imagenes/tiendaonline/mapa-uyustus3.jpg";
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

	await imgFacebook(contact, texto, imagen)
}

async function reenviarProcesoCompra(contactId, isReflow = false) {
	const contact = isReflow ? `591${contactId}@c.us` : contactId;

	await mensajeFacebook(contactId, `*¿Como comprar en Multilaptops?* 🛒💻`);
	await mensajeFacebook(contactId, [
		`Comprar en Multilaptops es fácil, cómodo y rápido: olvídate de los bloqueos, marchas y tráfico. `,
		``,
		`Nuestra tienda en línea multi.bz está abierta 24/7 🕒, permitiéndote explorar, realizar tus pedidos, compras y reservas a cualquier hora y desde cualquier lugar. 📦🛍️`,
	].join('\n'));

	const imagen1 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/1.webp";
	const texto1 = [
		`▸ Elige el producto que deseas comprar`,
		`▸ Envíanos el código SKU del producto elegido `,
	].join('\n');
	await imgFacebook(contactId, texto1, imagen1)

	const imagen2 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/2.webp";
	const texto2 = [
		`Comprueba la disponibilidad del producto:`,
		``,
		`✅ Disponible`,
		`🔜 Preorden`,
		`💻 Exclusivo online`,
		`🚚 En tránsito`,
	].join('\n');
	await imgFacebook(contactId, texto2, imagen2)

	const imagen3 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/3.webp";
	const texto3 = [
		`Rellena el formulario con tus datos personales: nombre completo, número de identificación y número de celular. 📝`,
	].join('\n');
	await imgFacebook(contactId, texto3, imagen3)

	const imagen4 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/4.2.webp";
	const texto4 = [
		`Selecciona tu método de entrega preferido:`,
		``,
		`✈️ *Envío nacional*: Si te encuentras en otro departamento o ciudad, elige esta opción y te lo enviaremos.`,
	].join('\n');
	await imgFacebook(contactId, texto4, imagen4)

	const imagen42 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/4.3.webp";
	const texto42 = [
		`Selecciona tu método de entrega preferido:`,
		``,
		`🚚 *Entrega a domicilio*: Si estás en la ciudad La Paz, indícanos tu dirección y ubicación.`,
		`🏬 *Retiro en tienda*: Agenda fecha y hora para recoger tus productos en nuestra tienda física.`,
	].join('\n');
	await imgFacebook(contactId, texto42, imagen42)

	const imagen5 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/5.webp";
	const texto5 = [
		`Selecciona tu método de pago: 🏧`,
		``,
		`💰 Pago contra entrega (Solo Retiro en tienda)`,
		`📲 Pago con QR`,
		`🏦 Pago con transferencia`,
		`💳 Pago con tarjeta`,
	].join('\n');
	await imgFacebook(contactId, texto5, imagen5)

	const imagen6 = "https://multilaptops.net/recursos/imagenes/tiendaonline/procesocompra-2/6.webp";
	const texto6 = [
		`¡Listo! Al finalizar tu compra, generaremos la orden de entrega con los datos proporcionados. `,
		``,
		`Un asesor de ventas se pondrá en contacto contigo para coordinar la entrega. 📦🤝`,
	].join('\n');
	await imgFacebook(contactId, texto6, imagen6)
}

async function reenviarFormasPago(contactId, isReflow = false) {
	const contact = isReflow ? `591${contactId}@c.us` : contactId;

	await mensajeFacebook(contact, [
		`*¿Como pagar en Multilaptops?* 🛒💻`,
		`Puedes realizar el pago de tus compras con 💳 diferentes medios y combinarlos en caso de que lo requieras 🛍️ `,
	].join('\n'));

	const imagen1 = "https://multilaptops.net/recursos/imagenes/tiendaonline/formaspago-2/1.jpg";
	const texto1 = [
		``,
		`*Transferencia bancaria:*`,
		`▸ Seleccionando este medio de pago se desplegará toda la información con las cuentas habilitadas.`,
		`▸ Una vez realizado la transferencia, debe subir el comprobante de pago.`,
	].join('\n');
	await imgFacebook(contactId, texto1, imagen1);

	const imagen2 = "https://multilaptops.net/recursos/imagenes/tiendaonline/formaspago-2/2.jpg";
	const texto2 = [
		``,
		`*Tarjeta de débito/crédito:* `,
		`▸ Para realizar el pago mediante este medio debe tener habilitado su tarjeta para compras por internet y configurar los parámetros de importe máximo en la aplicación de su banco.`,
		`▸ Utilizar este método de pago aplica un cargo adicional del 2% sobre el valor total.`,
	].join('\n');
	await imgFacebook(contactId, texto2, imagen2);

	const imagen3 = "https://multilaptops.net/recursos/imagenes/tiendaonline/formaspago-2/3.jpg";
	const texto3 = [
		``,
		`*QR:* `,
		`▸ Paga con QR de forma fácil y rápida`,
	].join('\n');
	await imgFacebook(contactId, texto3, imagen3);

	const imagen4 = "https://multilaptops.net/recursos/imagenes/tiendaonline/formaspago-2/4.jpg"
	const texto4 = [
		``,
		`*Efectivo:*`,
		`▸ Los pagos en efectivo se realizan de forma presencial al momento de entrega del pedido en su domicilio o del retiro en tienda de acuerdo a lo programado.`,
		`▸ Puede pagar en las siguientes monedas: dólares americanos USD, moneda nacional Bolivianos BOB.`,
	].join('\n');
	await imgFacebook(contactId, imagen4, texto4);

	await mensajeFacebook(contactId, `Si tienes cualquier consulta, ¡estamos a tu disposición para ayudarte!`);
}

async function asistenteGPT(contactId, isReflow = false, message) {

	var mensaje = message.text.body;
	const contact = isReflow ? `591${contactId}@c.us` : contactId;
	
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const productos = [
		{
			"sku": "100355",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "0",
			"precio": "Bs. 15600.00",
			"pantalla": "16\" AMOLED 3K",
			"procesador": "Intel Core i7-13700H 5 Ghz 13va Gen. 14-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 1 TB"
		},
		{
			"sku": "100354",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "1",
			"precio": "Bs. 10620.00",
			"pantalla": "16\" AMOLED 3K",
			"procesador": "Intel Core i7-1360P 5 Ghz 13va Gen. 12-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100353",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "2",
			"precio": "Bs. 9400.00",
			"pantalla": "15,6\" AMOLED FULLHD Touchscreen",
			"procesador": "Intel Core i7-1360P 5 Ghz 13va Gen. 12-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100352",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "5",
			"precio": "Bs. 5350.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i5-1335U 4,60 Ghz 13va Gen. 10-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100279",
			"marcas": "Samsung",
			"ram": "8GB a 2666 Mhz",
			"cantidad": "1",
			"precio": "Bs. 3300.00",
			"pantalla": "15,6\" LED FULLHD",
			"procesador": "Intel Core i3-1115G4 4,1Ghz Dual-core",
			"UnidaEstadoSolidoSSD": "SSD M2 256 GB"
		},
		{
			"sku": "100278",
			"marcas": "Samsung",
			"ram": "8GB a 3200 Mhz",
			"cantidad": "14",
			"precio": "Bs. 3400.00",
			"pantalla": "15,6\" LED FULLHD",
			"procesador": "Intel Core i3-1115G4 4,1Ghz Dual-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100246",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "2",
			"precio": "Bs. 11600.00",
			"pantalla": "13.3\" FHD AMOLED Display (1920 x 1080) con micro bordes Touch Screen Panel",
			"procesador": "Intel Core i7-1260P 4,70 Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100214",
			"marcas": "Samsung",
			"ram": "16GB a 6400 Mhz de velocidad, LPDDR5",
			"cantidad": "3",
			"precio": "Bs. 10800.00",
			"pantalla": "13.3\" FHD AMOLED Display (1920 x 1080) con micro bordes Touch Screen Panel",
			"procesador": "Intel Core i7-1260P 4,70 Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100213",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "3",
			"precio": "Bs. 10890.00",
			"pantalla": "15,6\" AMOLED FULLHD",
			"procesador": "Intel Core i7-1260P 4,70 Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100208",
			"marcas": "Samsung",
			"ram": "8GB a 5200 Mhz de velocidad, LPDDR5",
			"cantidad": "1",
			"precio": "Bs. 8470.00",
			"pantalla": "13,3\" AMOLED FULLHD",
			"procesador": "Intel Core i5-1240P 4,40Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD M2 512 GB"
		},
		{
			"sku": "100207",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "18",
			"precio": "Bs. 6270.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i7-1255U 4,70 Ghz Deca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100206",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "8",
			"precio": "Bs. 5520.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i5-1235U 4,40 Ghz Deca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 256 GB"
		},
		{
			"sku": "100205",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "11",
			"precio": "Bs. 4800.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i5-1235U 4,40 Ghz Deca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		}
	];

	function descripcionDeProductos() {
		return productos.map((producto, index) => `Producto SKU: ${producto.sku}: ${producto.marcas}, RAM: ${producto.ram}, Precio: ${producto.precio}, Pantalla: ${producto.pantalla}, Procesador: ${producto.procesador}, Almacenamiento: ${producto.UnidaEstadoSolidoSSD}`).join('\n');
	}

	async function chatConUsuario(mensajeDelUsuario) {

		const mensajeInicial = [
			{ role: "system", content: `Eres un vendedor de laptops samsung, solo vende estos disponibles:\n${descripcionDeProductos()}\nProporciona varios modelos.` },
			{ role: "user", content: mensajeDelUsuario }
		];
		
		try {
			const completion = await openai.chat.completions.create({
				messages: mensajeInicial,
				model: 'gpt-3.5-turbo',
			});

			let respuesta = completion.choices[0].message['content'];
			let contexto;
			if (respuesta.includes('Producto SKU')) {
				contexto = 'producto';
			} else {
				contexto = 'chat';
			}

			return {
				respuesta: respuesta,
				contexto: contexto
			};
		} catch (error) {
			console.error("Ocurrió un error al realizar la petición:", error);
		}
	}

	let responseOpenAI = await chatConUsuario(mensaje)

	var parrafos = responseOpenAI.respuesta.split('\n\n');

	parrafos = parrafos.map(parrafo => {
		parrafo = parrafo.replace(/(RAM:)/g, '*$1*');
		parrafo = parrafo.replace(/(Pantalla:)/g, '*$1*');
		parrafo = parrafo.replace(/(Procesador:)/g, '*$1*');
		parrafo = parrafo.replace(/(Almacenamiento:)/g, '*$1*');
		parrafo = parrafo.replace(/(Precio:)/g, '*$1*');
		parrafo = parrafo.replace(/(Producto SKU:)/g, '*$1*');
		return parrafo;
	});

	for(let index = 0; index < parrafos.length; index++) {
        let parrafo = parrafos[index];

		console.log(`Párrafo ${index + 1}: ${parrafo}`);
        
        if (parrafo.includes("SKU")) {
			let skuMatch = parrafo.match(/(1\d{5})/);
            if (skuMatch) {
                let skuNumber = skuMatch[1];
                await productoFacebook(contact, skuNumber, 'Multilaptops', 'Ver producto');
            }
        } else {
			await mensajeFacebook(contact, parrafo);
        }
    }

	// for (var i = 0; i < parrafos.length; i++) {
	// 	var parrafo = parrafos[i];
	// 	//var skuMatch = parrafo.match(/\b\d{6}\b/); // Usar una expresión regular para encontrar el SKU
	// 	//var sku = skuMatch ? skuMatch[0] : 'No encontrado'; // Si se encuentra el SKU, usarlo, si no, poner 'No encontrado'

	// 	var resultado = parrafo.match(/\b\d{6}\b/);
	// 	if (resultado) {
	// 		var numero = resultado[0];
	// 		console.log('Número de 6 dígitos 00000000:', numero); // Salida: Número de 6 dígitos: 100206
	// 		await productoFacebook(contact, numero, 'Multilaptops', 'Ver mas detalle')
	// 		await mensajeFacebook(contact, parrafo);
	// 	} else {
	// 		await mensajeFacebook(contact, parrafo);
	// 		console.log('Número de 6 dígitos no encontrado');
	// 	}


	// 	// if (sku === 'No encontrado') {
	// 	// 	await mensajeFacebook(contact, parrafo);
	// 	// } else {
	// 	// 	await productoFacebook(contact, sku, 'Multilaptops', 'Ver mas detalle')
	// 	// 	await mensajeFacebook(contact, parrafo);
	// 	// }

	// 	console.log('Párrafo:', parrafo);
	// 	//console.log('SKU:', sku);
	// }

}

async function asistenteGPTxxx(mensaje, isReflow = false, contact, message) {

	console.log(message)
	const openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});
	const productos = [
		{
			"sku": "100355",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "0",
			"precio": "15600.00",
			"pantalla": "16\" AMOLED 3K",
			"procesador": "Intel Core i7-13700H 5 Ghz 13va Gen. 14-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 1 TB"
		},
		{
			"sku": "100354",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "1",
			"precio": "10620.00",
			"pantalla": "16\" AMOLED 3K",
			"procesador": "Intel Core i7-1360P 5 Ghz 13va Gen. 12-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100353",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "2",
			"precio": "9400.00",
			"pantalla": "15,6\" AMOLED FULLHD Touchscreen",
			"procesador": "Intel Core i7-1360P 5 Ghz 13va Gen. 12-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100352",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "5",
			"precio": "5350.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i5-1335U 4,60 Ghz 13va Gen. 10-cores",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100324",
			"marcas": "Samsung",
			"cantidad": "1",
			"precio": "6930.00"
		},
		{
			"sku": "100279",
			"marcas": "Samsung",
			"ram": "8GB a 2666 Mhz",
			"cantidad": "1",
			"precio": "3300.00",
			"pantalla": "15,6\" LED FULLHD",
			"procesador": "Intel Core i3-1115G4 4,1Ghz Dual-core",
			"UnidaEstadoSolidoSSD": "SSD M2 256 GB"
		},
		{
			"sku": "100278",
			"marcas": "Samsung",
			"ram": "8GB a 3200 Mhz",
			"cantidad": "14",
			"precio": "3400.00",
			"pantalla": "15,6\" LED FULLHD",
			"procesador": "Intel Core i3-1115G4 4,1Ghz Dual-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100246",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "2",
			"precio": "11600.00",
			"pantalla": "13.3\" FHD AMOLED Display (1920 x 1080) con micro bordes Touch Screen Panel",
			"procesador": "Intel Core i7-1260P 4,70 Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100214",
			"marcas": "Samsung",
			"ram": "16GB a 6400 Mhz de velocidad, LPDDR5",
			"cantidad": "3",
			"precio": "10800.00",
			"pantalla": "13.3\" FHD AMOLED Display (1920 x 1080) con micro bordes Touch Screen Panel",
			"procesador": "Intel Core i7-1260P 4,70 Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100213",
			"marcas": "Samsung",
			"ram": "16GB a 5200 Mhz",
			"cantidad": "3",
			"precio": "10890.00",
			"pantalla": "15,6\" AMOLED FULLHD",
			"procesador": "Intel Core i7-1260P 4,70 Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100208",
			"marcas": "Samsung",
			"ram": "8GB a 5200 Mhz de velocidad, LPDDR5",
			"cantidad": "1",
			"precio": "8470.00",
			"pantalla": "13,3\" AMOLED FULLHD",
			"procesador": "Intel Core i5-1240P 4,40Ghz Dodeca-core",
			"UnidaEstadoSolidoSSD": "SSD M2 512 GB"
		},
		{
			"sku": "100207",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "18",
			"precio": "6270.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i7-1255U 4,70 Ghz Deca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		},
		{
			"sku": "100206",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "8",
			"precio": "5520.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i5-1235U 4,40 Ghz Deca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 256 GB"
		},
		{
			"sku": "100205",
			"marcas": "Samsung",
			"ram": "8GB a 4267 Mhz",
			"cantidad": "11",
			"precio": "4800.00",
			"pantalla": "15,6\" LED FULLHD IPS",
			"procesador": "Intel Core i5-1235U 4,40 Ghz Deca-core",
			"UnidaEstadoSolidoSSD": "SSD NVME 512 GB"
		}
	];

	function descripcionDeProductos() {
		return productos.map((producto, index) => `Producto con codigo SKU: ${producto.sku}: ${producto.marcas}, RAM: ${producto.ram}, Precio: ${producto.precio}, Pantalla: ${producto.pantalla}, Procesador: ${producto.procesador}, Unidad Estado Sólido: ${producto.UnidaEstadoSolidoSSD}`).join('\n');
	}

	async function chatConUsuario(mensajeDelUsuario) {
		//console.log('entro', mensajeDelUsuario)
		const mensajeInicial = [
			{ role: "system", content: `Eres un asistente de ventas de laptops. Estos son los productos disponibles:\n${descripcionDeProductos()}\nPuedes proporcionar información detallada y ayudar con la compra.` },
			{ role: "user", content: mensajeDelUsuario }
		];

		try {
			const completion = await openai.chat.completions.create({
				messages: mensajeInicial,
				model: 'gpt-3.5-turbo',
			});

			return completion.choices[0].message['content'];
		} catch (error) {
			console.error("Ocurrió un error al realizar la petición:", error);
		}
	}
	/////////////////////////////////////////////////////////////////////
	let res = await chatConUsuario(mensaje)
	//////////poner //////////////
	var parrafos = res.split('\n\n'); // Separar por dos saltos de línea

	for (var i = 0; i < parrafos.length; i++) {
		var parrafo = parrafos[i];
		//var skuMatch = parrafo.match(/\b\d{6}\b/); // Usar una expresión regular para encontrar el SKU
		//var sku = skuMatch ? skuMatch[0] : 'No encontrado'; // Si se encuentra el SKU, usarlo, si no, poner 'No encontrado'

		var resultado = parrafo.match(/\b\d{6}\b/);
		if (resultado) {
			var numero = resultado[0];
			console.log('Número de 6 dígitos 00000000:', numero); // Salida: Número de 6 dígitos: 100206
			await productoFacebook(contact, numero, 'Multilaptops', 'Ver mas detalle')
			await mensajeFacebook(contact, parrafo);
		} else {
			await mensajeFacebook(contact, parrafo);
			console.log('Número de 6 dígitos no encontrado');
		}


		// if (sku === 'No encontrado') {
		// 	await mensajeFacebook(contact, parrafo);
		// } else {
		// 	await productoFacebook(contact, sku, 'Multilaptops', 'Ver mas detalle')
		// 	await mensajeFacebook(contact, parrafo);
		// }

		console.log('Párrafo:', parrafo);
		//console.log('SKU:', sku);
	}


	await reaccionFacebook(contact, message.id, "\u2705")
	//////////////////////////////

	//funcionan esto

	//	await mensajeFacebook(contact, res);

	//	await productoFacebook(contact, "100354", 'Multilaptops', 'datos de pc')
	/////////////////////////////////////////////////////////////////////
	// try {
	// 	const completion = await openai.chat.completions.create({
	// 		messages: [{ "role": 'user', "content": mensaje }],
	// 		model: 'gpt-3.5-turbo',
	// 	});
	// 	console.log(completion.choices[0].message['content'])
	// 	let res = completion.choices[0].message['content']
	// 	console.log(res)
	// 	await mensajeFacebook(contact, res);
	// 	console.log(completion.choices[0].message['content']);
	// } catch (error) {
	// 	console.error("Ocurrió un error al realizar la petición:", error);
	// 	appendFile('error-log.txt', `Error en ${new Date()}: ${error}\n`, (err) => {
	// 		if (err) console.error("Error al escribir en el archivo de registro:", err);
	// 	});
	// }
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

async function guardarEnFirebase(data) {
	const date = new Date();  // Ejemplo de fecha
    const timestamp = date.getTime();
	try {
		if (data.text) {
			console.log("La respuesta es de tipo texto.");
			await set(ref(db, `chat/${data.from}/${timestamp}/`), data);
			
		} else if (data.image) {
			console.log("La respuesta es de tipo imagen.");

			const respuesta = await obtenerDescargarImagen(data)
			await set(ref(db, `chat/${data.from}/${timestamp}/`), respuesta);

		} else {
			console.log("La respuesta es de otro tipo.");
		}

		console.log('Datos guardados exitosamente.');		
	} catch (error) {
		console.error('Error al guardar los datos:', error);
	}
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

	socket.on('mensaje',(data)=>{
		console.log(data)
		mensajes = data;

		mensajeFacebook(data.numero, data.mensaje);
	})

});

app.use(express.static("public"));


export default server;
// Hola mundo
// git add .
// git commit -m "16/08/23 : 16:20"
// git push origin master

// git pull origin master
//HOMA MUNDO CRUEL
// pedrogit 
