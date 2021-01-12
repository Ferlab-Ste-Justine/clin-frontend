import {
  all, put, debounce, takeLatest, select,
} from 'redux-saga/effects';

import { get } from 'lodash';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';

function* fetch(action) {
  try {
    const patientDataResponse = yield Api.getPatientDataById(action.payload.uid);
    if (patientDataResponse.error) {
      throw new ApiError(patientDataResponse.error);
    }
    const practitionersDatePresponse = yield Api.getPractitionersData(patientDataResponse.payload.data);

    yield put({
      type: actions.PATIENT_FETCH_SUCCEEDED,
      payload: {
        patientData: patientDataResponse.payload.data,
        practitionersData: practitionersDatePresponse.payload.data,
      },
    });
  } catch (e) {
    yield put({ type: actions.PATIENT_FETCH_FAILED, payload: e });
  }
}

function* autoComplete(action) {
  const isAutocomplete = action.payload.type === 'partial';
  try {
    if (!isAutocomplete) {
      yield put({ type: actions.START_SUBLOADING_ANIMATION });
    } else if (!action.payload.query) {
      const emptyPayload = {
        data: {
          data: {
            hits: [],
          },
        },
      };

      yield put({ type: actions.PATIENT_AUTOCOMPLETE_SUCCEEDED, payload: emptyPayload });
      return;
    }

    const response = yield Api.getPatientsByAutoComplete(
      action.payload.type,
      action.payload.query,
      action.payload.page,
      action.payload.size,
    );

    if (response.error) {
      throw new ApiError(response.error);
    }
    if (!isAutocomplete) {
      yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: response.payload });
    } else {
      yield put({ type: actions.PATIENT_AUTOCOMPLETE_SUCCEEDED, payload: response.payload });
    }
  } catch (e) {
    if (!isAutocomplete) {
      yield put({ type: actions.PATIENT_SEARCH_FAILED });
    } else {
      yield put({ type: actions.PATIENT_AUTOCOMPLETE_FAILED, payload: e });
    }
  }
}

function* search(action) {
  try {
    let response = null;

    if (!action.payload.query) {
      response = yield Api.searchPatients(null, action.payload.page, action.payload.size);
    } else {
      response = yield Api.searchPatients(action.payload.query, action.payload.page, action.payload.size);
    }
    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.PATIENT_SEARCH_SUCCEEDED, payload: response.payload });
  } catch (e) {
    yield put({ type: actions.PATIENT_SEARCH_FAILED, payload: e });
  }
}

function* prescriptionChangeStatus(action) {
  try {
    const serviceRequestToUpdate = yield select((state) => state.patient.prescriptions.find(
      (prescription) => prescription.original.id === action.payload.serviceRequestId,
    ));

    const result = yield Api.updateServiceRequestStatus(serviceRequestToUpdate.original, action.payload.status);

    yield put({
      type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_SUCCEEDED,
      payload: {
        serviceRequestId: result.payload.data.id,
        status: result.payload.data.status,
      },
    });
  } catch (e) {
    yield put({ type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_FAILED, payload: e });
  }
}

function* fetchInfosByRamq(action) {
  try {
    const response = yield Api.getPatientByRamq(action.payload.ramq);

    if (response.error != null) {
      throw new ApiError(response.error);
    }

    const identifiers = get(response, 'payload.data.entry[0].resource.identifier', []);
    const identifier = identifiers.find((id) => get(id, 'type.coding[0].code', '') === 'JHN');

    if (identifier == null || identifier.value !== action.payload.ramq) {
      throw new ApiError(`Patient with RAMQ[${action.payload.ramq} not found.`);
    }

    yield put({
      type: actions.PATIENT_FETCH_INFO_BY_RAMQ_SUCCEEDED,
      payload: response.payload,
    });
  } catch (error) {
    yield put({ type: actions.PATIENT_FETCH_INFO_BY_RAMQ_FAILED });
  }
}

function* watchPatientFetch() {
  yield takeLatest(actions.PATIENT_FETCH_REQUESTED, fetch);
}

function* debouncePatientAutoComplete() {
  yield debounce(250, actions.PATIENT_AUTOCOMPLETE_REQUESTED, autoComplete);
}

function* watchPatientSearch() {
  yield takeLatest(actions.PATIENT_SEARCH_REQUESTED, search);
}

function* watchPrescriptionChangeStatus() {
  yield takeLatest(actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_REQUESTED, prescriptionChangeStatus);
}

function* watchFetchInfosByRamq() {
  yield takeLatest(actions.PATIENT_FETCH_INFO_BY_RAMQ, fetchInfosByRamq);
}

export default function* watchedPatientSagas() {
  yield all([
    watchPatientFetch(),
    debouncePatientAutoComplete(),
    watchPatientSearch(),
    watchPrescriptionChangeStatus(),
    watchFetchInfosByRamq(),
  ]);
}
