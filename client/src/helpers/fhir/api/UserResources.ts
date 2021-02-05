import { AxiosResponse } from 'axios';
import get from 'lodash/get';
import httpClient from '../../http-client';

export const getUserPractitionerData = async (response: AxiosResponse) : Promise<AxiosResponse> => {
  const practitionerId = get(response, 'data.data.hits[0]._source.practitionerId');
  if (practitionerId == null) {
    return Promise.reject(new Error(`Invalid practitioner id [${practitionerId}]`));
  }

  const result = await httpClient.secureClinAxios.get(`${window.CLIN.fhirBaseUrl}/PractitionerRole?practitioner=${practitionerId}&_include=PractitionerRole:practitioner`);

  if ((<any>result).error != null) {
    return Promise.reject();
  }

  const entries = get(result, 'data.entry', []);
  if (entries.length !== 2 || entries[0].resource == null || entries[1].resource == null) {
    return Promise.reject();
  }

  const practitionerRole = entries[0].resource;
  const practitioner = entries[1].resource;

  return Promise.resolve({
    ...response,
    data: {
      ...response.data,
      practitionerData: { practitioner, practitionerRole },
    },
  });
};
