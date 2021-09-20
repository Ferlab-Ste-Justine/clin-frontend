import {
  all, put, debounce, takeLatest, select,
} from 'redux-saga/effects';
import get from 'lodash/get';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';
import { getExtension } from '../helpers/fhir/builder/Utils';
import { updatePatient } from '../helpers/fhir/api/UpdatePatient';
import { getFamilyMembersFromPatientDataResponse } from '../helpers/patient';

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

const getFamily = async (patientDataResponse, mainPatientId) => {
  // Remove "mainPatientId" since we already have all of their details and we don't want to fetch it in double
  const otherFamilyMemberIds = getFamilyMembersFromPatientDataResponse(patientDataResponse)
    .filter((member) => !member.entity.reference.includes(mainPatientId))
    .map((member) => ({
      id: member.entity.reference.split('/')[1],
      statusCode: get(member, 'extension[0].valueCoding.code', 'UNK'),
    }));

  if (otherFamilyMemberIds.length === 0) {
    return null;
  }
  const response = await Api.getPatientDataByIds(otherFamilyMemberIds.map((member) => member.id), false);

  return get(response, 'payload.data.entry', []).map((entry, index) => ({
    entry,
    statusCode: otherFamilyMemberIds[index].statusCode,
  }));
};

function* updateParentGroup(parentId, newGroupId) {
  const patientDataResponse = yield Api.getPatientDataById(parentId);

  const parentPatientData = get(patientDataResponse, 'payload.data.entry[0].resource.entry[0].resource');
  if (parentPatientData == null) {
    throw new Error(`updateParentGroup:: Did not find a patient with id [${parentId}]`);
  }

  const groupDataResponse = yield Api.getGroupByMemberId(parentId);
  const parentGroupData = get(groupDataResponse, 'payload.data.entry[0].resource');

  const patients = [];
  if (parentGroupData != null) {
    const membersResponse = yield Api.getGroupMembers(parentGroupData);
    const entries = get(membersResponse, 'payload.data.entry', []);
    entries.filter((entry) => entry.resource != null).forEach((entry) => patients.push(entry.resource));
  } else {
    patients.push(parentPatientData);
  }

  return Api.updatePatientsGroup(patients, newGroupId);
}

