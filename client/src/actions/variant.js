/* eslint-disable no-param-reassign, import/no-cycle */
import * as actions from './type';
import { DEFAULT_EMPTY_QUERY } from '../components/Query/index';


export const fetchSchema = () => ({
  type: actions.VARIANT_SCHEMA_REQUESTED,
});

export const selectQuery = (patient, query = DEFAULT_EMPTY_QUERY) => ({
  type: actions.PATIENT_VARIANT_QUERY_SELECTION,
  payload: {
    patient,
    query,
  },
});

export const updateQuery = (patient, type, value = DEFAULT_EMPTY_QUERY) => ({
  type: actions.PATIENT_VARIANT_QUERY_UPDATE,
  payload: {
    patient,
    value,
    type,
  },
});
