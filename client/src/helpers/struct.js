/* eslint-disable import/no-cycle */
import { initialPatientState } from '../reducers/patient';


export const normalizePatientDetails = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.details);

  struct.id = fhirPatient.id;
  struct.firstName = (fhirPatient.name ? fhirPatient.name[0].given[0] : '');
  struct.lastName = (fhirPatient.name ? fhirPatient.name[0].family : '');
  struct.birthDate = fhirPatient.birthDate;
  struct.gender = fhirPatient.gender;
  struct.ethnicity = fhirPatient.ethnicity;
  struct.proband = fhirPatient.isProband;
  struct.mrn = (fhirPatient.identifier ? fhirPatient.identifier.MR : '');
  struct.ramq = (fhirPatient.identifier ? fhirPatient.identifier.JHN : '');

  return struct;
};

export const normalizePatientFamily = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.family);

  struct.id = fhirPatient.familyId;
  struct.composition = fhirPatient.familyComposition;
  struct.members.proband = fhirPatient.id;
  struct.members.mother = 'N/A';
  struct.members.father = 'N/A';
  struct.history = fhirPatient.familyMemberHistory.reduce((result, current) => {
    result.push({
      id: current.id,
      date: current.date,
      note: current.note[0].text,
    });
    return result;
  }, []);

  return struct;
};

export const normalizePatientStudy = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.study);

  if (fhirPatient.studies[0]) {
    struct.id = fhirPatient.studies[0].id;
    struct.name = fhirPatient.studies[0].title;
  }

  return struct;
};


export const normalizePatientPractitioner = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.practitioner);

  if (fhirPatient.practitioners[0]) {
    struct.id = fhirPatient.practitioners[0].id;
    struct.rid = fhirPatient.practitioners[0].role_id;
    struct.mln = fhirPatient.practitioners[0].identifier.MD;
    struct.name = [
      fhirPatient.practitioners[0].name[0].prefix[0],
      fhirPatient.practitioners[0].name[0].given[0],
      fhirPatient.practitioners[0].name[0].family,
    ].join(' ');
  }

  return struct;
};

export const normalizePatientOrganization = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.organization);

  if (fhirPatient.organization) {
    struct.id = fhirPatient.organization.id;
    struct.name = fhirPatient.organization.name;
  }

  return struct;
};

export const normalizePatientConsultations = fhirPatient => fhirPatient.clinicalImpressions.reduce((result, current) => {
  result.push({
    id: current.id,
    age: current.runtimePatientAge,
    date: (current.effective ? current.effective.dateTime : ''),
    practitioner: 'N/A',
  });

  return result;
}, []);

export const normalizePatientRequests = fhirPatient => fhirPatient.serviceRequests.reduce((result, current) => {
  result.push({
    id: current.id,
    date: current.authoredOn,
    type: (current.code ? current.code.text : ''),
    author: 'N/A',
    specimen: 'N/A',
    consulation: 'N/A',
    status: current.status,
  });

  return result;
}, []);

export const normalizePatientObservations = fhirPatient => fhirPatient.observations.reduce((result, current) => {
  if (current.code.text.toLowerCase().indexOf('medical') !== -1) {
    result.push({
      id: current.id,
      date: (current.effective ? current.effective.dateTime : ''),
      note: (current.note[0] ? current.note[0].text : ''),
    });
  }

  return result;
}, []);

export const normalizePatientIndications = fhirPatient => fhirPatient.observations.reduce((result, current) => {
  if (current.code.text.toLowerCase().indexOf('indication') !== -1) {
    result.push({
      id: current.id,
      date: (current.effective ? current.effective.dateTime : ''),
      note: (current.note[0] ? current.note[0].text : ''),
    });
  }

  return result;
}, []);

export const normalizePatientOntology = fhirPatient => fhirPatient.observations.reduce((result, current) => {
  if (current.code.text.toLowerCase().indexOf('phenotype') !== -1 && current.phenotype) {
    result.push({
      ontologie: 'HPO',
      code: (current.phenotype[0] ? current.phenotype[0].code : ''),
      term: (current.phenotype[0] ? current.phenotype[0].display : ''),
      note: (current.note ? current.note[0].text : ''),
      observed: 'N/A',
      consultation: 'N/A',
      date: (current.effective ? current.effective.dateTime : ''),
    });
  }

  return result;
}, []);

export const normalizePatientSamples = fhirPatient => fhirPatient.specimens.reduce((result, current) => {
  result.push({
    type: 'DNA',
    id: current.id,
    barcode: (current.container ? current.container[0] : ''),
    request: (current.request ? current.request[0] : ''),
  });

  return result;
}, []);
