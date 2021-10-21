import { AxiosResponse } from 'axios';
import get from 'lodash/get';
import head from 'lodash/head';
import httpClient from '../../http-client';

export const getUserPractitionerData = async (response: AxiosResponse): Promise<AxiosResponse> => {
  const practitionerId = get(response, 'data.data.hits[0]._source.practitionerId');
  if (practitionerId == null) {
    console.error(`Invalid practitioner id [${practitionerId}]`);
    return Promise.resolve({ ...response });
  }

  const result = await httpClient.secureClinAxios.get(
    `${window.CLIN.fhirBaseUrl}/PractitionerRole?practitioner=${practitionerId}&_include=PractitionerRole:practitioner`,
  );

  if ((<any>result).error != null) {
    return Promise.reject();
  }

  const entries = get(result, 'data.entry', []);

  const practitionerRoles = filterByResourceType(entries, 'PractitionerRole')
  const practitioner = findByResourceType(entries, 'Practitioner')

  return Promise.resolve({
    ...response,
    data: {
      ...response.data,
      practitionerData: { practitioner, practitionerRoles },
    },
  });
};

const filterByResourceType = (entries: any, resourceType: string): any =>
  entries.filter((entry: any) => entry.resource.resourceType === resourceType).map((entry: any) => entry.resource)

const findByResourceType = (entries: any, resourceType: string): any =>
  head(filterByResourceType(entries, resourceType))