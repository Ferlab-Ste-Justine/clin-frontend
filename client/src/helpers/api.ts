import get from 'lodash/get';
import Http from './http-client';
import {
  createGetMultiplePatientDataBundle,
  createGetPatientDataBundle, createGetPractitionersDataBundle,
} from './fhir/fhir';
import { getPatientByIdentifier } from './fhir/api/PatientChecker';
import { getUserPractitionerData } from './fhir/api/UserResources';
import { Group, ServiceRequest } from './fhir/types';
import { userAuthPermissions } from './keycloak-api';
import { generateGroupStatus, GroupMemberStatusCode } from './fhir/patientHelper';
import keycloak from '../keycloak';

const successCallback = (payload: any) => ({ payload });
const errorCallback = (error: any) => ({ error });

const getUserAuthPermissions = () => userAuthPermissions().then(successCallback).catch(errorCallback);

const canEditPatients = (ids: string[]) => Http.secureClinAxios
  .post(`${window.CLIN.patientServiceApiUrl}/can-edit`, { ids })
  .then(successCallback)
  .catch(errorCallback);

const getPatientsGenderAndPosition = (ids: string[]) => Http.secureClinAxios
  .post(`${window.CLIN.patientServiceApiUrl}/gender-and-position`, { ids })
  .then(successCallback)
  .catch(errorCallback);

const getPatientById = (uid: string) => Http.secureClinAxios.get(`${window.CLIN.patientServiceApiUrl}/${uid}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientDataById = (id: string) => Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`,
  createGetPatientDataBundle(id))
  .then(successCallback)
  .catch(errorCallback);

const getGroupById = (id: string) => Http.secureClinAxios.get(`${window.CLIN.fhirBaseUrl}/Group?_id=${id}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientDataByIds = (ids: string[], withIncludes = true) => Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`,
  createGetMultiplePatientDataBundle(ids, withIncludes))
  .then(successCallback)
  .catch(errorCallback);

const getPractitionersData = (data: any) => Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`,
  createGetPractitionersDataBundle(data))
  .then(successCallback)
  .catch(errorCallback);

const getPatientsByAutoComplete = (type: string, query: string, page: number, size: number) => Http.secureClinAxios.get(
  `${window.CLIN.patientServiceApiUrl}/autocomplete`, {
    params: {
      type,
      query,
      page,
      size,
    },
  },
)
  .then(successCallback)
  .catch(errorCallback);

const searchPatients = (query: string, page: number, size: number, type = 'patient') => Http.secureClinAxios.get(`${window.CLIN.patientServiceApiUrl}/search`, {
  params: {
    query,
    page,
    size,
    type,
  },
})
  .then(successCallback)
  .catch(errorCallback);

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

const getVariantDetails = (id: string) => Http.secureClinAxios.get(`${window.CLIN.variantServiceApiUrl}/${id}`)
  .then(successCallback)
  .catch(errorCallback);

const getVariantSchema = () => Http.secureClinAxios.get(`${window.CLIN.variantServiceApiUrl}/schema`)
  .then(successCallback)
  .catch(errorCallback);

const searchVariantsForPatient = (patient: string, statement: string, query: string, page: number, size: number, group: string) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/search`, {
  patient,
  statement,
  query,
  page,
  size,
  group,
})
  .then(successCallback)
  .catch(errorCallback);

