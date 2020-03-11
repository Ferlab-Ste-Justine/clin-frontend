import LocalStorage from './storage/local';


const LOGGED_IN = 'logged_in';

export const isLoggedIn = () => LocalStorage.read(LOGGED_IN) !== undefined;

export const setAsLoggedIn = () => {
  LocalStorage.write(LOGGED_IN, new Date().getTime());
};

export const setAsLoggedOut = () => {
  LocalStorage.remove(LOGGED_IN);
};
