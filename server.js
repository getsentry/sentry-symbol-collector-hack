const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer()

const app = express();
const api = express();

const port = process.env.PORT ? process.env.PORT : 8181;
const dist = path.join(__dirname, 'dist');

const CrashReport = require('./src/server/CrashReport').default;

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

api.post('/crashreport/upload', upload.single('crashreport'), (req, res) => {
   symbolicateCrashReport(req.file.buffer + '', req, res);
});

function symbolicateCrashReport(crashReportText, req, res) {
  const crashReport = new CrashReport(crashReportText);
  crashReport.parseReport();
  crashReport.symbolicateReport().then((result) => {
    res.send({raw: result[0], symbolicated: result[1]});
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
