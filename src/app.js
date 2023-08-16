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
app.post("/webhookwhatsapp", async function (request, response) {
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
			await mensajeFacebook("59168249790", mensaje);
			if (mensaje === 'Dos') {

				const dia = obtenerDiaActual();
				await mensajeFacebook(numero, `¡Hola! Puedes encontrar todos los detalles y realizar la compra de la Samsung Galaxy Book en nuestra tienda 👉 multi.bz/samsung 🛒💻.`);
				await mensajeFacebook(numero, `Si realizas tu compra, pedido o reserva hoy, ${dia}, puedes retirarlo en nuestra tienda física desde las 11:00 a 19:00 o solicitar el envío a donde estés.`);
				await mensajeFacebook(numero, `Te dejo algunos modelos de nuestros productos más demandados. Si deseas ver los precios actualizados, simplemente haz clic en el enlace proporcionado.`);
				//producto 1
				const productoTexto1 = [
					`*Código SKU:* 100279`,
					`*Procesador:* Intel Core i3 a 4,1Ghz de 11a. Gen.`,
					`*Memoria RAM:* 8GB a 2666 Mhz`,
					`*Almacenamiento:* SSD NVME 256 GB`,
					`*Pantalla:* 15,6" LED FULLHD (1920 x 1080)`,
					`*Gráficos:* UHD Intel Core`,
					`-----------------------------------`,
					`*(Bs. 3300) Ver precio actualizado 👉* https://multilaptops.net/producto/100279`,
					`-----------------------------------`,
				].join('\n');
				await productoFacebook(numero, "100279", productoTexto1, "Equipo de ventas Multilaptops.")
				//producto 2
				const productoTexto2 = [
					`*Código SKU:* 100352`,
					`*Procesador:* Intel Core i5 a 4,6Ghz  de 13a. Gen.`,
					`*Memoria RAM:* 8GB a 4267 Mhz`,
					`*Almacenamiento:* SSD NVME 512 GB`,
					`*Pantalla:* 15,6" LED FULLHD IPS (1920 x 1080)`,
					`*Gráficos:* Intel® Iris® Xᵉ Graphics`,
					`-----------------------------------`,
					`*(Bs. 5350) Ver precio actualizado 👉* https://multilaptops.net/producto/100352`,
					`-----------------------------------`,
					`Compra durante esta campaña y Samsung Bolivia te regala un *SSD NVMe de 1TB*.`,
				].join('\n');
				await productoFacebook(numero, "100352", productoTexto2, "Equipo de ventas Multilaptops")
				//producto 3
				const productoTexto3 = [
					`*Código SKU:* 100353`,
					`*Procesador:* Intel Core i7 a 5Ghz de 13a. Gen.`,
					`*Memoria RAM:* 8GB a 4267 Mhz`,
					`*Almacenamiento:* SSD NVME 512 GB`,
					`*Pantalla:* 15,6 FULLHD AMOLED Touchscreen Convertible`,
					`*Gráficos:* Intel® Iris® Xᵉ Graphics`,
					`-----------------------------------`,
					`*(Bs. 9400) Ver precio actualizado 👉* https://multilaptops.net/producto/100353`,
					`-----------------------------------`,
					`Compra durante esta campaña y Samsung Bolivia te regala un *SSD NVMe de 1TB*.`,
				].join('\n');
				await productoFacebook(numero, "100353", productoTexto3, "Equipo de ventas Multilaptops")
				//producto 4
				const productoTexto4 = [
					`Lo mejor de ASUS, ahora disponible para entrega inmediata.`,
					``,
					`*Código SKU:* 100345`,
					`*Procesador:* Intel Core i9-13980HX a 5,6Ghz de 13a Gen. con 24 núcleos físicos`,
					`*Memoria RAM:* 16GB a 4800 Mhz DDR5`,
					`*Almacenamiento:* SSD 1TB PCIe® 4.0 NVMe™ M.2`,
					`*Pantalla:* 16" LED IPS FHD (1920x1200), actualización de 165Hz`,
					`*Gráficos:* NVIDIA® GeForce RTX™ 4070 (8GB de GDDR6)`,
					`-----------------------------------`,
					`*(Bs. 19890) Ver precio actualizado 👉* https://multilaptops.net/producto/100345`,
					`-----------------------------------`,
				].join('\n');
				await productoFacebook(numero, "100345", productoTexto4, "Equipo de ventas Multilaptops")
				//producto 5
				const productoTexto5 = [
					`Lo esencial en productos HP disponibles para entrega inmediata.`,
					``,
					`*Código SKU:* 100376`,
					`*Procesador:* Intel Celeron N4500 a 2,8Ghz de 11a Gen.`,
					`*Memoria RAM:* 8GB a 2933 Mhz`,
					`*Almacenamiento:* SSD NVME 256 GB`,
					`*Pantalla:* 15,6 LED HD`,
					`*Gráficos:* Intel® UHD Graphics 600`,
					`-----------------------------------`,
					`*(Bs. 2400) Ver precio actualizado 👉* https://multilaptops.net/producto/100376`,
					`-----------------------------------`,
				].join('\n');
				await productoFacebook(numero, "100376", productoTexto5, "Equipo de ventas Multilaptops")
				//letras
				await mensajeFacebook(numero, `Si te interesa uno de nuestros productos, necesitas más información o estás listo para comprar, estoy aquí para ayudarte. Puedo agendarte una llamada, y un asesor de ventas se pondrá en contacto contigo para facilitar todo el proceso.`);
				await mensajeFacebook(numero, `Nos esforzamos por hacer tu experiencia de compra lo más sencilla y cómoda posible. Como empresa moderna y líder en innovación tecnológica, revisa todos nuestros productos en multilaptops.net. ¡No dudes en contactarnos con cualquier pregunta!`);

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
// Hola mundo