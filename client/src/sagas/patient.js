import {
  all, put, debounce, takeLatest, select,
} from 'redux-saga/effects';
import get from 'lodash/get';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';
import { getExtension } from '../helpers/fhir/builder/Utils';

const getIdsFromPatient = (data) => {
  const patient = get(data, 'entry[0].resource.entry[0].resource');

  if (patient == null || patient.id == null) {
    throw new Error(`Invalid patient [${patient}]`);
  }
  const ids = [patient.id];

  const extension = getExtension(patient, 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation');
  const externalReference = get(extension, 'extension[0].valueReference.reference');

  if (externalReference != null) {
    ids.push(externalReference.split('/')[1]);
  }

  return ids;
};
const FETUS_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus';
const FAMILY_REL_EXT_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation';

const extractPatientResource = (response) => get(response, 'payload.data.entry[0].resource.entry[0].resource');

const getParentIfFetus = async (response) => {
  const patient = extractPatientResource(response);
  const isFetusExt = getExtension(patient, FETUS_EXT_URL);
  if (isFetusExt != null && isFetusExt.valueBoolean) {
    const familyRelationExt = getExtension(patient, FAMILY_REL_EXT_URL);
    const familyRelSubjectExt = getExtension(familyRelationExt, 'subject');
    const idParts = get(familyRelSubjectExt, 'valueReference.reference', '').split('/');

    if (idParts.length > 1) {
      const parentRes = await Api.getPatientById(idParts[1]);
      return get(parentRes, 'payload.data.data');
    }
  }
  return undefined;
};

function* fetch(action) {
  try {
    const patientDataResponse = yield Api.getPatientDataById(action.payload.uid);
    if (patientDataResponse.error) {
      throw new ApiError(patientDataResponse.error);
    }

    const [parent, practitionersDataResponse, canEditResponse] = yield Promise.all([
      getParentIfFetus(patientDataResponse),
      Api.getPractitionersData(patientDataResponse.payload.data),
      Api.canEditPatients(getIdsFromPatient(patientDataResponse.payload.data)),
    ]);

    yield put({
      type: actions.PATIENT_FETCH_SUCCEEDED,
      payload: {
        patientData: patientDataResponse.payload.data,
        practitionersData: practitionersDataResponse.payload.data,
        canEdit: canEditResponse.payload.data.data.result,
        parent,
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
    const searchState = yield select((state) => state.search);

    const searchType = searchState.type;
    const page = action.payload.page || get(searchState, 'patients.page', 1);
    const size = action.payload.size || get(searchState, 'patients.pageSize', 25);

    if (!action.payload.query) {
      response = yield Api.searchPatients(null, page, size, searchType);
    } else {
      response = yield Api.searchPatients(action.payload.query, page, size);
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

    const user = yield select((state) => state.user);
    const patient = yield select((state) => state.patient.patient.original);

    const result = yield Api.updateServiceRequestStatus(
      user, serviceRequestToUpdate.original, action.payload.status, action.payload.note,
    );

    yield put({
      type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_SUCCEEDED,
      payload: {
        serviceRequestId: result.payload.data.id,
        status: result.payload.data.status,
      },
    });
    yield put({ type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED, payload: { uid: patient.id, reload: true } });
  } catch (e) {
    yield put({ type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_FAILED, payload: e });
  }
}

function* watchPatientFetch() {
  yield takeLatest(actions.PATIENT_FETCH_REQUESTED, fetch);
}

function* debouncePatientAutoComplete() {
  yield debounce(250, actions.PATIENT_AUTOCOMPLETE_REQUESTED, autoComplete);
}

function* watchPatientSearch() {
  yield takeLatest([
    actions.PATIENT_SEARCH_REQUESTED,
    actions.CHANGE_SEARCH_TYPE_REQUESTED,
  ], search);
}

function* watchPrescriptionChangeStatus() {
  yield takeLatest(actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_REQUESTED, prescriptionChangeStatus);
}

export default function* watchedPatientSagas() {
  yield all([
    watchPatientFetch(),
    debouncePatientAutoComplete(),
    watchPatientSearch(),
    watchPrescriptionChangeStatus(),
  ]);
}
