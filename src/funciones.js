/*************************___FACEBOOK___************************ */
import axios from 'axios';
export function mensajeFacebook(to, textBody) {
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
    var token = "EABYkQq2clo4BAG4qw8KYVw0WTnLdfdZBZB01Sr4tPqjUxWMZA29LlbZBbnWlFCuutjSoon9cbcV8jZBwkLtZCjuM0QoLoVLsjhPDpmPSjfcYXGamOQKSCO2uu7kECCW6RYdw44OlPvzXwGywldfyHQ4sWUQ3yxXytDZAzap5ZBe7KjZBUZAsnJSZCHyj3rcZBLtMsCfMmHwUNr1pIQZDZD"

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

export function imgFacebook(to, textBody, url) {
    var message = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "image",
        "image": {
            "link": url
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
