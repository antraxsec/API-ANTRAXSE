import express from "express";
import axios from 'axios';
import cors from "cors";
import { config } from 'dotenv';
import fs from 'fs';
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
import { db, gcsBucket, uploadFile } from '../src/firebase.js'

import { appendFile } from 'fs';
import {
	OPENAI_API_KEY,
} from "./config.js";
import { WHATSAPP_API_KEY } from "./config.js";
import {
	mensajeFacebook,
	productoFacebook,
	ubicacionFacebook,
	bottonesFacebook,
	imgFacebook,
	reaccionFacebook,
	menuListaFacebook,
	obtenerDescargarImagen,
	enviarContacto,
	catalogoSeccionFacebook,
	audioFacebook,
} from "./funciones.js";

import {
	menuListaCatalogo,
	nivelCatalogo,
	reenviarCatalogoSamsung,
	MandarPorSKU,
} from "./catalogo/catalogo.js";
import { menuLista } from "./menu/menu.js";
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: { origin: "*", methods: ["GET", "POST"] },
});
const historialAnalisis = new Map(); //Guarda el contexto de openai en analisis
const historialAsistente = new Map();
const chatStates = new Map();

// const corsOption={
// 	origin:"http://localhost:3000",
// 	credentials:true
// }

app.use(cors());
app.use(express.json());
app.use(requestCounterMiddleware(io));
app.use(indexRouter);
app.use("/api", items);

app.post("/webhook", (req, res) => {
	//resive el webhook de stripe watsapi
	console.log(req.body);
});

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
	try {
		const { entry } = request.body;

		if (!entry || !Array.isArray(entry) || entry.length === 0) {
			console.warn("Solicitud no válida: ", request.body);
			return response.sendStatus(400);
		}

		const { changes } = entry?.[0] || {};
		const { value } = changes?.[0] || {};
		const { messages, statuses, contacts } = value || {};
		const messageDetails = messages?.[0];
		const statusDetails = statuses?.[0];
		console.log("MAS DATOS", changes);
		console.log("MAS DATOS metadata", statuses);
		console.log("MAS DATOS contacs", contacts);
		console.log("MAS DATOS messge", messages);
		// Ahora puedes manejar los mensajes y los estados por separado
		if (messageDetails) {
			const chatId = messageDetails?.from;
			console.log("DETALLES:: ", chatId, messageDetails);
			procesarMensajeEntrante(chatId, messageDetails);
			guardarEnFirebase(messageDetails);
			response.sendStatus(200);
		}
	} catch (error) {
		console.error(error);
		response.sendStatus(500);
	}
});

const ESTADOS = {
	INICIAL: "initial",
	MENU: "menu",
	ASISTENTE: "asistente",
	ADMIN: "admin",
	PROMO1: "reenviarPromocion",
	UBICACION: "reenviarUbicacion",
	FORMAENTREGA: "formaEntrega",
	RETIROTIENDA: "retiroTienda",
	RETIROPROGRAMA: "retiroTiendaPrograma",
	ENTREGADOMICILIO: "entregaDomicilio",
	ENTREGAPROGRAMA: "entregaDomicilioPrograma",
	ENVIONACIONAL: "envioNacional",
	ENVIONACIONALPROGRAMA: "envioNacionalPrograma",
	MENUCATALOGO: "menuCatalogo",
	CATALOGOSAMSUNG: "catalogoSamsung",
};

