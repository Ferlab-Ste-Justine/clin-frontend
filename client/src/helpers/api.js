import axios from 'axios';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

axios.defaults.withCredentials = true;
axios.defaults.crossdomain = true;

const login = (username, password) => axios.post(`${window.CLIN.authApiBaseUrl}`, {
  username,
  password,
})
  .then(successCallback)
  .catch(errorCallback);

const logout = () => axios.delete(`${window.CLIN.authApiBaseUrl}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientById = uid => axios.get(`${window.CLIN.patientApiBaseUrl}/${uid}`)
  .then(successCallback)
  .catch(errorCallback);

const getAllResourcesByPatientId = uid => axios.get(`${window.CLIN.patientApiBaseUrl}/${uid}/resources`)
  .then(successCallback)
  .catch(errorCallback);

const getClinicalImpressionsByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/clinicalImpressions`,
)
  .then(successCallback)
  .catch(errorCallback);

const getMedicalObservationsByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/observations/medical`,
)
  .then(successCallback)
  .catch(errorCallback);

const getPhenotypeObservationsByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/observations/phenotype`,
)
  .then(successCallback)
  .catch(errorCallback);

const getServiceRequestByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/serviceRequests`,
)
  .then(successCallback)
  .catch(errorCallback);

const getSpecimensByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/specimens`,
)
  .then(successCallback)
  .catch(errorCallback);

const getFamilyHistoryByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/familyMemberHistory`,
)
  .then(successCallback)
  .catch(errorCallback);

// @TODO - Elastic Search
const searchPatientByContent = query => axios.get(`${window.CLIN.patientApiBaseUrl}/query/${query}`)
  .then(successCallback)
  .catch(errorCallback);

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export default {
  login,
  logout,
  getPatientById,
  getAllResourcesByPatientId,
  getClinicalImpressionsByPatientId,
  getMedicalObservationsByPatientId,
  getPhenotypeObservationsByPatientId,
  getServiceRequestByPatientId,
  getSpecimensByPatientId,
  getFamilyHistoryByPatientId,
  searchPatientByContent,
};
