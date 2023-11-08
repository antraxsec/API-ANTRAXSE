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
} from "../funciones.js";
/**
 * menu
 *  */

export async function menuLista(numero) {
  const lista = [
    {
      title: "Opciones principales",
      rows: [
        {
          id: "btn_catalogo",
          title: "Cátalogo de productos",
        },
        {
          id: "btn_comprar",
          title: "Comprar un producto",
        },
        {
          id: "btn_promocion",
          title: "Promociones",
        },
        {
          id: "btn_formaEntrega",
          title: "Ubicación y entrega",
        },
        {
          id: "btn_asesor",
          title: "Asesor de ventas",
        },
      ],
    },
  ];
  const opciones = {
    header: "Menu de opciones",
    body: "Selecciona una opción y descubre nuestra tecnología. ¡Te sorprenderás!",
    lista: lista,
  };
  await menuListaFacebook(numero, opciones);
}
export async function nivelMenu(chatId, message, numero, tipo) {
  const response = message;
  if (
    response.type === "interactive" &&
    response.interactive.type === "list_reply"
  ) {
    const buttonId = response.interactive.list_reply.id;
    console.log("ID del botón seleccionado:", buttonId);

    switch (buttonId) {
      case "btn_catalogo":
        // menuListaCatalogo(numero);
        // chatStates.set(chatId, "menuCatalogo");
        break;
      case "btn_comprar":
        // reenviarUbicacion(numero, false);
        // chatStates.set(chatId, "menu");
        break;
      case "btn_promocion":
        // promocionFlow(numero, false);
        // chatStates.set(chatId, "menu");
        break;
      case "btn_formaEntrega":
        // menuFormaEntrega(numero);
        // chatStates.set(chatId, "formaEntrega");
        break;
      case "btn_asesor":
        // await mensajeFacebook(numero, "*Activando asistente*");
        // await mensajeFacebook(numero, "Realiza tu consulta");
        // chatStates.set(chatId, "asistente");
        break;
      default:
        console.log("Botón no reconocido.");
    }
  } else if (response.text && response.text.body === "1") {
    // await mensajeFacebook(numero, "Saliendo del menu");
    // chatStates.set(chatId, "initial");
  } else {
    // await mensajeFacebook(
    //   numero,
    //   `Para continuar, selecciona una opción. Recuerda que debes ingresar desde la aplicación de WhatsApp para dispositivos móviles.`
    // );
    //  await menuLista(numero);
  }
}
