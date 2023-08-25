import axios from 'axios';
import { WHATSAPP_API_KEY } from "./config.js";

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

export function ubicacionFacebook(to, longitude, latitude, name, address) {
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

export function mesajeReferencialFacebook(to, textBody, wamid) {
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
export function bottonesFacebook(to, textBody, arrayBtn) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": "59178939804",
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": "BUTTON_TEXT BLA BLA BLA"
            },
            "action": {
                "buttons": [
                    {
                        "type": "reply",
                        "reply": {
                            "id": "UNIQUE_BUTTON_ID_1",
                            "title": "BUTTON 1"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": "UNIQUE_BUTTON_ID_2",
                            "title": "BUTTON 2"
                        }
                    },
                    {
                        "type": "reply",
                        "reply": {
                            "id": "UNIQUE_BUTTON_ID_3",
                            "title": "BUTTON 3"
                        }
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