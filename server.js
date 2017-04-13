const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
// const upload = multer()
const uploadFolder = 'uploads/';
const upload = multer({ dest: uploadFolder });
const stream = multer();


const app = express();
const api = express();

const port = process.env.PORT ? process.env.PORT : 8181;
const dist = path.join(__dirname, 'dist');

const CrashReport = require('./src/server/CrashReport').default;

function checksum(str, algorithm, encoding) {
  return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

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

api.post('/crashreport', (req, res) => {
  symbolicateCrashReport(req.body.crashreport, req, res);
});

api.post('/crashreport/upload', stream.single('crashreport'), (req, res) => {
  symbolicateCrashReport(`${req.file.buffer}`, req, res);
});

api.post('/sdk', upload.single('file'), (req, res) => {
  fs.readFile(req.file.path, (err, data) => {
    const cs = checksum(data, 'sha1');
    fs.rename(req.file.path, uploadFolder + req.file.originalname + '-' + cs, () => {
      res.send('ok');
    });
  });
});

function symbolicateCrashReport(crashReportText, req, res) {
  const crashReport = new CrashReport(crashReportText);
  crashReport.parseReport();
  crashReport.symbolicateReport().then((crashReport) => {
    res.send({
      raw: crashReport.crashReport,
      symbolicated: crashReport.symbolicatedCrashReport
    });
  }).catch((reason) => {
    res.status(400).send(reason);
  });
}

app.get('*', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, (error) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
  }
  console.info('Express is listening on port %s.', port); // eslint-disable-line no-console
});
