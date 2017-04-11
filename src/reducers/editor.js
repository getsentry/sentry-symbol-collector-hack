import { CRASHREPORT_CHANGED, CRASHREPORT_UPLOAD, SYMBOLICATED_CRASHREPORT } from 'constants/action-types';
import request from 'superagent';

const code = '// Paste your Apple crash report here\n' +
    '// OR\n' +
    '// Drag & Drop your crash report';

const initialState = {
  code,
};

function symbolicateCrashReport(action) {
  request
    .post('http://localhost:8181/api/crashreport')
    .send({ crashreport: action.code })
    .set('Accept', 'application/json')
    .end((err, res) => {
      if (err) return; // TODO show nice error message
      action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res })
    });
}

function uploadCrashReport(action) {
  action.files.forEach((file) => {
    request
      .post('http://localhost:8181/api/crashreport/upload')
      .attach('crashreport', file)
      .end((err, res) => {
        if (err) return; // TODO show nice error message
        action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res })
      });
  });
}

export default function editor(state = initialState, action) {
  switch (action.type) {
    case CRASHREPORT_CHANGED:
      symbolicateCrashReport(action);
      return Object.assign({}, state, {
        code: action.code
      });
    case CRASHREPORT_UPLOAD:
      uploadCrashReport(action);
      return {...state};
    case SYMBOLICATED_CRASHREPORT:
      state.code = action.response.text;
      return Object.assign({}, state, {
        code: action.response.text
      });
    default:
      return state;
  }
}
