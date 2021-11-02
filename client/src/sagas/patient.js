import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { all, debounce, put, select, takeLatest } from 'redux-saga/effects';

import { ExtensionUrls } from 'store/urls';

import * as actions from '../actions/type';
import Api, { ApiError } from '../helpers/api';
import { updatePatient } from '../helpers/fhir/api/UpdatePatient';
import { getExtension } from '../helpers/fhir/builder/Utils';
import { isMemberAloneInGroupBundle } from '../helpers/fhir/familyMemberHelper';
import { isAlreadyProband, makeExtensionProband } from '../helpers/fhir/patientHelper';
import {
  getFamilyMembersFromPatientDataResponse,
  removeSpecificFamilyRelation,
} from '../helpers/patient';
import { DataExtractor } from '../helpers/providers/extractor';
import { FamilyActionStatus } from '../reducers/patient';

const getIdsFromPatient = (data) => {
  const patient = get(data, 'entry[0].resource.entry[0].resource');

  if (patient == null || patient.id == null) {
    throw new Error(`Invalid patient [${patient}]`);
  }
  const ids = [patient.id];

  const extension = getExtension(
    patient,
    'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
  );
  const externalReference = get(extension, 'extension[0].valueReference.reference');

  if (externalReference != null) {
    ids.push(externalReference.split('/')[1]);
  }

  return ids;
};

const getSupervisorIdsFromPatient = (data) => {
  try {
    const dataExtractor = new DataExtractor({ patientData: data });
    const serviceRequests = dataExtractor
      .extractBundle('ServiceRequest')
    const ids = uniq(
      serviceRequests?.entry?.map((e) => e.resource).flatMap((sr) => {
        const ext = dataExtractor.getExtension(sr, ExtensionUrls.ResidentSupervisor);
        const ref = get(ext, 'valueReference.reference');
        return ref ? ref.split('/')[1] : [];
      }),
    );
    return ids;
  } catch (e) {
    console.warn('Failed to extract supervisors from patient', e);
    return [];
  }
};

const buildPtIdToGrMemStatusCode = (rawResponse) =>
  !rawResponse || rawResponse.length === 0
    ? {}
    : rawResponse.reduce((accumulator, entityAndExtension) => {
        const ref = entityAndExtension?.entity?.reference || '';
        const splitRef = ref.split('/');
        const indexOfId = 1;
        const id = splitRef[indexOfId];
        if (!id) {
          return accumulator;
        }
        const code = (entityAndExtension?.extension || []).find((ext) =>
          (ext?.url || '').endsWith('/group-member-status'),
        )?.valueCoding?.code;
        if (!code) {
          return accumulator;
        }
        return {
          ...accumulator,
          [id]: code,
        };
      }, {});

const getFamily = async (patientDataResponse) => {
  const familyMembersFromPatientResponse =
    getFamilyMembersFromPatientDataResponse(patientDataResponse);

  const familyMemberIds = familyMembersFromPatientResponse.map(
    (member) => member.entity.reference.split('/')[1],
  );

  if (familyMemberIds.length === 0) {
    return null;
  }

  const ptIdToGrMemStatusCode = buildPtIdToGrMemStatusCode(familyMembersFromPatientResponse);

  const response = await Api.getPatientDataByIds(familyMemberIds, false);

  return get(response, 'payload.data.entry', []).map((entry) => {
    const guessedPatientId = entry?.resource?.entry[0]?.resource?.id;
    return {
      entry: {
        groupMemberStatusCode: ptIdToGrMemStatusCode[guessedPatientId],
        resource: entry.resource,
      },
    };
  });
};

function* updateParentGroup(parentId, newGroupId) {
  const patientDataResponse = yield Api.getPatientDataById(parentId);

  const parentPatientData = get(
    patientDataResponse,
    'payload.data.entry[0].resource.entry[0].resource',
  );
  if (parentPatientData == null) {
    throw new Error(`updateParentGroup:: Did not find a patient with id [${parentId}]`);
  }

  const groupDataResponse = yield Api.getGroupByMemberId(parentId);
  const parentGroupData = get(groupDataResponse, 'payload.data.entry[0].resource');

  const patients = [];
  if (parentGroupData != null) {
    const membersResponse = yield Api.getGroupMembers(parentGroupData);
    const entries = get(membersResponse, 'payload.data.entry', []);
    entries
      .filter((entry) => entry.resource != null)
      .forEach((entry) => patients.push(entry.resource));
  } else {
    patients.push(parentPatientData);
  }

  return yield Api.updatePatientsGroup(patients, newGroupId);
}

