import { menuListaCatalogo } from "../catalogo/catalogo.js";
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
      title: "Menu",
      rows: [
        {
          id: "btn_catalogo",
          title: "Cátalogo de productos",
        },
        {
          id: "btn_promociones",
          title: "Promociones",
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
    body: "Selecciona una opción y descubre nuestra tecnología. ¡Te sorprenderás! 🚀",
    lista: lista,
  };
  await menuListaFacebook(numero, opciones);
}
export async function nivelMenu(message, numero, tipo) {
  const response = message;
  if (
    response.type === "interactive" &&
    response.interactive.type === "list_reply"
  ) {
    const buttonId = response.interactive.list_reply.id;
    console.log("ID del botón seleccionado:", buttonId);

    switch (buttonId) {
      case "btn_catalogo":
        menuListaCatalogo(numero);
        break;
      case "btn_comprar":
        // reenviarUbicacion(numero, false);
        break;
      case "btn_promocion":
        // promocionFlow(numero, false);
        break;
      case "btn_formaEntrega":
        // menuFormaEntrega(numero);
        break;
      case "btn_asesor":
        // await mensajeFacebook(numero, "*Activando asistente*");
        break;
      default:
        console.log("Botón no reconocido.");
    }
  }
  return "MENU";
}
