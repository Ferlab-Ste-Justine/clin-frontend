import LocalStorage from './storage/local';


const LOGGED_IN = 'logged_in';
export const ROUTE_NAME_PATIENT = 'patient';
export const PATIENT_SUBROUTE_SEARCH = 'search';
export const PATIENT_SUBROUTE_VARIANT = 'variant';
export const ROUTE_NAME_VARIANT = 'variantDetails';

const patientSearchRoutePattern = new RegExp(`/${ROUTE_NAME_PATIENT}/${PATIENT_SUBROUTE_SEARCH}`, 'gi');
const patientPageRoutePattern = new RegExp(`/${ROUTE_NAME_PATIENT}/PA[0-9]{1,}`, 'gi');
const patientVariantPageRoutePattern = new RegExp(`/${ROUTE_NAME_PATIENT}/PA[0-9]{1,}/${PATIENT_SUBROUTE_VARIANT}`, 'gi');
const variantPageRoutePattern = RegExp(`${ROUTE_NAME_VARIANT}/[a-f0-9]{32}`, 'gi');
const patientIdMatch = new RegExp('PA[0-9]{1,}', 'gi');
const variantIdMatch = new RegExp('[a-f0-9]{32}', 'gi');
const tabIdMatch = new RegExp('//.*[#]([\\w+]{1,})', 'gi');

export const isLoggedIn = () => LocalStorage.read(LOGGED_IN) !== undefined;

export const setAsLoggedIn = () => {
  LocalStorage.write(LOGGED_IN, new Date().getTime());
};

export const setAsLoggedOut = () => {
  LocalStorage.remove(LOGGED_IN);
};

export const isPatientSearchRoute = location => patientSearchRoutePattern.test(location);

export const isPatientPageRoute = location => patientPageRoutePattern.test(location);

export const isPatientVariantPageRoute = location => patientVariantPageRoutePattern.test(location);

export const isVariantPageRoute = location => variantPageRoutePattern.test(location);

export const getPatientIdFromPatientPageRoute = location => location.match(patientIdMatch);

export const getTabIdFromPatientPageRoute = location => location.match(tabIdMatch);

export const getPatientIdFromPatientVariantPageRoute = location => location.match(patientIdMatch);

export const getTabIdFromPatientVariantPageRoute = location => location.match(tabIdMatch);

export const getVariantIdFromVariantPageRoute = location => location.match(variantIdMatch);

export const getTabIdFromVariantPageRoute = location => location.match(tabIdMatch);
