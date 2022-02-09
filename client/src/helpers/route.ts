export const ROOT = '/';
export const ROUTE_PATIENT = 'patient';
export const ROUTE_PATIENT_SEARCH = 'search';

export class Routes {
  static AccessDenied = `${ROOT}access-denied`;
  static MainSearch = `${ROOT}search`;
  static Patient = `${ROOT}${ROUTE_PATIENT}`;
  static PatientSearch = `${ROOT}${ROUTE_PATIENT}/${ROUTE_PATIENT_SEARCH}`;
  static PatientVariants = `${ROOT}${ROUTE_PATIENT}/:uid/variant`;
  static Root = `${ROOT}`;
  static Submission = `${ROOT}submission`;

  public static getPatientPath(uid?: string, tab?: string): string {
    return uid && tab
      ? `${Routes.Patient}/${uid}/#${tab}`
      : uid
        ? `${Routes.Patient}/${uid}`
        : `${Routes.Patient}/:uid`;
  }

  public static getPatientIdFromPatientPageRoute = (location: string): string =>
    location?.split('/')[2].split('#')[0];
}
