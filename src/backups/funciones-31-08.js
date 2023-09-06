import axios from 'axios';
import { WHATSAPP_API_KEY } from "../config.js";
import {db,  gcsBucket, uploadFile} from '../firebase.js'
import { getDatabase, ref, set ,onValue} from "firebase/database";
import fsPromises from 'fs/promises';

export async function productoFacebook(to, id_catalogo, boy_text, footer_text) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "product",
            "body": {
                "text": boy_text
            },
            "footer": {
                "text": footer_text
            },
            "action": {
                "catalog_id": "1418912658860290",
                "product_retailer_id": id_catalogo
            }
        }
    }

    var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY

    const response = await axios.post(url, message, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {
        console.log("Mensaje-producto enviado con éxito");
        guardarEnFirebase(message, response);
    })
    .catch(error => {
        console.log("Error al enviar el mensaje: ", error);
    });
}

export async function mensajeFacebook(to, textBody) {

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
    var token = WHATSAPP_API_KEY;

    const response = await axios.post(url, message, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {
        console.log("Mensaje-texto enviado con éxito");
        guardarEnFirebase(message, response);
    })
    .catch(error => {
        console.log("Error al enviar el mensaje: ", error);
    });
       
}

export async function reaccionFacebook(to, wamid, emoji) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "reaction",
        "reaction": {
            "message_id": wamid,
            "emoji": emoji
        }
    };

    var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY;

    return axios.post(url, message, {
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

export async function imgFacebook(to, textBody, imgurl) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "image",
        "image": {
            "link": imgurl,
            "caption": textBody
        }
    };

    var url = "https://graph.facebook.com/v17.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY

    const response = await axios.post(url, message, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {
        console.log("Mensaje-texto enviado con éxito");
        guardarEnFirebase(message, response);
    })
    .catch(error => {
        console.log("Error al enviar el mensaje: ", error);
    });
}

export async function ubicacionFacebook(to, longitude, latitude, name, address) {
    var message = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "location",
        "location": {
            "longitude": longitude,
            "latitude": latitude,
            "name": name,
            "address": address
        }
    };

    var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY

    const response = await axios.post(url, message, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {
        console.log("Mensaje-texto enviado con éxito");
        guardarEnFirebase(message, response);
    })
    .catch(error => {
        console.log("Error al enviar el mensaje: ", error);
    });
}

export async function mesajeReferencialFacebook(to, textBody, wamid) {
    var message = {
        "messaging_product": "whatsapp",
        "context": {
            "message_id": wamid //ejemplo: "wamid.HBgLNTkxNjk4MDAyNDAVAgARGBI0MDlDOTEzMkUxRDA3QkNEMjgA"
        },
        "to": to,
        "type": "text",
        "text": {
            "preview_url": false,
            "body": textBody
        }
    };

    var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY

    const response = await axios.post(url, message, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {
        console.log("Mensaje-texto enviado con éxito");
        guardarEnFirebase(message, response);
    })
    .catch(error => {
        console.log("Error al enviar el mensaje: ", error);
    });
}
//hay que revisar
export function encuaestaFacebook(to, textBody, arrayBtn) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "59178939804",
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {
                "type": "text",
                "text": "HEADER_TEXT"
            },
            "body": {
                "text": "BODY_TEXT"
            },
            "footer": {
                "text": "FOOTER_TEXT"
            },
            "action": {
                "button": "BUTTON_TEXT",
                "sections": [
                    {
                        "title": "SECTION_1_TITLE",
                        "rows": [
                            {
                                "id": "SECTION_1_ROW_1_ID",
                                "title": "SECTION_1_ROW_1_TITLE",
                                "description": "SECTION_1_ROW_1_DESCRIPTION"
                            },
                            {
                                "id": "SECTION_1_ROW_2_ID",
                                "title": "SECTION_1_ROW_2_TITLE",
                                "description": "SECTION_1_ROW_2_DESCRIPTION"
                            }
                        ]
                    },
                    {
                        "title": "SECTION_2_TITLE",
                        "rows": [
                            {
                                "id": "SECTION_2_ROW_1_ID",
                                "title": "SECTION_2_ROW_1_TITLE",
                                "description": "SECTION_2_ROW_1_DESCRIPTION"
                            },
                            {
                                "id": "SECTION_2_ROW_2_ID",
                                "title": "SECTION_2_ROW_2_TITLE"
                            }
                        ]
                    }
                ]
            }
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
//hay que revisar
export async function bottonesFacebook(to, textBody, arrayBtn) {
    const buttons = arrayBtn.map(btn => ({
        type: "reply",
        reply: {
            id: btn.id,
            title: btn.title
        }
    }));

    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": textBody
            },
            "action": {
                "buttons": buttons
            }
        }
    };

    var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY

    const response = await axios.post(url, message, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    .then(response => {
        console.log("Mensaje-texto enviado con éxito");
        guardarEnFirebase(message, response);
    })
    .catch(error => {
        console.log("Error al enviar el mensaje: ", error);
    });
}

