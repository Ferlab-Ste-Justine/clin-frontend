import axios from 'axios';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

axios.defaults.withCredentials = true;
axios.defaults.crossdomain = true;
axios.defaults.headers.common['Cache-Control'] = 'no-cache';

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


// TODO getStatements
const getStatements = () => axios.get(`${window.CLIN.metaServiceApiUrl}/statement`, {})
  .then(successCallback)
  .catch(errorCallback);

// TODO createStatement
const createStatement = (queries, title, description = '') => axios.post(`${window.CLIN.metaServiceApiUrl}/statement`, {
  queries,
  title,
  description,
  isDefault: false,

})
  .then(successCallback)
  .catch(errorCallback);

// TODO updateStatements
const updateStatement = (uid, queries, title, description = '', isDefault = false) => axios.put(`${window.CLIN.metaServiceApiUrl}/statement`, {
  uid,
  queries,
  title,
  description,
  isDefault,

})
  .then(successCallback)
  .catch(errorCallback);

// TODO deleteStatement
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
  getStatements,
  createStatement,
  updateStatement,
  deleteStatement,
};
