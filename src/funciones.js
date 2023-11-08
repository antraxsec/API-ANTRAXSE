import axios from "axios";
import { WHATSAPP_API_KEY } from "./config.js";
import { db, gcsBucket, uploadFile } from "../src/firebase.js";
import { getDatabase, ref, set, onValue } from "firebase/database";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";

export async function productoFacebook(to, id_catalogo, boy_text, footer_text) {
  var message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "interactive",
    interactive: {
      type: "product",
      body: {
        text: boy_text,
      },
      footer: {
        text: footer_text,
      },
      action: {
        catalog_id: "1418912658860290",
        product_retailer_id: id_catalogo,
      },
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  const response = await axios
    .post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    .then((response) => {
      console.log("Mensaje-producto enviado con éxito");
      guardarEnFirebase(message, response);
    })
    .catch((error) => {
      console.log("Error al enviar el productoFacebook: ", error.response);
    });
}

export async function audioFacebook(to) {
  var message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "audio",
    audio: {
      // "id": "your-media-id",
      link: "https://multilaptops.net/recursos/audio/voz_multilaptops.mp3",
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  const response = await axios
    .post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    .then((response) => {
      console.log("Audio enviado con éxito");
      guardarEnFirebase(message, response);
      return true;
    })
    .catch((error) => {
      console.log("Error al enviar el audio: ", error.response);
    });
}

export async function mensajeFacebook(to, textBody) {
  const maxLength = 4096;
  // textBody = textBody.length > maxLength ? textBody.substring(0, maxLength - 3) + "..." : textBody;

  const message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "text",
    text: {
      preview_url: false,
      body: textBody,
    },
  };

  const url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  const token = WHATSAPP_API_KEY;

  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Mensaje-texto enviado con éxito");
    guardarEnFirebase(message, response);
    return response;
  } catch (error) {
    console.log("Error al enviar el mensajeFacebook: ", error.response);
    // throw error;
  }
}

export async function catalogoSeccionFacebook(to, opciones, sections) {
  const message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "interactive",
    interactive: {
      type: "product_list",
      header: {
        type: "text",
        text: opciones.header,
      },
      body: {
        text: opciones.body,
      },
      // "footer": {
      //   "text": "FOOTER_CONTENT"
      // },
      action: {
        catalog_id: "1418912658860290",
        sections: sections,
      },
    },
  };

  const url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  const token = WHATSAPP_API_KEY;

  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Mensaje-catalogo-selección enviado con éxito");
    guardarEnFirebase(message, response);
    return response;
  } catch (error) {
    console.log("Error al enviar el catálogo-selección: ", error.response);
    throw error;
  }
}

export async function reaccionFacebook(to, wamid, emoji) {
  var message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "reaction",
    reaction: {
      message_id: wamid,
      emoji: emoji,
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  return axios
    .post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Mensaje enviado con éxito");
    })
    .catch((error) => {
      console.log("Error al enviar el reacción: ", error.response);
    });
}

export async function imgFacebook(to, textBody, imgurl) {
  const message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "image",
    image: {
      link: imgurl,
      caption: textBody,
    },
  };

  const url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  const token = WHATSAPP_API_KEY;

  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Mensaje-texto enviado con éxito");
    guardarEnFirebase(message, response);
    return response;
  } catch (error) {
    console.log("Error al enviar el img: ", error);
    throw error;
  }
}

export async function enviarContacto(to, name, phone_number) {
  const message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "contacts",
    contacts: [
      {
        addresses: [
          {
            city: "La Paz",
            country: "Bolivia",
            country_code: "BO",
            street: "Sucursal Multilaptops, Calle Uyustus #990",
            type: "WORK",
          },
        ],
        emails: [
          {
            email: "ventas@multilaptops.net",
            type: "WORK",
          },
        ],
        name: {
          first_name: "Multilaptops",
          formatted_name: "Multilaptops",
        },
        org: {
          company: "Multilaptops",
          department: "Ventas",
          title: "Ventas",
        },
        phones: [
          {
            phone: "59168249790",
            type: "WORK",
          },
        ],
        urls: [
          {
            url: "https://multilaptops.net",
            type: "WORK",
          },
        ],
      },
    ],
  };

  const url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  const token = WHATSAPP_API_KEY;

  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Mensaje-contacto enviado con éxito");
  } catch (error) {
    console.log("Error al enviar el contacto: ", error);
  }
}

