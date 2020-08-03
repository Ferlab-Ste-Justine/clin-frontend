/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';

import * as actions from '../actions/type';

export const initialPatientSubmissionState = {
  patient: {
    name: [
      {
        family: '',
        given: [],
      },
    ],
    gender: '',
    birthDate: '',
  },
  clinicalImpression: {
    investigation: [
      {
        item: [],
      },
    ],
  },
};

export const patientSubmissionShape = {
  data: PropTypes.shape({}),
};

const patientSubmissionReducer = (
  state = Object.assign({}, initialPatientSubmissionState),
  action,
) => produce(state, (draft) => {
  switch (action.type) {
    case actions.PATIENT_SUBMISSION_SAVE_SUCCEEDED:
      draft.patient = { ...draft.patient, ...action.payload.patient };
      draft.serviceRequest = { ...draft.serviceRequest, ...action.payload.serviceRequest };

      draft.clinicalImpression = {
        ...draft.clinicalImpression,
        ...action.payload.clinicalImpression,
        investigation: !action.payload.observations
          ? { ...draft.clinicalImpression.investigation }
          : [
            {
              item: action.payload.observations.map((item, index) => ({
                ...draft.clinicalImpression.investigation[0].item[index], ...item,
              })),
            },
          ],
      };
      break;
    default:
      break;
  }
});

export default patientSubmissionReducer;
