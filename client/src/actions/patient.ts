import { GroupMemberStatus } from '../helpers/fhir/patientHelper';
import { FamilyMemberType } from '../store/FamilyMemberTypes';

import * as actions from './type';

type Action = (...args: any) => { type: keyof typeof actions; payload?: any };

export const updateServiceRequestStatus: Action = (
  serviceRequestId: string,
  newStatus: string,
  note: string,
) => ({
  payload: {
    note,
    serviceRequestId,
    status: newStatus,
  },
  type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_REQUESTED,
});

export const getPatientByRamq: Action = (ramq: string) => ({
  payload: { ramq },
  type: actions.PATIENT_FETCH_INFO_BY_RAMQ,
});


type familyActionCb = ((isSuccess: boolean) => Promise<void> | void) | undefined;

export const addParentToFamily: Action = (
  parentId: string,
  familyId: string,
  parentType: FamilyMemberType,
  status: GroupMemberStatus,
  callback: familyActionCb,
) => ({
  payload: { callback, parentId, parentType, familyId, status },
  type: actions.PATIENT_ADD_PARENT_REQUESTED,
});

export const removeParentToFamily: Action = (parentId: string, callback: familyActionCb) => ({
  payload: { callback, parentId },
  type: actions.PATIENT_REMOVE_PARENT_REQUESTED,
});

export const updateParentStatusInFamily: Action = (
  parentId: string,
  status: GroupMemberStatus,
) => ({
  payload: {
    parentId,
    status,
  },
  type: actions.PATIENT_UPDATE_PARENT_STATUS_REQUESTED,
});

export const getPatientFileURL = (file: string) => ({
  payload: { file },
  type: actions.PATIENT_FILE_URL_REQUESTED,
});
