const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const gcs = require('@google-cloud/storage')({
  projectId: process.env.GCLOUD_PROJECT_ID || '-',
  keyFilename: 'keyfile.json'
});

const ejs = require('ejs');

const app = express();
const api = express();

// ---------------------------- Config

const uploadFolder = 'uploads/';
const FILE_LIMIT_IN_MB = process.env.FILE_LIMIT_IN_MB ? process.env.FILE_LIMIT_IN_MB : 30;
const maxFileSize = 1024 * 1024 * FILE_LIMIT_IN_MB;
const upload = multer({ dest: uploadFolder, limits: { fileSize: maxFileSize } });
const stream = multer({ limits: { fileSize: 1024 * 1024 * 1 } });

const URL = process.env.URL ? process.env.URL : 'http://127.0.0.1:8181';
const PORT = process.env.PORT ? process.env.PORT : 8181;
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
// ---------------------------- GCloud Storage

function uploadToGcloud(filename) {
  if (process.env.GCLOUD_BUCKET === undefined) {
    console.error('GCloud Storage is not configured, will not upload anything'); // eslint-disable-line no-console
    return;
  }
  const bucket = gcs.bucket(process.env.GCLOUD_BUCKET);
  bucket.upload(filename, (err, file) => {
    if (err) {
      console.error('unable to upload file to gcloud:', err.stack); // eslint-disable-line no-console
      return;
    }
    console.log('done uploading'); // eslint-disable-line no-console
    fs.unlink(filename, (error) => {
      if (error) {
        console.error('unable to delete:', error); // eslint-disable-line no-console
      } else {
        console.log(`deleted local file ${filename}`); // eslint-disable-line no-console
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
    const filename = `${uploadFolder + req.file.originalname}-${cs}`;
    fs.rename(req.file.path, filename, () => {
      res.send('ok');
      uploadToGcloud(filename);
    });
  });
});

api.post('/test', upload.single('file'), (req, res) => {
  res.send(require('util').inspect(req));
});

app.get('/upload.sh', (req, res) => {
  ejs.renderFile('./get-symboluploader.sh', {
    server_url: URL
  }, {}, (err, str) => {
    res.setHeader('Content-Type', 'text/plain');
    res.end(str);
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, (error) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
  }
  console.info('Express is listening on port %s with URL: %s.\nSymbolServer: %s', PORT, URL, SYMBOLSERVER_URL); // eslint-disable-line no-console
});

// ----------------------------