function* fetch(action) {
  try {
    const patientDataResponse = yield Api.getPatientDataById(action.payload.uid);
    if (patientDataResponse.error) {
      const error = new ApiError(patientDataResponse.error);
      yield put({ payload: error, type: actions.PATIENT_FETCH_FAILED });
      return;
    }

    const supervisorIds = getSupervisorIdsFromPatient(patientDataResponse.payload.data);
    const supervisorsPromise = supervisorIds?.length
      ? Api.getPractitionerByIds(supervisorIds)
      : Promise.resolve();

    const [familyResponse, practitionersDataResponse, canEditResponse, supervisorsResponse] =
      yield Promise.all([
        getFamily(patientDataResponse, action.payload.uid),
        Api.getPractitionersData(patientDataResponse.payload.data),
        Api.canEditPatients(getIdsFromPatient(patientDataResponse.payload.data)),
        supervisorsPromise,
      ]);

    yield put({
      payload: {
        canEdit: canEditResponse.payload.data.data.result,
        family: familyResponse,
        patientData: patientDataResponse.payload.data,
        practitionersData: practitionersDataResponse.payload?.data,
        supervisors: supervisorsResponse?.payload?.data,
      },
      type: actions.PATIENT_FETCH_SUCCEEDED,
    });
  } catch (e) {
    console.error('patient.fetch', e);
    yield put({ payload: e, type: actions.PATIENT_FETCH_FAILED });
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

      yield put({ payload: emptyPayload, type: actions.PATIENT_AUTOCOMPLETE_SUCCEEDED });
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
      yield put({ payload: response.payload, type: actions.PATIENT_SEARCH_SUCCEEDED });
    } else {
      yield put({ payload: response.payload, type: actions.PATIENT_AUTOCOMPLETE_SUCCEEDED });
    }
  } catch (e) {
    if (!isAutocomplete) {
      yield put({ type: actions.PATIENT_SEARCH_FAILED });
    } else {
      yield put({ payload: e, type: actions.PATIENT_AUTOCOMPLETE_FAILED });
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
    yield put({ payload: response.payload, type: actions.PATIENT_SEARCH_SUCCEEDED });
  } catch (e) {
    yield put({ payload: e, type: actions.PATIENT_SEARCH_FAILED });
  }
}

function* prescriptionChangeStatus(action) {
  try {
    const serviceRequestToUpdate = yield select((state) =>
      state.patient.prescriptions.find(
        (prescription) => prescription.original.id === action.payload.serviceRequestId,
      ),
    );

    const user = yield select((state) => state.user);
    const patient = yield select((state) => state.patient.patient.original);

    const result = yield Api.updateServiceRequestStatus(
      user,
      serviceRequestToUpdate.original,
      action.payload.status,
      action.payload.note,
    );

    yield put({
      payload: {
        serviceRequestId: result.payload.data.id,
        status: result.payload.data.status,
      },
      type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_SUCCEEDED,
    });
    yield put({
      payload: { reload: true, uid: patient.id },
      type: actions.NAVIGATION_PATIENT_SCREEN_REQUESTED,
    });
  } catch (e) {
    yield put({
      payload: e,
      type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_FAILED,
    });
  }
}

function* addParent(action) {
  yield put({
    payload: FamilyActionStatus.addMemberInProgress,
    type: actions.PATIENT_ADD_PARENT_ACTION_STATUS,
  });

  const { callback, familyId: parentFamilyId, parentId, parentType, status } = action.payload;
  const parsedPatient = yield select((state) => state.patient.patient.parsed);
  const originalPatient = yield select((state) => state.patient.patient.original);

  let sagaStatus = {
    isSuccess: false,
    messageKey: 'screen.patient.details.family.add.error',
  };

  try {
    const parentGroups = yield Api.getGroupById(parentFamilyId);
    if (parentGroups.error) {
      return;
    }

    const canAddParent = isMemberAloneInGroupBundle(
      parentId,
      parentFamilyId,
      parentGroups.payload?.data,
    );
    if (!canAddParent) {
      sagaStatus = {
        ...sagaStatus,
        isSuccess: false,
        messageKey: 'screen.patient.details.family.add.parentIsAlreadyInAFamily',
      };
      return;
    }

    const patientToUpdate = { ...originalPatient };

    patientToUpdate.extension = [
      ...patientToUpdate.extension,
      {
        extension: [
          {
            url: 'subject',
            valueReference: { reference: `Patient/${parentId}` },
          },
          {
            url: 'relation',
            valueCodeableConcept: {
              coding: [
                {
                  code: parentType,
                  system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                },
              ],
            },
          },
        ],
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
      },
    ];

    yield updatePatient(patientToUpdate);
    yield updateParentGroup(parentId, parsedPatient.familyId);
    yield Api.addOrUpdatePatientToGroup(parsedPatient.familyId, parentId, status);
    yield Api.deleteGroup(parentFamilyId);

    sagaStatus = {
      ...sagaStatus,
      isSuccess: true,
      messageKey: 'screen.patient.details.family.add.success',
    };
    yield put({ payload: { uid: parsedPatient.id }, type: actions.PATIENT_ADD_PARENT_SUCCEEDED });
  } catch (e) {
    console.error('addParent', e);
  } finally {
    if (callback) {
      yield callback(sagaStatus);
    }
    yield put({ payload: null, type: actions.PATIENT_ADD_PARENT_ACTION_STATUS });
  }
}

