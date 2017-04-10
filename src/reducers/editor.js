import { UPDATE_CODE } from 'constants/action-types';
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
          console.log(res);
        });
      return { ...state };
    default:
      return state;
  }
}