const searchFacetsForPatient = (patient: any, statement: string, query: string) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/facet`, {
  patient,
  statement,
  query,
})
  .then(successCallback)
  .catch(errorCallback);

const countVariantsForPatient = (patient: any, statement: string, queries: any) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/count`, {
  patient,
  statement,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const getStatements = () => Http.secureClinAxios.get(`${window.CLIN.metaServiceApiUrl}/statement`, {})
  .then(successCallback)
  .catch(errorCallback);

const createStatement = (title: string, description: string, queries: any) => Http.secureClinAxios.post(`${window.CLIN.metaServiceApiUrl}/statement`, {
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const updateStatement = (uid: string, title: string, description: string, queries: any) => Http.secureClinAxios.put(`${window.CLIN.metaServiceApiUrl}/statement`, {
  uid,
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const deleteStatement = (uid: string) => Http.secureClinAxios.delete(`${window.CLIN.metaServiceApiUrl}/statement`, {
  data: { uid },
})
  .then(successCallback)
  .catch(errorCallback);

const getUserProfile = () => Http.secureClinAxios.get(`${window.CLIN.metaServiceApiUrl}/profile`, {})
  .then(getUserPractitionerData)
  .then(successCallback)
  .catch(errorCallback);

const createUserProfile = (defaultStatement = '', patientTableConfig = {}, variantTableConfig = {}) => Http.secureClinAxios.post(`${window.CLIN.metaServiceApiUrl}/profile`, {
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

const updateUserProfile = (uid: string, defaultStatement: any, patientTableConfig = {}, variantTableConfig = {}) => Http.secureClinAxios.put(`${window.CLIN.metaServiceApiUrl}/profile`, {
  uid,
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

const convertToExcelData = (data: any) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/xl`, data)
  .then(successCallback)
  .catch(errorCallback);

const getGeneAutocomplete = (query: string, type: string) => Http.secureClinAxios.get(
  `${window.CLIN.geneServiceApiUrl}/autocomplete`, {
    params: {
      type,
      query,
    },
  },
)
  .then(successCallback)
  .catch(errorCallback);

const searchHpos = async (term: string) => {
  const url = `${window.CLIN.hpoBaseUrl}/autocomplete?prefix=${term}`;
  return Http.secureClinAxios.get(url)
    .then(successCallback)
    .catch(errorCallback);
};

const searchHpoChildren = async (hpoCode: string) => {
  const url = `${window.CLIN.hpoBaseUrl}/descendants?parentHpoId=${hpoCode}`;
  return Http.secureClinAxios.get(url)
    .then(successCallback)
    .catch(errorCallback);
};

const searchPractitioners = async ({ term }: {term: string}) => {
  const filter = `name sw "${term}" or identifier sw "${term}"`;
  const url = `${window.CLIN.fhirBaseUrl}/Practitioner?_filter=${filter}&_pretty=true&_count=5`;
  return Http.secureClinAxios.get(url)
    .then(successCallback)
    .catch(errorCallback);
};

const updateServiceRequestStatus = async (user: any, serviceRequest: ServiceRequest, status: string, note: string) => {
  const extension = serviceRequest.extension.map((ext) => {
    const isSubmittedExt = ext.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted';

    if (isSubmittedExt) {
      return {
        ...ext,
        valueBoolean: status !== 'on-hold',
      };
    }
    return ext;
  });

  let notes: any[] = get(serviceRequest, 'note', []);

  if (note != null) {
    notes = [
      ...notes,
      {
        text: note,
        time: new Date(),
        authorReference: {
          reference: `Practitioner/${user.practitionerId}`,
        },
      },
    ];
  }

  const editedServiceRequest = {
    ...serviceRequest,
    status,
    extension,
    note: notes,
  };

  const url = `${window.CLIN.fhirBaseUrl}/ServiceRequest/${editedServiceRequest.id}`;

  return Http.secureClinAxios.put(url, editedServiceRequest)
    .then(successCallback)
    .catch(errorCallback);
};

const addPatientToGroup = async (groupId: string, parentId: string, status: GroupMemberStatusCode) => {
  const groupResult = await getGroupById(groupId);
  const group: Group = get(groupResult, 'payload.data.entry[0].resource', null);
  if (!group) {
    return Promise.reject(new Error(`groupId [${groupId}] is invalid`));
  }

  group.member.push({
    extension: [generateGroupStatus(status)],
    entity: {
      reference: `Patient/${parentId}`,
    },
  });

  return Http.secureClinAxios.put(`${window.CLIN.fhirBaseUrl}/Group/${groupId}`, group)
    .then(successCallback).catch(errorCallback);
};

const deletePatientFromGroup = async (groupId: string, parentId: string) => {
  const groupResult = await getGroupById(groupId);
  const group: Group = get(groupResult, 'payload.data.entry[0].resource', null);
  if (!group) {
    return Promise.reject(new Error('groupId is invalid'));
  }

  const newMembers = group.member.filter((member) => !member.entity.reference.includes(parentId));

  group.member = newMembers;

  return Http.secureClinAxios.put(`${window.CLIN.fhirBaseUrl}/Group/${groupId}`, group)
    .then(successCallback).catch(errorCallback);
};

const createGroup = async (patientId: string) => Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/Group`, {
  resourceType: 'Group',
  extension: [{
    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/fm-structure',
    valueCoding: {
      system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/fm-structure',
      code: 'SOL',
      display: 'Solo',
    },
  }],
  type: 'person',
  actual: true,
  member: [{
    entity: {
      reference: `Patient/${patientId}`,
    },
  }],
}).then(successCallback).catch(errorCallback);
const getFileURL = async (file: string) => Http.secureClinAxios
  .get(`${file}?format=json`, { headers: { Authorization: `Bearer ${keycloak.token}` } })
  .then(successCallback)
  .catch(errorCallback);

export default {
  getUserAuthPermissions,
  addPatientToGroup,
  deletePatientFromGroup,
  canEditPatients,
  getPatientsGenderAndPosition,
  searchHpos,
  searchHpoChildren,
  getPatientById,
  getPatientDataByIds,
  getPatientsByAutoComplete,
  getGroupById,
  searchPatients,
  searchPractitioners,
  getVariantDetails,
  getVariantSchema,
  getFileURL,
  searchVariantsForPatient,
  searchFacetsForPatient,
  countVariantsForPatient,
  getStatements,
  createStatement,
  updateStatement,
  deleteStatement,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  convertToExcelData,
  getGeneAutocomplete,
  getPatientDataById,
  getPractitionersData,
  updateServiceRequestStatus,
  getPatientByIdentifier,
  createGroup,
};
