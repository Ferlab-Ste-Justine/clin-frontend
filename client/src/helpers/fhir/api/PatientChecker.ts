import Http from '../../http-client';

const RAMQ_PATTERN = RegExp(/^[a-zA-Z-]{4}\d{8,9}$/);

export const isValidRamq = (ramq: string) => RAMQ_PATTERN.test(ramq);

export const getPatientByRamq = (ramq: string) => {
  if (!isValidRamq(ramq)) {
    throw new Error('Invalid RAMQ');
  }

  return Http.secureClinAxios.get(`${window.CLIN.fhirBaseUrl}/Patient?identifier=${ramq}`).then((payload) => ({ payload }))
    .catch((error) => ({ error }));
};
