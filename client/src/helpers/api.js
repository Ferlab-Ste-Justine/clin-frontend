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

const getPatientsByAutoComplete = (type, query, page, size) => axios.get(
  `${window.CLIN.patientApiBaseUrl}/autocomplete`, {
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

const getAllPatients = (page, size) => axios.get(`${window.CLIN.patientApiBaseUrl}/search`, {
  params: {
    page,
    size,
  },
})
  .then(successCallback)
  .catch(errorCallback);

const searchPatients = (query, page, size) => axios.post(`${window.CLIN.patientApiBaseUrl}/search`, {
  query,
  page,
  size,
})
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
  getPatientsByAutoComplete,
  getAllPatients,
  searchPatients,
};
