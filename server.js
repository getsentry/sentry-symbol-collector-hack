const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const s3 = require('s3');

// ---------------------------- Config

const uploadFolder = 'uploads/';
const maxFileSize = 1024 * 1024 * 30;
const upload = multer({ dest: uploadFolder, limits: { fileSize: maxFileSize } });
const stream = multer({ limits: { fileSize: 1024 * 1024 * 1 } });

const app = express();
const api = express();

const port = process.env.PORT ? process.env.PORT : 8181;
const SYMBOLSERVER_URL = process.env.SYMBOLSERVER_URL ? process.env.SYMBOLSERVER_URL : 'http://127.0.0.1:3000/lookup';
const dist = path.join(__dirname, 'dist');

// ----------------------------
// ---------------------------- Crashreport

const CrashReport = require('./src/logic/CrashReport').default;

function symbolicateCrashReport(crashReportText, req, res) {
  const crashReport = new CrashReport(SYMBOLSERVER_URL, crashReportText);
  crashReport.parseReport();
  crashReport.symbolicateReport().then((thatCrashReport) => {
    res.send({
      raw: thatCrashReport.crashReport,
      symbolicated: thatCrashReport.symbolicatedCrashReport
    });
  }).catch((reason) => {
    res.status(400).send(reason);
  });
}

// ----------------------------
// ---------------------------- S3

const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.S3_BUCKET;

const s3Client = s3.createClient({
  multipartUploadThreshold: maxFileSize,
  multipartUploadSize: maxFileSize,
  s3Options: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY
  },
});

function uploadToS3() {
  if (S3_ACCESS_KEY_ID === undefined) {
    console.error('S3 client not configured, will not upload anything'); // eslint-disable-line no-console
  }
  console.log('starting upload...'); // eslint-disable-line no-console
  const params = {
    localDir: uploadFolder,
    s3Params: {
      Bucket: S3_BUCKET,
      Prefix: 'user-mmaps/'
    },
  };
  const uploader = s3Client.uploadDir(params);
  uploader.on('error', (err) => {
    console.error('unable to sync:', err.stack); // eslint-disable-line no-console
  });
  uploader.on('end', () => {
    console.log('done uploading'); // eslint-disable-line no-console
    fs.readdir(uploadFolder, (_, files) => {
      for (const file of files) {
        fs.unlink(path.join(uploadFolder, file), (error) => {
          if (error) console.error('unable to delete:', error); // eslint-disable-line no-console
        });
      }
    });
  });
}

// ----------------------------
// ---------------------------- Helper

function checksum(str, algorithm, encoding) {
  return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

// ----------------------------
// ---------------------------- API

app.use(cors({ origin: true, credentials: true }));
app.use(express.static(dist));
app.use(bodyParser.json());
app.use('/api', api);

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

api.get('/health', (req, res) => {
  res.send('ok');
});

api.post('/crashreport', (req, res) => {
  symbolicateCrashReport(req.body.crashreport, req, res);
});

api.post('/crashreport/upload', stream.single('crashreport'), (req, res) => {
  symbolicateCrashReport(`${req.file.buffer}`, req, res);
});

api.post('/sdk', upload.single('file'), (req, res) => {
  fs.readFile(req.file.path, (err, data) => {
    const cs = checksum(data, 'sha1');
    fs.rename(req.file.path, `${uploadFolder + req.file.originalname}-${cs}`, () => {
      res.send('ok');
      uploadToS3();
    });
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, (error) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
  }
  console.info('Express is listening on port %s. SymbolServer: %s', port, SYMBOLSERVER_URL); // eslint-disable-line no-console
});

// ----------------------------
