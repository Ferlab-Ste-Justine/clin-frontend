import get from 'lodash/get';

import keycloak from '../keycloak';

import { getPatientByIdentifier } from './fhir/api/PatientChecker';
import { getUserPractitionerData } from './fhir/api/UserResources';
import { BundleBuilder } from './fhir/builder/BundleBuilder';
import { getExtension } from './fhir/builder/Utils';
import {
  createGetMultiplePatientDataBundle,
  createGetMultiplePractitionerDataBundle,
  createGetPatientDataBundle,
  createGetPractitionersDataBundle,
} from './fhir/fhir';
import { generateGroupStatus, GroupMemberStatusCode } from './fhir/patientHelper';
import { Bundle, Group, Patient, ServiceRequest } from './fhir/types';
import { PatientAutocompleteOptionalParams, PatientAutoCompleteResponse } from './search/types';
import Http from './http-client';
import { userAuthPermissions } from './keycloak-api';

type Payload = any;
type PayloadCb = { payload: Payload };
type AnyError = any;
type ErrorCb = { error: AnyError };

const successCallback = (payload: Payload): PayloadCb => ({ payload });
const errorCallback = (error: AnyError): ErrorCb => ({ error });

const getUserAuthPermissions = () =>
  userAuthPermissions().then(successCallback).catch(errorCallback);

const canEditPatients = (ids: string[]) =>
  Http.secureClinAxios
    .post(`${window.CLIN.patientServiceApiUrl}/can-edit`, { ids })
    .then(successCallback)
    .catch(errorCallback);

const getPatientsGenderAndPosition = (ids: string[]) =>
  Http.secureClinAxios
    .post(`${window.CLIN.patientServiceApiUrl}/gender-and-position`, { ids })
    .then(successCallback)
    .catch(errorCallback);

const getPatientById = (uid: string) =>
  Http.secureClinAxios
    .get(`${window.CLIN.patientServiceApiUrl}/${uid}`)
    .then(successCallback)
    .catch(errorCallback);

const getPatientDataById = (id: string) =>
  Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}`, createGetPatientDataBundle(id))
    .then(successCallback)
    .catch(errorCallback);

const getGroupById = (
  id: string,
): Promise<{
  payload?: {
    data: Bundle;
  };
  error?: AnyError;
}> =>
  Http.secureClinAxios
    .get(`${window.CLIN.fhirBaseUrl}/Group?_id=${id}`)
    .then(successCallback)
    .catch(errorCallback);

const getGroupByMemberId = (
  id: string,
): Promise<{
  payload?: {
    data: Bundle;
  };
  error?: AnyError;
}> =>
  Http.secureClinAxios
    .get(`${window.CLIN.fhirBaseUrl}/Group?member=${id}`)
    .then(successCallback)
    .catch(errorCallback);

const updateGroup = (
  groupId: string,
  updatedGroup: Group
): Promise<{
  payload?: {
    data: Bundle;
  };
  error?: AnyError;
}> =>
  Http.secureClinAxios
    .put(`${window.CLIN.fhirBaseUrl}/Group/${groupId}`, updatedGroup)
    .then(successCallback)
    .catch(errorCallback);

const deleteGroup = (groupId: string) =>
  Http.secureClinAxios
    .delete(`${window.CLIN.fhirBaseUrl}/Group/${groupId}`)
    .then(successCallback)
    .catch(errorCallback);

const getPractitionerByIds = (ids: string[]) =>
  Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}`, createGetMultiplePractitionerDataBundle(ids))
    .then(successCallback)
    .catch(errorCallback);

const getPatientDataByIds = (ids: string[], withIncludes = true) =>
  Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}`, createGetMultiplePatientDataBundle(ids, withIncludes))
    .then(successCallback)
    .catch(errorCallback);

const getPractitionersData = (data: any) =>
  Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}`, createGetPractitionersDataBundle(data))
    .then(successCallback)
    .catch(errorCallback);

const preparePatientAutoCompleteOptionalParams = (options?: PatientAutocompleteOptionalParams) =>
  options?.idsToExclude?.length
    ? {
        ...options,
        idsToExclude: JSON.stringify(options.idsToExclude),
      }
    : { ...(options || {}) };

const getPatientsByAutoComplete = (
  type: string,
  query: string,
  page: number,
  size: number,
  options?: PatientAutocompleteOptionalParams,
): PatientAutoCompleteResponse =>
  Http.secureClinAxios
    .get(`${window.CLIN.patientServiceApiUrl}/autocomplete`, {
      params: {
        page,
        query,
        size,
        type,
        ...preparePatientAutoCompleteOptionalParams(options),
      },
    })
    .then(successCallback)
    .catch(errorCallback);

const getPrescriptionsByAutoComplete = (type: string, query: string, page: number, size: number) =>
  Http.secureClinAxios
    .get(`${window.CLIN.patientServiceApiUrl}/prescriptions`, {
      params: {
        page,
        query,
        size,
        type,
      },
    })
    .then(successCallback)
    .catch(errorCallback);

