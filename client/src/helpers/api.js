import axios from 'axios';

const successCallback = payload => ({ payload });
const errorCallback = error => ({ error });

const config = {
  crossdomain: true,
  withCredentials: true,
};

const login = (username, password) => axios.post('http://localhost:3000/auth', {
  username,
  password,
}, config)
  .then(successCallback)
  .catch(errorCallback);

const logout = () => axios.delete('http://localhost:3000/auth', config)
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
};
