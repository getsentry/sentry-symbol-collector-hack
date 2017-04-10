import { UPDATE_CODE } from 'constants/action-types';

export function updateCode(code) {
  return {
    type: UPDATE_CODE,
    code
  };
}

export default { updateCode };
