import { UPDATE_CODE, SYMBOLICATED_CRASHREPORT } from 'constants/action-types';
import request from 'superagent';

const code = '// Paste your Apple crash report here\n' +
    '// OR\n' +
    '// Drag & Drop your crash report';

const initialState = {
  code,
};

export default function editor(state = initialState, action) {
  switch (action.type) {
    case UPDATE_CODE:
      request
        .post('http://localhost:8181/api/crashreport')
        .send({ crashreport: action.code })
        .set('Accept', 'application/json')
        .end(function(err, res){
          // console.log(res);
          action.asyncDispatch({ type: SYMBOLICATED_CRASHREPORT, response: res })
        });
      return { ...state };
    case SYMBOLICATED_CRASHREPORT:
      // console.log(action.response.text);
      state.code = action.response.text;
      return { ...state };
    default:
      return state;
  }
}
