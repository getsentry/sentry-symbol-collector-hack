import { CRASHREPORT_CHANGED, CRASHREPORT_UPLOAD } from 'constants/action-types';

export function changeCrashReport(code) {
  return {
    type: CRASHREPORT_CHANGED,
    code
  };
}

export function uploadCrashReport(files) {
 return {
    type: CRASHREPORT_UPLOAD,
    files
  };
}

export default { changeCrashReport, uploadCrashReport };
