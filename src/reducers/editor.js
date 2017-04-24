import { CRASHREPORT_CHANGED, CRASHREPORT_UPLOAD, CRASHREPORT_CONVERT_ERROR, CRASHREPORT_RESET, SYMBOLICATED_CRASHREPORT } from 'constants/action-types';
import request from 'superagent';
import CrashReport from '../logic/CrashReport';

const crashReport = '// Drag or paste your apple crash report here';

const initialState = {
  crashReport,
  crashReportSymbolicated: '',
  error: ''
};

function symbolicateCrashReport(action) {
  const crashReport = new CrashReport(null, action.crashReport);
  crashReport.parseReport();
  if (crashReport.isValidReport()) {
    request
      .post('/api/crashreport')
      .send({ crashreport: action.crashReport })
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          action.asyncDispatch({ type: CRASHREPORT_CONVERT_ERROR, error: err });
          return;
        }
        action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res });
      });
  }
}

function uploadCrashReport(action) {
  action.files.forEach((file) => {
    request
      .post('/api/crashreport/upload')
      .attach('crashreport', file)
      .end((err, res) => {
        if (err) {
          action.asyncDispatch({ type: CRASHREPORT_CONVERT_ERROR, error: err });
          return;
        }
        action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res });
      });
  });
}

export default function editor(state = initialState, action) {
  switch (action.type) {
    case CRASHREPORT_CHANGED:
      symbolicateCrashReport(action);
      return Object.assign({}, state, {
        crashReport: action.crashReport,
        error: ''
      });
    case CRASHREPORT_UPLOAD:
      uploadCrashReport(action);
      return { ...state };
    case CRASHREPORT_CONVERT_ERROR:
      return Object.assign({}, state, {
        crashReportSymbolicated: '',
        error: action.error.message
      });
    case CRASHREPORT_RESET:
      return initialState;
    case SYMBOLICATED_CRASHREPORT:
      return Object.assign({}, state, {
        crashReportSymbolicated: action.response.body.symbolicated,
        error: ''
      });
    default:
      return state;
  }
}