export async function ubicacionFacebook(
  to,
  longitude,
  latitude,
  name,
  address
) {
  var message = {
    messaging_product: "whatsapp",
    to: to,
    type: "location",
    location: {
      longitude: longitude,
      latitude: latitude,
      name: name,
      address: address,
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  const response = await axios
    .post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    .then((response) => {
      console.log("Mensaje-texto enviado con éxito");
      guardarEnFirebase(message, response);
    })
    .catch((error) => {
      console.log("Error al enviar ubicación: ", error);
    });
}

export async function mesajeReferencialFacebook(to, textBody, wamid) {
  var message = {
    messaging_product: "whatsapp",
    context: {
      message_id: wamid, //ejemplo: "wamid.HBgLNTkxNjk4MDAyNDAVAgARGBI0MDlDOTEzMkUxRDA3QkNEMjgA"
    },
    to: to,
    type: "text",
    text: {
      preview_url: false,
      body: textBody,
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  const response = await axios
    .post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    .then((response) => {
      console.log("Mensaje-texto enviado con éxito");
      guardarEnFirebase(message, response);
    })
    .catch((error) => {
      console.log("Error al enviar el m referencial: ", error.response);
    });
}
//hay que revisar
export function encuaestaFacebook(to, textBody, arrayBtn) {
  var message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "59178939804",
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: "HEADER_TEXT",
      },
      body: {
        text: "BODY_TEXT",
      },
      footer: {
        text: "FOOTER_TEXT",
      },
      action: {
        button: "BUTTON_TEXT",
        sections: [
          {
            title: "SECTION_1_TITLE",
            rows: [
              {
                id: "SECTION_1_ROW_1_ID",
                title: "SECTION_1_ROW_1_TITLE",
                description: "SECTION_1_ROW_1_DESCRIPTION",
              },
              {
                id: "SECTION_1_ROW_2_ID",
                title: "SECTION_1_ROW_2_TITLE",
                description: "SECTION_1_ROW_2_DESCRIPTION",
              },
            ],
          },
          {
            title: "SECTION_2_TITLE",
            rows: [
              {
                id: "SECTION_2_ROW_1_ID",
                title: "SECTION_2_ROW_1_TITLE",
                description: "SECTION_2_ROW_1_DESCRIPTION",
              },
              {
                id: "SECTION_2_ROW_2_ID",
                title: "SECTION_2_ROW_2_TITLE",
              },
            ],
          },
        ],
      },
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  axios
    .post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Mensaje enviado con éxito");
    })
    .catch((error) => {
      console.log("Error al enviar el encuesta: ", error.response);
    });
}

export async function bottonesFacebook(to, opciones) {
  const buttons = opciones.buttons.map((btn) => ({
    type: "reply",
    reply: {
      id: btn.id,
      title: btn.title,
    },
  }));

  var message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "text",
        text: opciones.header,
      },
      body: {
        text: opciones.body, // textBody,
      },
      action: {
        buttons: buttons,
      },
    },
  };

  var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  var token = WHATSAPP_API_KEY;

  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Mensaje-botones enviado con éxito");
    guardarEnFirebase(message, response);
    return response;
  } catch (error) {
    console.log("Error al enviar el mensaje: ", error.response);
    throw error;
  }
}

export async function menuListaFacebook(to, opciones) {
  const message = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: to,
    type: "interactive",
    interactive: {
      type: "list",
      header: {
        type: "text",
        text: opciones.header,
      },
      body: {
        text: opciones.body,
      },
      action: {
        button: "Opciones",
        sections: opciones.lista,
      },
    },
  };

  const url = "https://graph.facebook.com/v17.0/119254337784335/messages";
  const token = WHATSAPP_API_KEY;

  try {
    const response = await axios.post(url, message, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Mensaje-menu-lista enviado con éxito");
    guardarEnFirebase(message, response);
  } catch (error) {
    console.log("Error al enviar el menulista: ", error.response);
  }
}

export async function obtenerDescargarImagen(message) {
  let messageMedia = message.image;
  console.log("-----------------", message);

  const token = WHATSAPP_API_KEY;
  const imageUrl = `https://graph.facebook.com/v16.0/${messageMedia.id}/`;
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  try {
    const response = await axios.get(imageUrl, {
      headers: headers,
      responseType: "json", // Cambiado a 'json' ya que queremos obtener la URL primero
    });

    const imageURLFromResponse = response.data.url;
    const imageResponse = await axios.get(imageURLFromResponse, {
      headers: headers,
      responseType: "arraybuffer",
    });

    // Convertir ArrayBuffer a Buffer
    const imageData = Buffer.from(imageResponse.data);

    // Verifica y crea la carpeta si no existe
    const dir = `./images/${message.from}`;
    if (!fs.existsSync(dir)) {
      await fsPromises.mkdir(dir, { recursive: true }); // `recursive` permite crear subdirectorios si es necesario
    }

    // GUARDA EN LOCAL FUNCIONA CORRECTAMENTE
    const imagePath = path.join(dir, `${messageMedia.id}.jpg`);
    await fsPromises.writeFile(imagePath, imageData);
    console.log("Imagen guardada exitosamente en:", imagePath);

    // Subir la imagen directamente a Firebase Storage
      const fileName = `${messageMedia.id}.jpg`;
      console.log('imagen es esto',fileName);
    const destFileName = `images/${message.from}/${fileName}`;

    const url = await uploadFile(imagePath, destFileName);
    message.image.url = url;

    return message;
  } catch (error) {
    console.error("Error fetching and saving the image:", error.message);
  }
}

async function guardarEnFirebase(message, response) {
    const date = new Date(); // Ejemplo de fecha
    const timestamp = date.getTime();

    try {
        if (response.data && response.data.messages) {
            const messageId = response.data.messages[0].id;

            var message_server = {
                from: "59160560700",
                id: messageId,
                timestamp: timestamp,
                ...message,
            };

            await set(ref(db, `chat/${message.to}/${timestamp}/`), message_server);
            console.log("Datos de salida guardados exitosamente.");
        }
    } catch (error) {
        console.error("Error al guardar los datos:", error);
    }
}
