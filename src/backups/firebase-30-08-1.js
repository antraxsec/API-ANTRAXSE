import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

import { Storage } from "@google-cloud/storage";


const firebaseConfig = {
    apiKey: "AIzaSyB9Tq6ekbN8CEoeYgVCBnDh0zf_sN-dW9o",
    authDomain: "trackin-f05bc.firebaseapp.com",
    databaseURL: "https://trackin-f05bc-default-rtdb.firebaseio.com",
    projectId: "trackin-f05bc",
    storageBucket: "storage-whatsapp",
    messagingSenderId: "140075165436",
    appId: "1:140075165436:web:3dbae00e118e729ae79979"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Google Cloud Storage client initialization
const storage = new Storage({ keyFilename: './src/serviceAccountKey.json' });  // Asegúrate de usar la ruta correcta a tu archivo JSON de credenciales
export const gcsBucket = storage.bucket(firebaseConfig.storageBucket);

export async function uploadFile(filePath, destFileName, generationMatchPrecondition = 0) {
    try {
        const options = {
            destination: destFileName,
            preconditionOpts: { ifGenerationMatch: generationMatchPrecondition },
          };
        
        await gcsBucket.upload(filePath, options);
        // console.log(`${filePath} uploaded to ${firebaseConfig.storageBucket}`);

        // Construye la URL de descarga
        // const url = `https://storage.googleapis.com/${firebaseConfig.storageBucket}/${destFileName}`;
        // console.log("URL: ", url);

         // Genera una URL firmada para el archivo
         const file = gcsBucket.file(destFileName);
         const [signedUrl] = await file.getSignedUrl({
             action: 'read',
             expires: Date.now() + 365 * 24 * 60 * 60 * 1000,  // 1 año
         });
 
         console.log("Signed URL: ", signedUrl);

    } catch (error) {
    console.error(error);
    }
}