export function bottonesDosFacebook(to) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "list",
            "header": {
                "type": "text",
                "text": "Multilaptops"
            },
            "body": {
                "text": "Seleccionar una opción"
            },
            "footer": {
                "text": "Obtén más información"
            },
            "action": {
                "button": "MENU",
                "sections": [
                    {
                        "title": "Asistencia",
                        "rows": [
                            {
                                "id": "ASSISTANT",
                                "title": "Hablar con un asistente",
                                "description": "Conéctate con un asistente en línea"
                            }
                        ]
                    },
                    {
                        "title": "Tienda",
                        "rows": [
                            {
                                "id": "LOCATION",
                                "title": "Ubicación de la tienda",
                                "description": "Encuentra nuestra tienda más cercana"
                            }
                        ]
                    },
                    {
                        "title": "Pago",
                        "rows": [
                            {
                                "id": "PAYMENT",
                                "title": "Forma de pago",
                                "description": "Conoce nuestras opciones de pago"
                            }
                        ]
                    },
                    {
                        "title": "Compra",
                        "rows": [
                            {
                                "id": "PURCHASE_PROCESS",
                                "title": "Proceso de compra",
                                "description": "Aprende cómo realizar una compra"
                            }
                        ]
                    }
                ]
            }
        }
    }
        ;

    var url = "https://graph.facebook.com/v16.0/119254337784335/messages";
    var token = WHATSAPP_API_KEY

    return axios.post(url, message, {
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

export async function obtenerDescargarImagen(message) {

    let messageMedia = message.image;
    console.log("===>>>>>>>>", messageMedia);

    const token = WHATSAPP_API_KEY;
    const imageUrl = `https://graph.facebook.com/v16.0/${messageMedia.id}/`;
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await axios.get(imageUrl, {
            headers: headers,
            responseType: 'json'  // Cambiado a 'json' ya que queremos obtener la URL primero
        });

        const imageURLFromResponse = response.data.url;
        const imageResponse = await axios.get(imageURLFromResponse, {
            headers: headers,
            responseType: 'arraybuffer'
        });

        // Convertir ArrayBuffer a Buffer
        const imageData = Buffer.from(imageResponse.data);

        // GUARDA EN LOCAL FUNCIONA CORRECTAMENTE
        const imagePath = `./images/${messageMedia.id}.jpg`;
        await fsPromises.writeFile(imagePath, imageData);
        console.log('Imagen guardada exitosamente en:', imagePath);

        // Subir la imagen directamente a Firebase Storage
        // const filePath = `./images/1775938842877266.jpg`; 
        const fileName = `${messageMedia.id}.jpg`;
        const destFileName = `images/${fileName}`;
				
        uploadFile(imagePath, destFileName);

    } catch (error) {
        console.error('Error fetching and saving the image:', error.message);
    }
       
}

async function guardarEnFirebase(message, response) {
    const date = new Date();  // Ejemplo de fecha
    const timestamp = date.getTime();

	try {
        if (response.data && response.data.messages) {
            const messageId = response.data.messages[0].id;

            var message_server = {
                "from": "59160560700",
                "id": messageId,
                "timestamp": timestamp,
                ...message
            };

            await set(ref(db, `chat/${message.to}/${timestamp}/`), message_server);
		    console.log('Datos de salida guardados exitosamente.');

        }

	} catch (error) {
		console.error('Error al guardar los datos:', error);
	}
}
