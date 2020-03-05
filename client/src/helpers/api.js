import axios from 'axios';


const successCallback = (payload) => {
  console.log('API Success. payload: ', payload);
  return { payload };
};
const errorCallback = (error) => {
  console.log('API ERROR. error: ', { error });
  return { error };
};

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

const getVariantDetails = id => axios.get(`${window.CLIN.variantServiceApiUrl}/${id}`)
  .then(successCallback)
  .catch(errorCallback);

const getVariantSchema = () => axios.get(`${window.CLIN.variantServiceApiUrl}/schema`)
  .then(successCallback)
  .catch(errorCallback);

const searchVariantsForPatient = (patient, statement, query, page, size, group) => axios.post(`${window.CLIN.variantServiceApiUrl}/search`, {
  patient,
  statement,
  query,
  page,
  size,
  group,
})
  .then(successCallback)
  .catch(errorCallback);

const searchFacetsForPatient = (patient, statement, query) => axios.post(`${window.CLIN.variantServiceApiUrl}/facet`, {
  patient,
  statement,
  query,
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

const createStatement = (title, description, queries) => axios.post(`${window.CLIN.metaServiceApiUrl}/statement`, {
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const updateStatement = (uid, title, description, queries) => axios.put(`${window.CLIN.metaServiceApiUrl}/statement`, {
  uid,
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const deleteStatement = uid => axios.delete(`${window.CLIN.metaServiceApiUrl}/statement`, {
  data: { uid },
})
  .then(successCallback)
  .catch(errorCallback);

const getUserProfile = () => axios.get(`${window.CLIN.metaServiceApiUrl}/profile`, {})
  .then(successCallback)
  .catch(errorCallback);

const createUserProfile = (defaultStatement = '', patientTableConfig = {}, variantTableConfig = {}) => axios.post(`${window.CLIN.metaServiceApiUrl}/profile`, {
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

const updateUserProfile = (uid, defaultStatement, patientTableConfig = {}, variantTableConfig = {}) => axios.put(`${window.CLIN.metaServiceApiUrl}/profile`, {
  uid,
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

export default {
  login,
  logout,
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
};
