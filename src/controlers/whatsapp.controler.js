import { pool } from "../db.js";



//crear datos POST
export const postwp = async (req, res) => {

    console.log(req.body);
//nuevo
 let datas = {
   messaging_product: "whatsapp",
   to: "59168249790",
   type: "template",
   template: {
     name: "sample_purchase_feedback",
     language: {
       code: "es",
     },
     components: [
       {
         type: "header",
         parameters: [
           {
             type: "image",
             image: {
               link: req.body.nombre,
             },
           },
         ],
       },
       {
         type: "body",
         parameters: [
           {
             type: "text",
             text: req.body.apellido,
           },
         ],
       },
     ],
   },
 };
 ///mandar mensajes por whatsapp
 const url = "https://graph.facebook.com/v16.0/119254337784335/messages";
 const data = datas;
 const token =
   "EAAKqVdGnZCL4BAM8C6FDsmVHZBp2JOYlPtZBqUWwJQNUOb0qGcoazJs9y5rS3CxZAGlTZCahSXJsZAvhSiJhTQPJd3MB8BtBRZCBVNIuR3FWYrvUsMS7ZAml1SikA90PvXeO3Lqv6fkZCMPnEZAKoAZCYauwhxX4Pyxnmslw9jSoygXwZCojPt1Q8wyaqnJ1d2bniyFXbNBvqATUQgZDZD";

 fetch(url, {
   method: "POST",
   headers: {
     Authorization: `Bearer ${token}`,
     "Content-Type": "application/json",
   },
   body: JSON.stringify(data),
 })
   .then((response) => response.json())
   .then((response) => console.log(response))
   .catch((error) => console.error(error));


await res.json(req.body);
};

