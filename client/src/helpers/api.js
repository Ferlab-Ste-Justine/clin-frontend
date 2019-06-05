import axios from 'axios';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

const config = {
  crossdomain: true,
  withCredentials: true,
};

const login = (username, password) => axios.post(`${window.CLIN.apiBaseUrl}/auth`, {
  username,
  password,
}, config)
  .then(successCallback)
  .catch(errorCallback);

const logout = () => axios.delete(`${window.CLIN.apiBaseUrl}/auth`, config)
  .then(successCallback)
  .catch(errorCallback);

const getPatient = uid => axios.post(`${window.CLIN.apiBaseUrl}/patient`, {
  uid,
}, config)
  .then(successCallback)
  .catch(errorCallback);

const searchPatient = uid => axios.post(`${window.CLIN.apiBaseUrl}/patient`, {
  uid,
}, config)
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
  getPatient,
  searchPatient,
};
