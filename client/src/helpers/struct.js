/* eslint-disable import/no-cycle */
import { initialPatientState } from '../reducers/patient';


export const normalizePatientDetails = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.details);

  struct.id = fhirPatient.id;
  struct.firstName = '*** John ***';
  struct.lastName = '*** Doe ***';
  struct.birthDate = fhirPatient.birthDate;
  struct.gender = fhirPatient.gender;
  struct.ethnicity = fhirPatient.ethnicity;
  struct.proband = fhirPatient.isProband;
  struct.mrn = fhirPatient.identifier.MR;
  struct.ramq = fhirPatient.identifier.JHN;

  return struct;
};

export const normalizePatientFamily = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.family);

  struct.id = fhirPatient.familyId;
  struct.composition = fhirPatient.familyComposition;
  struct.members.proband = fhirPatient.id;
  struct.members.mother = '*** ??? ***';
  struct.members.father = '*** ??? ***';
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
    struct.name = fhirPatient.studies[0].name;
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

  struct.id = fhirPatient.organization.id;
  struct.name = fhirPatient.organization.name;

  return struct;
};

export const normalizePatientConsultations = fhirPatient => fhirPatient.clinicalImpressions.reduce((result, current) => {
  result.push({
    id: current.id,
    age: current.runtimePatientAge,
    date: current.effective.dateTime,
    practitioner: '*** Dr Potato ***',
  });
  return result;
}, []);

export const normalizePatientRequests = fhirPatient => fhirPatient.serviceRequests.reduce((result, current) => {
  result.push({
    id: current.id,
    date: current.authoredOn,
    type: current.code.text,
    author: '*** Mme Patate ***',
    specimen: '*** SP000002 ***',
    consulation: '*** CI930983 ***',
    status: current.status,
  });
  return result;
}, []);

export const normalizePatientObservations = fhirPatient => fhirPatient.observations.reduce((result, current) => {
  if (!current.phenotype) {
    result.push({
      id: current.id,
      date: current.effective.dateTime,
      note: current.note[0].text,
    });
  }
  return result;
}, []);

export const normalizePatientOntology = fhirPatient => fhirPatient.observations.reduce((result, current) => {
  if (current.phenotype) {
    result.push({
      ontologie: '*** HPO ***',
      code: current.phenotype[0].code,
      term: current.phenotype[0].display,
      note: '*** ??? ***',
      observed: '*** Oui ***',
      date: current.effective.dateTime,
      apparition: '*** 31-03-2019 ***',
    });
  }
  return result;
}, []);

export const normalizePatientSamples = fhirPatient => fhirPatient.specimens.reduce((result, current) => {
  result.push({
    id: current.id,
    barcode: '*** 38939eiku77 ***',
    type: current.container[0],
    request: current.request[0],
  });
  return result;
}, []);

export const normalizePatientIndications = () => [{
  note: '*** Suspicion d\'une mutation a transmission récessive qui atteint le tissus musculaire ***',
  date: '*** 2019-12-01 ***',
}];
