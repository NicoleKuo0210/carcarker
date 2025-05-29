import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import express, { Request, Response } from 'express';
import cors from 'cors';

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();
const app = express();
const Busboy = require('busboy');

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.post('/upload', (req: Request, res: Response) => {
  const busboy = new Busboy({ headers: req.headers });
  let uploadData: Buffer = Buffer.alloc(0);
  let metadata: any = {};

  busboy.on(
    'file',
    (
      fieldname: string,
      file: NodeJS.ReadableStream,
      filename: string,
      encoding: string,
      mimetype: string
    ) => {
      file.on('data', (data: Buffer) => {
        uploadData = Buffer.concat([uploadData, data]);
      });

      file.on('end', () => {
        metadata.filename = filename;
        metadata.mimetype = mimetype;
      });
    }
  );

  busboy.on('field', (fieldname: string, val: string) => {
    metadata[fieldname] = val;
  });

  busboy.on('finish', async () => {
    const filename = `esp32_images/latest.jpg`;
    const file = storage.file(filename);
    await file.save(uploadData, {
      metadata: { contentType: metadata.mimetype },
      public: true,
    });

    const imageUrl = `https://storage.googleapis.com/${storage.name}/${filename}`;
    await db.collection('esp32_logs').doc('latest').set({
      temperature: metadata.temperature,
      humidity: metadata.humidity,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });


    res.status(200).json({ success: true, imageUrl });
  });

  req.pipe(busboy);
});

export const api = functions.https.onRequest(app);
