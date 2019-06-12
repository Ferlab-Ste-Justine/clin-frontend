import axios from 'axios';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

const config = {
  crossdomain: true,
  withCredentials: true,
};

const login = (username, password) => axios.post(`${window.CLIN.authApiBaseUrl}`, {
  username,
  password,
}, config)
  .then(successCallback)
  .catch(errorCallback);

const logout = () => axios.delete(`${window.CLIN.authApiBaseUrl}`, config)
  .then(successCallback)
  .catch(errorCallback);

const getPatientById = uid => axios.get(`${window.CLIN.patientApiBaseUrl}/${uid}`, config)
  .then(successCallback)
  .catch(errorCallback);

const getClinicalImpressionsByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/clinicalImpressions`,
  config,
)
  .then(successCallback)
  .catch(errorCallback);

const getMedicalObservationsByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/observations/medical`,
  config,
)
  .then(successCallback)
  .catch(errorCallback);

const getPhenotypeObservationsByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/observations/phenotype`,
  config,
)
  .then(successCallback)
  .catch(errorCallback);

const getServiceRequestByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/serviceRequests`,
  config,
)
  .then(successCallback)
  .catch(errorCallback);

const getSpecimensByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/specimens`,
  config,
)
  .then(successCallback)
  .catch(errorCallback);

const getFamilyHistoryByPatientId = uid => axios.get(
  `${window.CLIN.patientApiBaseUrl}/${uid}/familyHistory`,
  config,
)
  .then(successCallback)
  .catch(errorCallback);

// @TODO - Elastic Search
const searchPatientByContent = query => axios.get(`${window.CLIN.patientApiBaseUrl}/query/${query}`, config)
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
  getClinicalImpressionsByPatientId,
  getMedicalObservationsByPatientId,
  getPhenotypeObservationsByPatientId,
  getServiceRequestByPatientId,
  getSpecimensByPatientId,
  getFamilyHistoryByPatientId,
  searchPatientByContent,
};
