import Http from './http-client';
import { createPatientBundle } from './fhir/fhir';

// import { createSavePatientBundle } from './fhir_back';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

const getPatientById = uid => Http.secureClinAxios.get(`${window.CLIN.patientServiceApiUrl}/${uid}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientsByAutoComplete = (type, query, page, size) => Http.secureClinAxios.get(
  `${window.CLIN.patientServiceApiUrl}/autocomplete`, {
    params: {
      type,
      query,
      page,
      size,
    },
  },
)
  .then(successCallback)
  .catch(errorCallback);

const searchPatients = (query, page, size) => Http.secureClinAxios.get(`${window.CLIN.patientServiceApiUrl}/search`, {
  params: {
    query,
    page,
    size,
  },
})
  .then(successCallback)
  .catch(errorCallback);

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const getVariantDetails = id => Http.secureClinAxios.get(`${window.CLIN.variantServiceApiUrl}/${id}`)
  .then(successCallback)
  .catch(errorCallback);

const getVariantSchema = () => Http.secureClinAxios.get(`${window.CLIN.variantServiceApiUrl}/schema`)
  .then(successCallback)
  .catch(errorCallback);

const searchVariantsForPatient = (patient, statement, query, page, size, group) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/search`, {
  patient,
  statement,
  query,
  page,
  size,
  group,
})
  .then(successCallback)
  .catch(errorCallback);

const searchFacetsForPatient = (patient, statement, query) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/facet`, {
  patient,
  statement,
  query,
})
  .then(successCallback)
  .catch(errorCallback);

const countVariantsForPatient = (patient, statement, queries) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/count`, {
  patient,
  statement,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const getStatements = () => Http.secureClinAxios.get(`${window.CLIN.metaServiceApiUrl}/statement`, {})
  .then(successCallback)
  .catch(errorCallback);

const createStatement = (title, description, queries) => Http.secureClinAxios.post(`${window.CLIN.metaServiceApiUrl}/statement`, {
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const updateStatement = (uid, title, description, queries) => Http.secureClinAxios.put(`${window.CLIN.metaServiceApiUrl}/statement`, {
  uid,
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const deleteStatement = uid => Http.secureClinAxios.delete(`${window.CLIN.metaServiceApiUrl}/statement`, {
  data: { uid },
})
  .then(successCallback)
  .catch(errorCallback);

const getUserProfile = () => Http.secureClinAxios.get(`${window.CLIN.metaServiceApiUrl}/profile`, {})
  .then(successCallback)
  .catch(errorCallback);

const createUserProfile = (defaultStatement = '', patientTableConfig = {}, variantTableConfig = {}) => Http.secureClinAxios.post(`${window.CLIN.metaServiceApiUrl}/profile`, {
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

const updateUserProfile = (uid, defaultStatement, patientTableConfig = {}, variantTableConfig = {}) => Http.secureClinAxios.put(`${window.CLIN.metaServiceApiUrl}/profile`, {
  uid,
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

const convertToExcelData = data => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/xl`, data)
  .then(successCallback)
  .catch(errorCallback);

const getGeneAutocomplete = (query, type) => Http.secureClinAxios.get(
  `${window.CLIN.geneServiceApiUrl}/autocomplete`, {
    params: {
      type,
      query,
    },
  },
)
  .then(successCallback)
  .catch(errorCallback);

const savePatient = (patient) => {
  const data = createPatientBundle(patient);
  return Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/?_format=json&_pretty=true`, data)
    .then(successCallback)
    .catch(errorCallback);
};

const updatePatient = (patient, serviceRequest) => {
  const data = createPatientBundle(patient, serviceRequest);
  return Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/?_format=json&_pretty=true`, data)
    .then(successCallback)
    .catch(errorCallback);
};

export default {
  getPatientById,
  getPatientsByAutoComplete,
  searchPatients,
  getVariantDetails,
  getVariantSchema,
  searchVariantsForPatient,
  searchFacetsForPatient,
  countVariantsForPatient,
  getStatements,
  createStatement,
  updateStatement,
  deleteStatement,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  convertToExcelData,
  getGeneAutocomplete,
  savePatient,
  updatePatient,
};
