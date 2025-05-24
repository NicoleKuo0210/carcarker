
import functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();
const Busboy = require('busboy');
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' })); // Allow large image payloads

app.post('/upload', (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  let uploadData: Buffer = Buffer.alloc(0);
  let metadata: any = {};

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    file.on('data', (data) => {
      uploadData = Buffer.concat([uploadData, data]);
    });

    file.on('end', () => {
      metadata.filename = filename;
      metadata.mimetype = mimetype;
    });
  });

  busboy.on('field', (fieldname, val) => {
    metadata[fieldname] = val;
  });

  busboy.on('finish', async () => {
    const timestamp = Date.now();
    const filename = `esp32_images/${timestamp}_${metadata.filename}`;

    const file = storage.file(filename);
    await file.save(uploadData, {
      metadata: { contentType: metadata.mimetype },
      public: true,
    });

    const imageUrl = `https://storage.googleapis.com/${storage.name}/${filename}`;
    await db.collection('esp32_logs').add({
      temperature: metadata.temperature,
      humidity: metadata.humidity,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ success: true, imageUrl });
  });

  req.pipe(busboy);
});


// Export function
export const api = functions.https.onRequest(app);


/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
