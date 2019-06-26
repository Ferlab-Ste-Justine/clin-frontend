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

const getPartialPatientsByAutoComplete = query => axios.get(
  `${window.CLIN.patientApiBaseUrl}/autocomplete/partial/${query}`,
)
  .then(successCallback)
  .catch(errorCallback);

const getFullPatientsByAutoComplete = query => axios.get(
  `${window.CLIN.patientApiBaseUrl}/autocomplete/full/${query}`,
)
  .then(successCallback)
  .catch(errorCallback);

const getAllPatients = () => axios.get(`${window.CLIN.patientApiBaseUrl}/search`)
  .then(successCallback)
  .catch(errorCallback);

const searchAllPatients = query => axios.get(`${window.CLIN.patientApiBaseUrl}/search/${query}`)
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
  getPartialPatientsByAutoComplete,
  getFullPatientsByAutoComplete,
  getAllPatients,
  searchAllPatients,
};