function obtenerEstadoActual(chatId) {
	if (!chatStates.has(chatId)) {
		chatStates.set(chatId, ESTADOS.INICIAL);
	}
	return chatStates.get(chatId);
}
export async function nivelInicial(chatId, message, numero, tipo) {
	const compararPalabrasClave = (mensajeTexto, palabrasClave) => {
		return palabrasClave.some(
			(phrase) =>
				mensajeTexto.toLowerCase().indexOf(phrase.toLowerCase()) !== -1
		);
	};

	const palabrasClave = ["admin2", "admin"];
	if (tipo === "text") {
		const mensajeTexto = message.text.body;

		if (compararPalabrasClave(mensajeTexto, palabrasClave)) {
			const texto = [
				"Contamos con una amplia variedad de laptops de última generación para todo tipo de uso.",
				"",
				"Somos una tienda autorizada por *Samsung Bolivia*. Todos nuestros productos son originales y cuentan con la garantía del fabricante.",
				"",
				"Comprar con nosotros es rápido y sencillo. Puedes hacerlo desde nuestra tienda online o en cualquiera de nuestras tiendas virtuales.",
			];
			await mensajeFacebook(numero, `¡Hola! 🤗 Bienvenido a *Multilaptops*`);
			await mensajeFacebook(numero, texto.join("\n"));
			// await audioFacebook(numero)
			await menuLista(numero);
			chatStates.set(chatId, "menu");
		}
		//nuevo dos
		else {
			// const response = message;
		}
	}
}
async function procesarMensajeEntrante(chatId, message) {
	const estadoActual = obtenerEstadoActual(chatId); // Ahora puedes obtener el estado actual
	console.log("estado Actual::", estadoActual);
	const tipo = message.type;
	const numero = message.from;

	switch (estadoActual) {
		case ESTADOS.INICIAL:
			await nivelInicial(chatId, message, numero, tipo);
			break;
		case ESTADOS.MENU:
			nivelMenu(chatId, message, numero, tipo);
			break;
			// case ESTADOS.ADMIN:
			//   nivelAdmin(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.PROMO1:
			//   if (validarNumerocelular(message.text.body)) {
			//     await promocionFlow(message.text.body, true);
			//   } else if (message.text.body === "1") {
			//     chatStates.set(chatId, "admin");
			//     //chatStates.set(chatId, "initial"); new
			//     await adminFlow(numero);
			//   } else {
			//     mensajeFacebook(
			//       numero,
			//       [`Ingresa un número de celular válido.`, `1️⃣ Salir.`].join("\n")
			//     );
			//     chatStates.set(chatId, "reenviarPromocion");
			//   }

			//   break;
			// case ESTADOS.UBICACION:
			//   if (validarNumerocelular(message.text.body)) {
			//     await reenviarUbicacion(message.text.body, true);
			//   } else if (message.text.body === "1") {
			//     chatStates.set(chatId, "admin");
			//     await adminFlow(numero);
			//   } else {
			//     mensajeFacebook(
			//       numero,
			//       [`Ingresa un número de celular válido.`, `1️⃣ Salir.`].join("\n")
			//     );
			//     chatStates.set(chatId, "reenviarUbicacion");
			//   }
			//   break;
			// case ESTADOS.ASISTENTE:
			//   if (message.text.body.trim() !== "") {
			//     if (message.text.body === "1") {
			//       chatStates.set(chatId, "menu");
			//       await adminFlow(numero);
			//     } else {
			//       mensajeFacebook(numero, "Estamos en el nivel del asistente");
			//       asistenteGPT(numero, false, message);
			//     }
			//   } else {
			//     console.log("Algún error raro");
			//   }
			//   break;
			// case ESTADOS.FORMAENTREGA:
			//   nivelFormaEntrega(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.RETIROTIENDA:
			//   nivelRetiroTienda(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.RETIROPROGRAMA:
			//   nivelRetiroTiendaPrograma(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.ENTREGADOMICILIO:
			//   nivelEntregaDomicilio(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.ENTREGAPROGRAMA:
			//   nivelEntregaDomicilioPrograma(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.ENVIONACIONAL:
			//   nivelEnvioNacional(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.ENVIONACIONALPROGRAMA:
			//   nivelEnvioNacionalPrograma(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.MENUCATALOGO:
			//   nivelCatalogo(chatId, message, numero, tipo);
			//   break;
			// case ESTADOS.CATALOGOSAMSUNG:
			// nivelCatalogo(chatId, message, numero, tipo)
			break;
		default:
			console.log("Estado no reconocido");
			break;
	}
}

async function guardarEnFirebase(data) {
	const date = new Date(); // Ejemplo de fecha
	const timestamp = date.getTime();
	try {
		if (data.text) {
			console.log("La respuesta es de tipo texto.");
			await set(ref(db, `chat/${data.from}/${timestamp}/`), data);
		} else if (data.image) {
			console.log("La respuesta es de tipo imagen.");

			const respuesta = await obtenerDescargarImagen(data);
			await set(ref(db, `chat/${data.from}/${timestamp}/`), respuesta);
		} else {
			console.log("La respuesta es de otro tipo.");
		}

		console.log("Datos guardados exitosamente.");
	} catch (error) {
		console.error("Error al guardar los datos:", error);
	}
}

app.use("/whatsapp", whatsapps);

let dataTracking = [];
let dataUsuarios = [];

io.on("connection", (socket) => {
	console.log("Petición LIVE al servidor:", socket.id);

	socket.on("userTracer", (data) => {
		socket.id = data.id_sesion + "_" + socket.id;

		// let existeSesion = dataUsuarios.some((item) => item.id === socket.id);
		// if (existeSesion) {
		// 	console.log('Esta sesion ya existe, continua');
		// }
		// else{
		let usuario = {};
		usuario.id = socket.id;
		dataUsuarios.push(usuario);
		console.log("Usuarios actualizados:", dataUsuarios);

		data.id_socket = socket.id;
		dataTracking.push(data);
		// }

		io.emit("usuarioId", socket.id);
		io.emit("usuariosConectados", dataUsuarios, dataUsuarios.length);
		io.emit("serverTracer", dataTracking);
	});

	socket.on("disconnect", () => {
		console.log("Petición LIVE finalizada:", socket.id);
		dataUsuarios = dataUsuarios.filter((item) => item.id !== socket.id);

		io.emit("usuariosConectados", dataUsuarios, dataUsuarios.length);
		console.log("Usuarios actualizados:", dataUsuarios);

		dataTracking = dataTracking.filter((item) => item.id_socket !== socket.id);
		// console.log('------------------------1');
		// console.log(dataTracking)
		// console.log('------------------------2');
		io.emit("serverTracer", dataTracking);
	});

	socket.on("mensaje", (data) => {
		console.log(data);
		// mensajes = data;

		mensajeFacebook(data.numero, data.mensaje);
	});

	socket.on("skus", (data) => {
		console.log(data);
		// mensajes = data;
		MandarPorSKU(data);
		//mensajeFacebook(data.numero, data.mensaje);
	});

	socket.on("accionButton", (data) => {
		console.log("hardyyy", data);
		console.log(data.numero);
		console.log(data.type);
		if (data.type === "ubicacion") {
			reenviarUbicacion(data.numero, false);
		} else if (data.type === "promocion") {
			promocionFlow(data.numero, false);
		} else if (data.type === "asistente") {
			asistenteGPT(data.numero, false, "Hola");
		}
	});
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
// holla