function* removeParent(action) {
  const { callback, parentId } = action.payload;

  yield put({
    payload: FamilyActionStatus.removeMemberInProgress,
    type: actions.PATIENT_REMOVE_PARENT_ACTION_STATUS,
  });

  let isSuccess = false;
  try {
    const patientParsed = yield select((state) => state.patient.patient.parsed);
    const currentGroupId = patientParsed.familyId;
    const originalPatient = yield select((state) => state.patient.patient.original);
    const patientToUpdate = { ...originalPatient };

    const parentCurrentData = yield Api.getPatientDataById(parentId);
    if (parentCurrentData.error) {
      return;
    }

    const parentCurrentPatientBundleResource =
      (parentCurrentData?.payload?.data?.entry || [])[0]?.resource || {};
    const parentCurrentPatientBundleEntry = (parentCurrentPatientBundleResource?.entry || []).find(
      (entry) => entry?.fullUrl?.endsWith(`/Patient/${parentId}`),
    );
    const parentCurrentPatientResource = parentCurrentPatientBundleEntry?.resource || {};
    const parentCurrentPatientExtensions = parentCurrentPatientResource?.extension || [];
    if (isAlreadyProband(parentCurrentPatientExtensions)) {
      return;
    }

    //we already have group data here, no need to make another server call a bit later.
    const currentGroupResourceBundle = (parentCurrentData.payload?.data?.entry || [])[1];
    const currentGroupResource = currentGroupResourceBundle?.resource?.entry?.find((entry) =>
      entry?.fullUrl?.endsWith(`/Group/${currentGroupId}`),
    )?.resource;

    if (!currentGroupResource) {
      return;
    }

    const newGroupResponseForParent = yield Api.createGroup(parentId);
    if (newGroupResponseForParent.error) {
      return;
    }

    const newMembers = currentGroupResource.member.filter(
      (member) => !member.entity.reference.includes(parentId),
    );
    const currentGroupWithoutParent = { ...currentGroupResource, member: newMembers };
    const updateGroupResponse = yield Api.updateGroup(currentGroupId, currentGroupWithoutParent);
    if (updateGroupResponse.error) {
      return;
    }

    const patientToUpdateExtension = patientToUpdate.extension;
    patientToUpdate.extension = removeSpecificFamilyRelation(parentId, patientToUpdateExtension);
    const updatePatientResponse = yield updatePatient(patientToUpdate);
    if (updatePatientResponse.error) {
      return;
    }

    const updatedParentPatientToCommit = {
      ...parentCurrentPatientResource,
      extension: makeExtensionProband(parentCurrentPatientExtensions),
    };

    const updateParentResponse = yield updatePatient(updatedParentPatientToCommit);
    if (updateParentResponse.error) {
      return;
    }

    isSuccess = true;
    yield put({
      payload: { uid: patientParsed.id },
      type: actions.PATIENT_REMOVE_PARENT_SUCCEEDED,
    });
  } catch (e) {
    console.error('removeParent', e);
    yield put({ payload: e, type: actions.PATIENT_REMOVE_PARENT_FAILED });
  } finally {
    if (callback) {
      yield callback(isSuccess);
    }
    yield put({ payload: null, type: actions.PATIENT_REMOVE_PARENT_ACTION_STATUS });
  }
}

function* updateParentStatus(action) {
  const { parentId, status } = action.payload;
  try {
    const parsedPatient = yield select((state) => state.patient.patient.parsed);
    yield Api.addOrUpdatePatientToGroup(parsedPatient.familyId, parentId, status);
    yield put({
      payload: { parentId, status },
      type: actions.PATIENT_UPDATE_PARENT_STATUS_SUCCEEDED,
    });
  } catch (error) {
    console.error('updateParentStatus', error);
    yield put({ payload: { error, parentId }, type: actions.PATIENT_UPDATE_PARENT_STATUS_FAILED });
  }
}

function* getFileURL(action) {
  try {
    const { file } = action.payload;
    const fileURL = yield Api.getFileURL(file);
    if (fileURL.error) {
      throw new ApiError(fileURL.error);
    }
    window.open(fileURL.payload.data.url, '_blank');
    yield put({ payload: { uid: fileURL }, type: actions.PATIENT_FILE_URL_SUCCEEDED });
  } catch (e) {
    yield put({ payload: e, type: actions.PATIENT_FILE_URL_FAILED });
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
  yield takeLatest(
    [
      actions.PATIENT_FETCH_REQUESTED,
      actions.PATIENT_ADD_PARENT_SUCCEEDED,
      actions.PATIENT_REMOVE_PARENT_SUCCEEDED,
    ],
    fetch,
  );
}

function* debouncePatientAutoComplete() {
  yield debounce(250, actions.PATIENT_AUTOCOMPLETE_REQUESTED, autoComplete);
}

function* watchPatientSearch() {
  yield takeLatest(
    [actions.PATIENT_SEARCH_REQUESTED, actions.CHANGE_SEARCH_TYPE_REQUESTED],
    search,
  );
}

function* watchPrescriptionChangeStatus() {
  yield takeLatest(
    actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_REQUESTED,
    prescriptionChangeStatus,
  );
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
