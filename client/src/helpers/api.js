import axios from 'axios';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

axios.defaults.withCredentials = true;
axios.defaults.crossdomain = true;

const login = (username, password) => axios.post(`${window.CLIN.authServiceApiUrl}`, {
  username,
  password,
})
  .then(successCallback)
  .catch(errorCallback);

const logout = () => axios.delete(`${window.CLIN.authServiceApiUrl}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientById = uid => axios.get(`${window.CLIN.patientServiceApiUrl}/${uid}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientsByAutoComplete = (type, query, page, size) => axios.get(
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

const searchPatients = (query, page, size) => axios.get(`${window.CLIN.patientServiceApiUrl}/search`, {
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

const getVariantSchema = () => axios.get(`${window.CLIN.variantServiceApiUrl}/schema`)
  .then(successCallback)
  .catch(errorCallback);

const searchVariantsForPatient = (patient, statement, query, group, page, size) => axios.post(`${window.CLIN.variantServiceApiUrl}/search`, {
  patient,
  statement,
  query,
  group,
  page,
  size,
})
  .then(successCallback)
  .catch(errorCallback);

const countVariantsForPatient = (patient, statement, queries) => axios.post(`${window.CLIN.variantServiceApiUrl}/count`, {
  patient,
  statement,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const getStatements = () => axios.get(`${window.CLIN.metaServiceApiUrl}/statement`, {})
  .then(successCallback)
  .catch(errorCallback);

const createStatement = (title = '', description = '', queries = [], isDefault = false) => axios.post(`${window.CLIN.metaServiceApiUrl}/statement`, {
  title,
  description,
  queries,
  isDefault,
})
  .then(successCallback)
  .catch(errorCallback);

const updateStatement = (uid, title = '', description = '', queries, isDefault = false) => axios.put(`${window.CLIN.metaServiceApiUrl}/statement`, {
  uid,
  title,
  description,
  queries,
  isDefault,
})
  .then(successCallback)
  .catch(errorCallback);

const deleteStatement = uid => axios.delete(`${window.CLIN.metaServiceApiUrl}/statement`, {
  data: { uid },
})
  .then(successCallback)
  .catch(errorCallback);

export default {
  login,
  logout,
  getPatientById,
  getPatientsByAutoComplete,
  searchPatients,
  getVariantSchema,
  searchVariantsForPatient,
  countVariantsForPatient,
  getStatements,
  createStatement,
  updateStatement,
  deleteStatement,
};
