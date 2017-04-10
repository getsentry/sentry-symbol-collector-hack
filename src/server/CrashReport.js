import request from 'superagent';

const REGEX_PROCESSOR = /^Code Type:\s+(.*)$/m;
const REGEX_BINARY_IMAGES = /^(0x[0-9a-f]+)\s-\s0x[0-9a-f]+\s(\S+)\s(\S+)\s+<([0-9a-f]+)>(.*)$/mg;
const REGEX_OS = /^OS Version:\s+([^\(]+)\s\(/m;
const REGEX_FRAME = /^[0-9]+\s+([^\s]+)\s+(0x[0-9a-f]+)\s+(0x[0-9a-f]+)/mg;

export default class CrashReport {

  constructor(crashReport) {
    this.crashReport = crashReport;
  }

  parseReport() {
    this.arch = this._parseProcessor();
    this.os = this._parseOS();
    this.binaryImages = this._parseBinaryImages();
    this.frames = this._parseFrames();
  }

  symbolicateReport() {
    return new Promise((resolve, reject) => {
      if (this.arch === undefined) {
        reject('wrong crashreport format');
      }
      const symbolsToRequest = [];
      this.frames.forEach((frame, symbol) => {
        const image = this._findBinaryImage(frame.image);
        if (image && image.inApp === false) {
          symbolsToRequest.push({
            request: {
              object_uuid: image.uuid,
              addr: `0x${(symbol - image.startAddress).toString(16)}`
            },
            frame
          });
        }
      });
      const symbolicateRequest = {
        sdk_id: this.os,
        cpu_name: this.arch,
        symbols: symbolsToRequest.map((symbol) => symbol.request)
      };

      request
        .post('http://127.0.0.1:3000/lookup')
        .send(symbolicateRequest)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (res.body && res.body.symbols) {
            let count = 0;
            this.symbolicatedCrashReport = this.crashReport;
            symbolsToRequest.forEach((symbolToRequest) => {
              // console.log(res.body.symbols[count]);
              const responseSymbol = res.body.symbols[count];
              // console.log(symbolToRequest.frame.symbol);
              // console.log('/'+symbolToRequest.frame.symbol + '\\s(.+)$/');
              const regex = new RegExp(`${symbolToRequest.frame.symbol}\\s(.+)$`, 'mg');
              const subt = `${symbolToRequest.frame.symbol} ${responseSymbol.symbol} + ${parseInt(responseSymbol.addr, 16)}`;
              this.symbolicatedCrashReport = this.symbolicatedCrashReport.replace(regex, subt);
              count++;
            });
            // console.log(this.symbolicatedCrashReport);
            resolve(this.symbolicatedCrashReport);
          }
        });
    });
        // console.log(symbolicateRequest);
        // console.log(this._findBinaryImage('libsystem_kernel.dylib'));
  }

  _findBinaryImage(name) {
    function findBinaryImage(image) {
      return image.name == name;
    }
    return this.binaryImages.find(findBinaryImage);
  }

  _parseOS() {
    let m;
    let result;
    if ((m = REGEX_OS.exec(this.crashReport)) !== null) {
      m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
          if (match.match('iPhone OS')) {
            result = `iOS_${match.replace('iPhone OS ', '')}`;
          }
        }
      });
    }
    return result;
  }

  _parseProcessor() {
    let m;
    let result;
    if ((m = REGEX_PROCESSOR.exec(this.crashReport)) !== null) {
      m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
          result = match.toLowerCase().replace('(native)', '').replace('-', '');
        }
      });
    }
    return result;
  }

  _parseFrames() {
    let m;
    const result = new Map();
    while ((m = REGEX_FRAME.exec(this.crashReport)) !== null) {
      if (m.index === REGEX_FRAME.lastIndex) {
        REGEX_FRAME.lastIndex++;
      }
      const frame = {};
      m.forEach((match, groupIndex) => {
        switch (groupIndex) {
          case 1:
            frame.image = match;
            break;
          case 2:
            frame.symbol = match;
            break;
          case 3:
            frame.imageAddress = match;
            break;
        }
      });
      result.set(frame.symbol, frame);
    }
    return result;
  }

  _parseBinaryImages() {
    let m;
    const result = [];
    while ((m = REGEX_BINARY_IMAGES.exec(this.crashReport)) !== null) {
      if (m.index === REGEX_BINARY_IMAGES.lastIndex) {
        REGEX_BINARY_IMAGES.lastIndex++;
      }
      const image = {};
      m.forEach((match, groupIndex) => {
        switch (groupIndex) {
          case 1:
            image.startAddress = match;
            break;
          case 2:
            image.name = match;
            break;
          case 3:
            image.arch = match;
            break;
          case 4:
            image.uuid = match;
            break;
          case 5:
            image.inApp = false;
            if (match.match('/var/containers/Bundle/Application')) {
              image.inApp = true;
            }
            break;
        }
      });
      result.push(image);
    }
    return result;
  }
}