function* fetch(action) {
  try {
    const patientDataResponse = yield Api.getPatientDataById(action.payload.uid);
    if (patientDataResponse.error) {
      const error = new ApiError(patientDataResponse.error);
      yield put({ type: actions.PATIENT_FETCH_FAILED, payload: error });
      return;
    }

    const [familyResponse, practitionersDataResponse, canEditResponse] = yield Promise.all([
      getFamily(patientDataResponse, action.payload.uid),
      Api.getPractitionersData(patientDataResponse.payload.data),
      Api.canEditPatients(getIdsFromPatient(patientDataResponse.payload.data)),
    ]);

    yield put({
      type: actions.PATIENT_FETCH_SUCCEEDED,
      payload: {
        patientData: patientDataResponse.payload.data,
        practitionersData: practitionersDataResponse.payload?.data,
        canEdit: canEditResponse.payload.data.data.result,
        family: familyResponse,
      },
    });
  } catch (e) {
    console.error('patient.fetch', e);
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

function* addParent(action) {
  try {
    const { parentId, parentType, status } = action.payload;
    const parsedPatient = yield select((state) => state.patient.patient.parsed);
    const originalPatient = yield select((state) => state.patient.patient.original);

    const patientToUpdate = JSON.parse(JSON.stringify(originalPatient));

    patientToUpdate.extension.push({
      url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
      extension: [
        {
          url: 'subject',
          valueReference: { reference: `Patient/${parentId}` },
        },
        {
          url: 'relation',
          valueCodeableConcept: {
            coding: [{
              system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
              code: parentType,
            }],
          },
        },
      ],
    });

    yield updatePatient(patientToUpdate);
    yield updateParentGroup(parentId, parsedPatient.familyId);
    yield Api.addOrUpdatePatientToGroup(parsedPatient.familyId, parentId, status);

    yield put({ type: actions.PATIENT_ADD_PARENT_SUCCEEDED, payload: { uid: parsedPatient.id } });
  } catch (e) {
    console.error('addParent', e);
    yield put({ type: actions.PATIENT_ADD_PARENT_FAILED, payload: e });
  }
}

function* removeParent(action) {
  try {
    const { parentId } = action.payload;
    const patientParsed = yield select((state) => state.patient.patient.parsed);
    const originalPatient = yield select((state) => state.patient.patient.original);

    const patientToUpdate = JSON.parse(JSON.stringify(originalPatient));

    const extToDeleteIndex = patientToUpdate.extension.findIndex(
      (ext) => ((ext.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation')
        ? ext.extension.find((extension) => extension.url === 'subject')?.valueReference.reference.indexOf(parentId) != null
        : false
      ),
    );

    if (extToDeleteIndex !== -1) {
      const relationExt = patientToUpdate.extension[extToDeleteIndex].extension.find((ext) => ext.url === 'relation');
      const relation = get(relationExt, 'valueCodeableConcept.coding[0].code');

      if (relation != null) {
        patientToUpdate.extension = patientToUpdate.extension.filter((ext) => {
          if (ext.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation') {
            const extRelation = ext.extension.find((extension) => extension.url === 'relation');
            return get(extRelation, 'valueCodeableConcept.coding[0].code') !== relation;
          }
          return true;
        });
      } else {
        patientToUpdate.extension.splice(extToDeleteIndex, 1);
      }
    }

    const newGroupResponse = yield Api.createGroup(parentId);
    yield updatePatient(patientToUpdate);
    yield updateParentGroup(parentId, newGroupResponse.payload.data.id);
    yield Api.deletePatientFromGroup(patientParsed.familyId, parentId);

    yield put({ type: actions.PATIENT_REMOVE_PARENT_SUCCEEDED, payload: { uid: patientParsed.id } });
  } catch (e) {
    console.error('removeParent', e);
    yield put({ type: actions.PATIENT_REMOVE_PARENT_FAILED, payload: e });
  }
}

function* updateParentStatus(action) {
  try {
    const { parentId, status } = action.payload;
    const parsedPatient = yield select((state) => state.patient.patient.parsed);

    yield Api.addOrUpdatePatientToGroup(parsedPatient.familyId, parentId, status);

    yield put({ type: actions.PATIENT_UPDATE_PARENT_STATUS_SUCCEEDED, payload: { parentId, status } });
  } catch (error) {
    console.error('updateParentStatus', error);
    yield put({ type: actions.PATIENT_UPDATE_PARENT_STATUS_FAILED, payload: error });
  }
}

function* getFileURL(action) {
  try {
    const { file } = action.payload;
    const fileURL = yield Api.getFileURL(file);
    if (fileURL.error) {
      throw new ApiError(fileURL.error);
    }
    yield put({ type: actions.PATIENT_FILE_URL_SUCCEEDED, payload: { uid: fileURL } });
  } catch (e) {
    yield put({ type: actions.PATIENT_FILE_URL_FAILED, payload: e });
  }
}

function* watchAddParent() {
  yield takeLatest(actions.PATIENT_ADD_PARENT_REQUESTED, addParent);
}

function* watchUpdateParentStatus() {
  yield takeLatest(actions.PATIENT_UPDATE_PARENT_STATUS_REQUESTED, updateParentStatus);
}

function* watchRemoveParent() {
  yield takeLatest(actions.PATIENT_REMOVE_PARENT_REQUESTED, removeParent);
}

function* watchPatientFetch() {
  yield takeLatest([
    actions.PATIENT_FETCH_REQUESTED,
    actions.PATIENT_ADD_PARENT_SUCCEEDED,
    actions.PATIENT_REMOVE_PARENT_SUCCEEDED,
  ], fetch);
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

function* watchFile() {
  yield takeLatest(actions.PATIENT_FILE_URL_REQUESTED, getFileURL);
}

export default function* watchedPatientSagas() {
  yield all([
    watchPatientFetch(),
    debouncePatientAutoComplete(),
    watchPatientSearch(),
    watchPrescriptionChangeStatus(),
    watchAddParent(),
    watchRemoveParent(),
    watchUpdateParentStatus(),
    watchFile(),
  ]);
}
