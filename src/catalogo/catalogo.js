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
/*
 * Catalogo
 */
export async function menuListaCatalogo(numero) {
  await mensajeFacebook(
    numero,
    `Contamos con las marcas más prestigiosas del mundo.`
  );
  const lista = [
    {
      title: "Opciones principales",
      rows: [
        {
          id: "btn_catalogoMarca1",
          title: "Laptops Samsung",
        },
        // {
        // 	"id": "btn_catalogoMarca2",
        // 	"title": "Laptops Asus",
        // },
        // {
        // 	"id": "btn_catalogoMarca3",
        // 	"title": "Laptops Lenovo",
        // },
        // {
        // 	"id": "btn_catalogoMarca4",
        // 	"title": "Laptops Dell",
        // },
        // {
        // 	"id": "btn_catalogoMarca5",
        // 	"title": "Laptops MSI",
        // },
        // {
        // 	"id": "btn_catalogoMarca6",
        // 	"title": "Laptops Acer",
        // }
      ],
    },
  ];
  const opciones = {
    header: "Catálogos de productos",
    body: "Toda nuestra lista de productos disponibles a tu alcance.",
    lista: lista,
  };
  await menuListaFacebook(numero, opciones);
}

export async function nivelCatalogo(chatId, message, numero, tipo) {
  const response = message;
  if (
    response.type === "interactive" &&
    response.interactive.type === "list_reply"
  ) {
    const buttonId = response.interactive.list_reply.id;
    console.log("ID del botón seleccionado:", buttonId);

    switch (buttonId) {
      case "btn_catalogoMarca1":
        await reenviarCatalogoSamsung(numero);
        //chatStates.set(chatId, "catalogoSamsung");//mandando a un estado
        break;
      default:
        console.log("Botón no reconocido.");
    }
  } else if (response.text && response.text.body === "1") {
    await mensajeFacebook(numero, "Saliendo del menu");
    // chatStates.set(chatId, "menu");//mandando al estado menu
  } else {
    await mensajeFacebook(
      numero,
      `Para continuar, selecciona una opción. Recuerda que debes ingresar desde la aplicación de WhatsApp para dispositivos móviles.`
    );
    await menuEntregaDomicilio(numero);
  }
}

export async function reenviarCatalogoSamsung(numero) {
  const opciones = {
    header: "Catálogo Samsung",
    body: "Ofrecemos toda la gama de modelos homologados para Bolivia",
  };
  const secciones = [
    {
      title: "NoteBook Plus2",
      product_items: [
        { product_retailer_id: "100278" },
        { product_retailer_id: "100279" },
      ],
    },
    {
      title: "Galaxy Book2",
      product_items: [
        { product_retailer_id: "100207" },
        { product_retailer_id: "100208" },
        { product_retailer_id: "100213" },
        { product_retailer_id: "100214" },
        { product_retailer_id: "100246" },
        { product_retailer_id: "100206" },
        { product_retailer_id: "100205" },
      ],
    },
    {
      title: "Galaxy Book3",
      product_items: [
        { product_retailer_id: "100352" },
        { product_retailer_id: "100353" },
        { product_retailer_id: "100354" },
        { product_retailer_id: "100355" },
      ],
    },
  ];
  await catalogoSeccionFacebook(numero, opciones, secciones);
}
export async function MandarPorSKU(data) {
  console.log("recibió productos data sku", data);
  const { skus, cod } = data;
  console.log(skus, cod);
  const opciones = {
    header: "Productos Multilaptops",
    body: "Ofrecemos toda la gama de modelos homologados para Bolivia",
  };
  const secciones = [
    {
      title: "Producto",
      product_items: skus.map((row) => ({ product_retailer_id: row })),
    },
  ];
  await catalogoSeccionFacebook(cod, opciones, secciones);
}
