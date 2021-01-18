import { get } from 'lodash';
import Http from './http-client';
import {
  createPatientSubmissionBundle, createGetPatientDataBundle, createGetPractitionersDataBundle,
} from './fhir/fhir';
import { getPatientByRamq } from './fhir/api/PatientChecker';
import { getUserPractitionerData } from './fhir/api/UserResources';

const successCallback = (payload) => ({ payload });
const errorCallback = (error) => ({ error });

const getPatientById = (uid) => Http.secureClinAxios.get(`${window.CLIN.patientServiceApiUrl}/${uid}`)
  .then(successCallback)
  .catch(errorCallback);

const getPatientDataById = (id) => Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`,
  createGetPatientDataBundle(id))
  .then(successCallback)
  .catch(errorCallback);

const getPractitionersData = (data) => Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`,
  createGetPractitionersDataBundle(data))
  .then(successCallback)
  .catch(errorCallback);

const getPatientsByAutoComplete = (type, query, page, size) => Http.secureClinAxios.get(
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

const searchPatients = (query, page, size) => Http.secureClinAxios.get(`${window.CLIN.patientServiceApiUrl}/search`, {
  params: {
    query,
    page,
    size,
  },
})
  .then(successCallback)
  .catch(errorCallback);

export class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const getVariantDetails = (id) => Http.secureClinAxios.get(`${window.CLIN.variantServiceApiUrl}/${id}`)
  .then(successCallback)
  .catch(errorCallback);

const getVariantSchema = () => Http.secureClinAxios.get(`${window.CLIN.variantServiceApiUrl}/schema`)
  .then(successCallback)
  .catch(errorCallback);

const searchVariantsForPatient = (patient, statement, query, page, size, group) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/search`, {
  patient,
  statement,
  query,
  page,
  size,
  group,
})
  .then(successCallback)
  .catch(errorCallback);

const searchFacetsForPatient = (patient, statement, query) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/facet`, {
  patient,
  statement,
  query,
})
  .then(successCallback)
  .catch(errorCallback);

const countVariantsForPatient = (patient, statement, queries) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/count`, {
  patient,
  statement,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const getStatements = () => Http.secureClinAxios.get(`${window.CLIN.metaServiceApiUrl}/statement`, {})
  .then(successCallback)
  .catch(errorCallback);

const createStatement = (title, description, queries) => Http.secureClinAxios.post(`${window.CLIN.metaServiceApiUrl}/statement`, {
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const updateStatement = (uid, title, description, queries) => Http.secureClinAxios.put(`${window.CLIN.metaServiceApiUrl}/statement`, {
  uid,
  title,
  description,
  queries,
})
  .then(successCallback)
  .catch(errorCallback);

const deleteStatement = (uid) => Http.secureClinAxios.delete(`${window.CLIN.metaServiceApiUrl}/statement`, {
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

const updateUserProfile = (uid, defaultStatement, patientTableConfig = {}, variantTableConfig = {}) => Http.secureClinAxios.put(`${window.CLIN.metaServiceApiUrl}/profile`, {
  uid,
  defaultStatement,
  patientTableConfig,
  variantTableConfig,
})
  .then(successCallback)
  .catch(errorCallback);

const convertToExcelData = (data) => Http.secureClinAxios.post(`${window.CLIN.variantServiceApiUrl}/xl`, data)
  .then(successCallback)
  .catch(errorCallback);

const getGeneAutocomplete = (query, type) => Http.secureClinAxios.get(
  `${window.CLIN.geneServiceApiUrl}/autocomplete`, {
    params: {
      type,
      query,
    },
  },
)
  .then(successCallback)
  .catch(errorCallback);

const savePatientSubmission = async (patientSubmission) => {
  const data = createPatientSubmissionBundle(patientSubmission);
  const bundleId = window.CLIN.fhirEsBundleId;
  return Http.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/?_format=json&_pretty=true&id=${bundleId}`, data)
    .then(successCallback)
    .catch(errorCallback);
};

const searchHpos = async (term) => {
  const url = `${window.CLIN.hpoBaseUrl}/autocomplete?prefix=${term}`;
  return Http.secureClinAxios.get(url)
    .then(successCallback)
    .catch(errorCallback);
};

const searchHpoChildren = async (hpoCode) => {
  const url = `${window.CLIN.hpoBaseUrl}/descendants?parentHpoId=${hpoCode}`;
  return Http.secureClinAxios.get(url)
    .then(successCallback)
    .catch(errorCallback);
};

const searchPractitioners = async ({ term }) => {
  const filter = `name sw "${term}" or identifier sw "${term}"`;
  const url = `${window.CLIN.fhirBaseUrl}/Practitioner?_filter=${filter}&_pretty=true&_count=5`;
  return Http.secureClinAxios.get(url)
    .then(successCallback)
    .catch(errorCallback);
};

const updateServiceRequestStatus = async (user, serviceRequest, status, note) => {
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

  const notes = get(serviceRequest, 'note', []);

  if (note != null) {
    notes.push({
      text: note,
      time: new Date(),
      authorReference: {
        reference: `Practitioner/${user.practitionerId}`,
      },
    });
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

export default {
  searchHpos,
  searchHpoChildren,
  getPatientById,
  getPatientsByAutoComplete,
  searchPatients,
  searchPractitioners,
  getVariantDetails,
  getVariantSchema,
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
  savePatientSubmission,
  getPatientDataById,
  getPractitionersData,
  updateServiceRequestStatus,
  getPatientByRamq,
};