const searchPatients = (query: string, page: number, size: number, type = 'patient') =>
  Http.secureClinAxios
    .get(`${window.CLIN.patientServiceApiUrl}/search`, {
      params: {
        page,
        query,
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

const getVariantDetails = (id: string) =>
  Http.secureClinAxios
    .get(`${window.CLIN.variantServiceApiUrl}/${id}`)
    .then(successCallback)
    .catch(errorCallback);

const getVariantSchema = () =>
  Http.secureClinAxios
    .get(`${window.CLIN.variantServiceApiUrl}/schema`)
    .then(successCallback)
    .catch(errorCallback);

const searchVariantsForPatient = (
  patient: string,
  statement: string,
  query: string,
  page: number,
  size: number,
  group: string,
) =>
  Http.secureClinAxios
    .post(`${window.CLIN.variantServiceApiUrl}/search`, {
      group,
      page,
      patient,
      query,
      size,
      statement,
    })
    .then(successCallback)
    .catch(errorCallback);

const searchFacetsForPatient = (patient: any, statement: string, query: string) =>
  Http.secureClinAxios
    .post(`${window.CLIN.variantServiceApiUrl}/facet`, {
      patient,
      query,
      statement,
    })
    .then(successCallback)
    .catch(errorCallback);

const countVariantsForPatient = (patient: any, statement: string, queries: any) =>
  Http.secureClinAxios
    .post(`${window.CLIN.variantServiceApiUrl}/count`, {
      patient,
      queries,
      statement,
    })
    .then(successCallback)
    .catch(errorCallback);

const getStatements = () =>
  Http.secureClinAxios
    .get(`${window.CLIN.metaServiceApiUrl}/statement`, {})
    .then(successCallback)
    .catch(errorCallback);

const createStatement = (title: string, description: string, queries: any) =>
  Http.secureClinAxios
    .post(`${window.CLIN.metaServiceApiUrl}/statement`, {
      description,
      queries,
      title,
    })
    .then(successCallback)
    .catch(errorCallback);

const updateStatement = (uid: string, title: string, description: string, queries: any) =>
  Http.secureClinAxios
    .put(`${window.CLIN.metaServiceApiUrl}/statement`, {
      description,
      queries,
      title,
      uid,
    })
    .then(successCallback)
    .catch(errorCallback);

const deleteStatement = (uid: string) =>
  Http.secureClinAxios
    .delete(`${window.CLIN.metaServiceApiUrl}/statement`, {
      data: { uid },
    })
    .then(successCallback)
    .catch(errorCallback);

const getUserProfile = () =>
  Http.secureClinAxios
    .get(`${window.CLIN.metaServiceApiUrl}/profile`, {})
    .then(getUserPractitionerData)
    .then(successCallback)
    .catch(errorCallback);

const createUserProfile = (
  defaultStatement = '',
  patientTableConfig = {},
  variantTableConfig = {},
) =>
  Http.secureClinAxios
    .post(`${window.CLIN.metaServiceApiUrl}/profile`, {
      defaultStatement,
      patientTableConfig,
      variantTableConfig,
    })
    .then(successCallback)
    .catch(errorCallback);

const updateUserProfile = (
  uid: string,
  defaultStatement: any,
  patientTableConfig = {},
  variantTableConfig = {},
) =>
  Http.secureClinAxios
    .put(`${window.CLIN.metaServiceApiUrl}/profile`, {
      defaultStatement,
      patientTableConfig,
      uid,
      variantTableConfig,
    })
    .then(successCallback)
    .catch(errorCallback);

const convertToExcelData = (data: any) =>
  Http.secureClinAxios
    .post(`${window.CLIN.variantServiceApiUrl}/xl`, data)
    .then(successCallback)
    .catch(errorCallback);

const getGeneAutocomplete = (query: string, type: string) =>
  Http.secureClinAxios
    .get(`${window.CLIN.geneServiceApiUrl}/autocomplete`, {
      params: {
        query,
        type,
      },
    })
    .then(successCallback)
    .catch(errorCallback);

const searchHpos = async (term: string) => {
  const url = `${window.CLIN.hpoBaseUrl}/autocomplete?prefix=${term}`;
  return Http.secureClinAxios.get(url).then(successCallback).catch(errorCallback);
};

const searchHpoChildren = async (hpoCode: string) => {
  const url = `${window.CLIN.hpoBaseUrl}/descendants?parentHpoId=${hpoCode}`;
  return Http.secureClinAxios.get(url).then(successCallback).catch(errorCallback);
};

const searchHPOByAncestorId = async (hpoId: string, size = 1000, after?: string) => {
  const url = `${window.CLIN.hpoBaseUrl}/ancestors?hpoId=${hpoId}&after=${after}&size=${size}`;
  return Http.secureClinAxios.get(url).then(successCallback).catch(errorCallback);
};

const searchPractitioners = async ({ term }: { term: string }) => {
  const filter = `name sw "${term}" or identifier sw "${term}"`;
  const url = `${window.CLIN.fhirBaseUrl}/Practitioner?_filter=${filter}&_pretty=true&_count=5`;
  return Http.secureClinAxios.get(url).then(successCallback).catch(errorCallback);
};

const updateServiceRequestStatus = async (
  user: any,
  serviceRequest: ServiceRequest,
  status: string,
  note: string,
) => {
  const extension = serviceRequest.extension.map((ext) => {
    const isSubmittedExt =
      ext.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted';

    if (isSubmittedExt) {
      return {
        ...ext,
        valueBoolean: status !== 'on-hold',
      };
    }
    return ext;
  });

  let notes: any[] = get(serviceRequest, 'note', []).filter((n) => n.text != null);

  if (note != null) {
    notes = [
      ...notes,
      {
        authorReference: {
          reference: `Practitioner/${user.practitionerId}`,
        },
        text: note,
        time: new Date(),
      },
    ];
  }

  const editedServiceRequest = {
    ...serviceRequest,
    performer: [
      {
        reference: `PractitionerRole/${user.practitionerData.practitionerRole.id}`,
      },
    ],
    extension,
    note: notes,
    status,
  };

  const url = `${window.CLIN.fhirBaseUrl}/ServiceRequest/${editedServiceRequest.id}`;

  return Http.secureClinAxios
    .put(url, editedServiceRequest)
    .then(successCallback)
    .catch(errorCallback);
};

const addOrUpdatePatientToGroup = async (
  groupId: string,
  parentId: string,
  status: GroupMemberStatusCode,
) => {
  const groupResult = await getGroupById(groupId);
  const group: Group = get(groupResult, 'payload.data.entry[0].resource', null);
  if (!group) {
    return Promise.reject(new Error(`groupId [${groupId}] is invalid`));
  }

  const parentMemberIndex = group.member.findIndex((member) =>
    member.entity.reference.includes(parentId),
  );

  if (parentMemberIndex >= 0) {
    group.member.splice(parentMemberIndex, 1);
  }

  group.member.push({
    entity: {
      reference: `Patient/${parentId}`,
    },
    extension: [generateGroupStatus(status)],
  });

  return Http.secureClinAxios
    .put(`${window.CLIN.fhirBaseUrl}/Group/${groupId}`, group)
    .then(successCallback)
    .catch(errorCallback);
};

const createGroup = async (patientId: string) =>
  Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}/Group`, {
      actual: true,
      extension: [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/fm-structure',
          valueCoding: {
            code: 'SOL',
            display: 'Solo',
            system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/fm-structure',
          },
        },
      ],
      member: [
        {
          entity: {
            reference: `Patient/${patientId}`,
          },
        },
      ],
      resourceType: 'Group',
      type: 'person',
    })
    .then(successCallback)
    .catch(errorCallback);

const getGroupMembers = async (group: Group) => {
  const builder = new BundleBuilder();
  group.member.forEach((member) => {
    builder.withGet(member.entity.reference);
  });

  return Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}`, builder.build())
    .then(successCallback)
    .catch(errorCallback);
};

