import * as actions from './type';

type Action = (...args:any) => {type: keyof typeof actions, payload?: any};

export const autoCompletePatients: Action = (type: string, query: any, page: number, size: number) => ({
  type: actions.PATIENT_AUTOCOMPLETE_REQUESTED,
  payload: {
    type: type || 'partial',
    query: query || null,
    page: page || 1,
    size: size || 25,
  },
});

export const autoCompletePatientsSelected: Action = () => ({
  type: actions.PATIENT_AUTOCOMPLETE_SELECTED,
  payload: {},
});

export const searchPatientsByQuery: Action = (query: any, page: number, size: number) => ({
  type: actions.PATIENT_SEARCH_REQUESTED,
  payload: {
    query: query || null,
    page: page || 1,
    size: size || 25,
  },
});

export const updateServiceRequestStatus: Action = (serviceRequestId: string, newStatus: string, note: string) => ({
  type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_CHANGE_STATUS_REQUESTED,
  payload: {
    serviceRequestId,
    status: newStatus,
    note,
  },
});

export const getPatientByRamq: Action = (ramq: string) => ({
  type: actions.PATIENT_FETCH_INFO_BY_RAMQ,
  payload: { ramq },
});

export const changeSearchType: Action = (type: string) => ({
  type: actions.CHANGE_SEARCH_TYPE_REQUESTED,
  payload: {
    type,
  },
});
