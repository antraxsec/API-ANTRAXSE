import { initializeApp } from "firebase/app";
import { getDatabase, set } from "firebase/database";

import { Storage as GCStorage } from "@google-cloud/storage";

import { getStorage as FirebaseStorage, ref, getDownloadURL } from "@firebase/storage";


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

const storage = FirebaseStorage(app);

// Google Cloud Storage client initialization
const gcStorage = new GCStorage({ keyFilename: './src/serviceAccountKey.json' });  // Asegúrate de usar la ruta correcta a tu archivo JSON de credenciales
export const gcsBucket = gcStorage.bucket(firebaseConfig.storageBucket);

export async function uploadFile(filePath, destFileName) {
  console.log("entroooooooo");
  try {
    // Si no necesitas precondiciones, simplemente omite esa opción
    await gcsBucket.upload(filePath, { destination: destFileName });

    const fileRef = ref(storage, destFileName);

    const downloadURL = await getDownloadURL(fileRef);
    console.log("Firebase Download URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error(error);
  }
}