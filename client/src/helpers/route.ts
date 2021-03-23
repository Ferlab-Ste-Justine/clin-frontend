export const ROUTE_NAME_ROOT = '/';
export const ROUTE_NAME_PATIENT = 'patient';
export const ROUTE_NAME_SUBMISSION = 'submission';
export const PATIENT_SUBROUTE_SEARCH = 'search';
export const PATIENT_SUBROUTE_VARIANT = 'variant';
export const ROUTE_NAME_VARIANT = 'variantDetails';

const patientIdMatch = new RegExp('[a-zA-Z0-9]{1,}', 'gi');
const variantIdMatch = new RegExp('[a-f0-9]{40}', 'gi');
const tabIdMatch = new RegExp('//.*[#]([\\w+]{1,})', 'gi');

export const getPatientIdFromPatientPageRoute = (location: string) => location.split('/')[2].split('#')[0];

export const getTabIdFromPatientPageRoute = (location: string) => location.match(tabIdMatch);

export const getPatientIdFromPatientVariantPageRoute = (location: string) => location.match(patientIdMatch);

export const getTabIdFromPatientVariantPageRoute = (location: string) => location.match(tabIdMatch);

export const getVariantIdFromVariantPageRoute = (location: string) => location.match(variantIdMatch);