const updatePatientsGroup = async (members: Patient[], newGroupId: string) => {
  const builder = new BundleBuilder();
  members.forEach((member) => {
    const ext = member.extension.findIndex((extension) => extension.url.includes('family-id'));
    if (ext > 0) {
      member.extension.splice(ext, 1);
    }

    member.extension.push({
      url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id',
      valueReference: {
        reference: `Group/${newGroupId}`,
      },
    });

    getExtension(
      member,
      'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
    )!.valueBoolean = false;

    builder.withResource(member);
  });

  return Http.secureClinAxios
    .post(`${window.CLIN.fhirBaseUrl}`, builder.build())
    .then(successCallback)
    .catch(errorCallback);
};

const getFileURL = async (file: string) =>
  Http.secureClinAxios
    .get(`${file}?format=json`, { headers: { Authorization: `Bearer ${keycloak.token}` } })
    .then(successCallback)
    .catch(errorCallback);

export default {
  addOrUpdatePatientToGroup,
  canEditPatients,
  getGroupById,
  getPatientById,
  getGroupByMemberId,
  deleteGroup,
  updateGroup,
  getPatientDataByIds,
  getPatientsByAutoComplete,
  getPatientsGenderAndPosition,
  getFileURL,
  getUserAuthPermissions,
  getPrescriptionsByAutoComplete,
  countVariantsForPatient,
  searchHpoChildren,
  createStatement,
  searchHpos,
  deleteStatement,
  searchHPOByAncestorId,
  createUserProfile,
  getVariantDetails,
  convertToExcelData,
  getVariantSchema,
  getGeneAutocomplete,
  searchPatients,
  getPatientDataById,
  searchPractitioners,
  getPatientByIdentifier,
  searchFacetsForPatient,
  createGroup,
  searchVariantsForPatient,
  getGroupMembers,
  getPractitionerByIds,
  getStatements,
  getPractitionersData,
  updateStatement,
  getUserProfile,
  updatePatientsGroup,
  updateServiceRequestStatus,
  updateUserProfile,
};
