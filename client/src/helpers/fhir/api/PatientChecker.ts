import Http from '../../http-client';

const RAMQ_PATTERN = RegExp(/^[a-zA-Z-]{4}\d{8,9}$/);

export const isValidRamq = (ramq: string) => RAMQ_PATTERN.test(ramq);

export const getPatientByIdentifier = (identifierValue: string, organization?: string) => {
  let url = `${window.CLIN.fhirBaseUrl}/Patient?identifier=${identifierValue}`;
  if (organization) {
    url += `&organization=${organization}`;
  }
  return Http.secureClinAxios
    .get(url)
    .then((payload) => ({ payload }))
    .catch((error) => ({ error }));
};
