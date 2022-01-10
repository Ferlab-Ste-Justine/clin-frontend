import { message } from 'antd';
import moment from 'moment';
import intl from 'react-intl-universal';
import {
  all, put, takeLatest,
} from 'redux-saga/effects';
import {
  NANUQ_EXPORT_FAILED, NANUQ_EXPORT_INVALID, NANUQ_EXPORT_REQUESTED, NANUQ_EXPORT_SUCCEEDED,
} from '../actions/type';
import { generateExport } from '../helpers/nanuq/nanuq';
import FileDownload from 'helpers/FileDownload';

function downloadJSONFile(content: string, filename: string) {
  const fileBlob = new Blob([content], { type: 'text/json' });
  FileDownload(fileBlob, filename);
}

function* generateNanuqReport(action: {type: 'NANUQ_EXPORT_REQUESTED', payload: string[]}) {
  const hideMessage = message.loading(intl.get('screen.patientsearch.nanuqexport.process'));
  try {
    const report = generateExport(action.payload);
    downloadJSONFile(JSON.stringify(report, null, 2), `${moment().format('yyyy-MM-DD')}-clin-nanuq.json`);
    yield put({ type: NANUQ_EXPORT_SUCCEEDED });
  } catch (e) {
    if (e.message === 'invalid_data') {
      yield put({ type: NANUQ_EXPORT_INVALID });
    } else {
      yield put({ type: NANUQ_EXPORT_FAILED });
    }
  }
  hideMessage();
}

function* watchGenerateNanuqReport() {
  yield takeLatest(NANUQ_EXPORT_REQUESTED, generateNanuqReport);
}

export default function* watchedNanuqReportSagas() {
  yield all([watchGenerateNanuqReport()]);
}
