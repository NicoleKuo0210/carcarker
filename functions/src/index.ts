import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response } from 'express';
// import cors from 'cors';
import Busboy from 'busboy';
import { Readable } from 'stream'; // ← make sure this import is present

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();

app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Something went wrong');
});
// DO NOT USE express.json() or express.urlencoded() here — it breaks Busboy

app.post('/upload', (req: Request, res: Response) => {
  console.log('[UPLOAD] Received POST /upload');
  console.log('rawBody length:', (req as any).rawBody?.length);

  const busboy = Busboy({ headers: req.headers });
  let uploadData = Buffer.alloc(0);
  let metadata: {
    filename?: string;
    mimetype?: string;
    temperature?: string;
    humidity?: string;
  } = {};
  busboy.on(
    'file',
    (
      fieldname: string,
      file: Readable,
      fileInfo: any, // ← Busboy sometimes merges 3 args into this
      encoding: string,
      mimetype: string
    ) => {
      // If fileInfo is an object instead of string
      const actualFilename = typeof fileInfo === 'string' ? fileInfo : fileInfo?.filename;
      const actualMime = mimetype || fileInfo?.mimeType;

      console.log(`Receiving file: ${actualFilename} (${actualMime})`);
      metadata.filename = actualFilename;
      metadata.mimetype = actualMime;

      file.on('data', (data: Buffer) => {
        console.log(`[data] chunk received (${data.length} bytes)`);
        uploadData = Buffer.concat([uploadData, data]);
      });

      file.on('end', () => {
        console.log(`File [${fieldname}] upload complete`);
      });
    }
  );

  busboy.on('field', (fieldname, value) => {
    metadata[fieldname as 'temperature' | 'humidity'] = value;
    console.log(`Field received: ${fieldname} = ${value}`);
  });

  busboy.on('finish', async () => {
    console.log('[finish]');
    console.log(`Final metadata:`, metadata);
    console.log(`Upload data size: ${uploadData.length}`);
    console.log('filename:', metadata.filename);
    console.log('mimetype:', metadata.mimetype);
    console.log('uploadData length:', uploadData.length);

    if (!metadata.filename || !metadata.mimetype || !uploadData.length) {
      return res.status(400).send('Missing file data');
    }

    try {
      const filename = `esp32_images/latest.jpg`;
      const file = bucket.file(filename);

      await file.save(uploadData, {
        metadata: { contentType: metadata.mimetype },
        public: true,
      });

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      await db.collection('esp32_logs').doc('latest').set({
        temperature: metadata.temperature,
        humidity: metadata.humidity,
        imageUrl,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ success: true, imageUrl });
    } catch (err) {
      console.error('Upload failed:', err);
      return res.status(500).send('Upload failed');
    }
  });

  busboy.on('error', (err) => {
    console.error('[busboy] error:', err);
    return res.status(500).send('Parsing error');
  });

  // ✅ Feed Busboy with raw body
  try {
    busboy.end((req as any).rawBody);
  } catch (err) {
    console.error('Failed to call busboy.end:', err);
    return res.status(500).send('Failed to parse upload');
  }
  return;
});

export const api = functions.https.onRequest((req, res) => {
  // This enables `req.rawBody`
  if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    // nothing extra needed here
  }
  return app(req, res); // pass to Express
});
export const config = {
  api: {
    bodyParser: false, // needed to avoid breaking busboy
  },
};