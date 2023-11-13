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
import { getDatabase, ref, push, set } from "firebase/database";
import { db, gcsBucket, uploadFile } from "../src/firebase.js";

import { appendFile } from "fs";
import { OPENAI_API_KEY } from "./config.js";
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
  recuperarCatalogo,
} from "./funciones.js";

import {
  menuListaCatalogo,
  nivelCatalogo,
  reenviarCatalogoSamsung,
  MandarPorSKU,
  MandarImg,
} from "./catalogo/catalogo.js";
import { menuLista, nivelMenu } from "./menu/menu.js";
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
/**
 * webhoock para chatracer
 * leer todo los mensajes de hay
 */
// app.get("/webhookChatrace", function (req, res) {
//   if (
//     req.query["hub.mode"] == "subscribe" &&
//     req.query["hub.verify_token"] == "david"
//   ) {
//     res.send(req.query["hub.challenge"]);
//   } else {
//     res.sendStatus(400);
//   }
// });
// app.post("/webhookChatrace", async function (request, response) {
//   try {
//     //console.log("webHookChatracer - Received data:", request.body); // Esto imprimirá los datos recibidos en la consola

//     // Aquí puedes hacer algo con los datos recibidos
//     // Por ejemplo, si estás esperando datos JSON, puedes acceder a ellos así:
//     const data = request.body;
//     // Haz algo con 'data' aquí

//     response.status(200).send("Datos recibidos"); // Envía una respuesta de éxito
//   } catch (error) {
//     console.error(error);
//     response.sendStatus(500); // Envía una respuesta de error si hay una excepción
//   }
// });

/**
 * esto es la api de whatsapp webhook
 */
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
      // console.log("DETALLES:: ", chatId, messageDetails);
      procesarMensajeEntrante(chatId, messageDetails);
      await guardarMensajeEnFirebase(messageDetails, null, contacts);
    }
    response.sendStatus(200);
  } catch (error) {
    console.error(error);
    response.sendStatus(500);
  }
});

/**
 * estado para elbot
 */
const ESTADOS = {
  INICIAL: "INICIAL",
  MENU: "MENU",
};

function obtenerEstadoActual(chatId) {
  if (!chatStates.has(chatId)) {
    chatStates.set(chatId, ESTADOS.INICIAL);
  }
  return chatStates.get(chatId);
}

async function procesarMensajeEntrante(chatId, message) {
  const estadoActual = obtenerEstadoActual(chatId); // Ahora puedes obtener el estado actual
  console.log("estado Actual::", estadoActual);
  const tipo = message.type;
  const numero = message.from;

  switch (estadoActual) {
    case ESTADOS.INICIAL:
      let estado = await nivelInicial(message, numero, tipo);
      chatStates.set(chatId, estado);
      break;
    case ESTADOS.MENU:
      nivelMenu(message, numero, tipo);
      break;
    default:
      console.log("Estado no reconocido");
      break;
  }
}
/**
 * Nivel Inicial del bot
 */
export async function nivelInicial(message, numero, tipo) {
  const palabrasClave = ["admin2", "admin"];
  const compararPalabrasClave = (mensajeTexto, palabrasClave) => {
    return palabrasClave.some(
      (phrase) =>
        mensajeTexto.toLowerCase().indexOf(phrase.toLowerCase()) !== -1
    );
  };
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
      //mandar catalogo
      // await recuperarCatalogo("1418912658860290");
    }
    //nuevo dos
    else {
      // const response = message;
    }
  }
  return "MENU";
}

/**
 * Paraguadar mensajes a Firebase
 * para poder grafical al fron
 */
async function guardarMensajeEnFirebase(data, fromServer, contacts) {
  // console.log("hora", data);
  // console.log("data data data", data);

  let messageImage;
  if (data.type === "image") {
    messageImage = await obtenerDescargarImagen(data);
    if (!messageImage.image.url) {
      console.error("No se pudo obtener la URL de la imagen.");
      // Maneja este error de acuerdo a tu lógica de negocio.
    }
  }

  const timestamp = data.timestamp || Date.now();
  let fromId, toId;

  try {
    if (contacts?.length) {
      // Mensaje entrante
      fromId = data.from; // El emisor es el contacto
      toId = "59160560700"; // El receptor es tu sistema
    } else {
      // Mensaje saliente
      fromId = "59160560700"; // El emisor es tu sistema
      toId = data.to; // El receptor es el contacto
    }

    if (!fromId || !toId) {
      throw new Error("No se pudo determinar los IDs del emisor o receptor");
    }

    // Asegúrate de que los IDs del emisor y receptor están en orden alfabético
    const chatIds = [fromId, toId].sort();
    const chatPath = `chat/${chatIds[0]}_${chatIds[1]}`;
    const chatRef = ref(db, chatPath);

    // Prepara los datos del mensaje
    let messageData = {
      id: data.id || fromServer?.data?.messages?.[0]?.id,
      timestamp,
      type: data.type,
      from: fromId,
      to: toId,
      ...(data.text && { text: data.text.body }), // Agrega texto si existe
      // Si es un mensaje de imagen, maneja la descarga de la imagen
      ...(data.type === "image" && data.image && { image: messageImage }),
      ...(data.type === "interactive" && { interactive: data.interactive }), //Si es botones
    };
    console.log("entrante whatsappAPI", messageData);
    // Guarda el mensaje en la base de datos de Firebase
    await set(push(chatRef), messageData);

    // Actualiza la información del contacto si es un mensaje entrante
    if (contacts?.length) {
      for (const contact of contacts) {
        const contactoRef = ref(db, `contacts/${contact.wa_id}`);
        await set(contactoRef, {
          name: contact.profile.name,
          wa_id: contact.wa_id,
          last_message_timestamp: timestamp,
        });
      }
    }

    console.log("Mensaje guardado exitosamente en Firebase.");
  } catch (error) {
    console.error("Error al guardar el mensaje:", error);
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
  socket.on("urls", (data) => {
    //console.log(data);
    // mensajes = data;
    MandarImg(data);
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