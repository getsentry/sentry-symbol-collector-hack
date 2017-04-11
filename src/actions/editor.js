import { CRASHREPORT_CHANGED, CRASHREPORT_UPLOAD, CRASHREPORT_CONVERT_ERROR } from 'constants/action-types';

export function changeCrashReport(crashReport) {
  return {
    type: CRASHREPORT_CHANGED,
    crashReport
  };
}

export function uploadCrashReport(files) {
 return {
    type: CRASHREPORT_UPLOAD,
    files
  };
}

export function handleConvertError(error) {
 return {
    type: CRASHREPORT_CONVERT_ERROR
  };
}


export default { changeCrashReport, uploadCrashReport, handleConvertError };
