const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

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

let upload;
let bucket;
if (process.env.GCLOUD_BUCKET === undefined) {
  upload = multer({ dest: uploadFolder, limits: { fileSize: maxFileSize } });
} else {
  bucket = gcs.bucket(process.env.GCLOUD_BUCKET);
  upload = multer({
    limits: { fileSize: maxFileSize },
    storage: {
      _handleFile: (req, incomingFile, next) => {
        const file = bucket.file(`${(new Date.now())}_${incomingFile.originalname}`);
        incomingFile.stream
          .pipe(file.createWriteStream({
            metadata: {
              contentType: incomingFile.mimetype
            }
          }))
          .on('error', next)
          .on('finish', next);
      },
      _removeFile: (req, incomingFile, next) => {
        next();
      }
    }
  });
}
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
  res.send('received file');
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
