// https://github.com/axios/axios

import axios from 'axios';


const login = (username, password) => axios.post('http://localhost:3000/auth', {
  username,
  password,
});

const logout = () => axios.delete('http://localhost:3000/auth');

export default {
  login,
  logout,
};
