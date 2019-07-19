/* eslint-disable import/no-cycle */
import { find } from 'lodash';
import { initialPatientState } from '../reducers/patient';


export const normalizePatientDetails = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.details);

  struct.id = fhirPatient.id;
  struct.firstName = (fhirPatient.name ? fhirPatient.name[0].given[0] : '');
  struct.lastName = (fhirPatient.name ? fhirPatient.name[0].family : '');
  struct.birthDate = fhirPatient.birthDate;
  struct.gender = fhirPatient.gender;
  struct.ethnicity = fhirPatient.ethnicity;
  struct.proband = fhirPatient.isProband ? 'Proband' : 'Parent';
  struct.mrn = (fhirPatient.identifier ? fhirPatient.identifier.MR : '');
  struct.ramq = (fhirPatient.identifier ? fhirPatient.identifier.JHN : '');

  return struct;
};

export const normalizePatientFamily = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.family);
  const mother = find(fhirPatient.link, { relationship: 'MTH' });
  const father = find(fhirPatient.link, { relationship: 'FTH' });

  struct.id = fhirPatient.familyId;
  struct.composition = fhirPatient.familyComposition;
  struct.members.proband = fhirPatient.id;
  struct.members.mother = mother ? mother.id : '';
  struct.members.father = father ? father.id : '';
  struct.history = fhirPatient.familyMemberHistory ? fhirPatient.familyMemberHistory.reduce((result, current) => {
    result.push({
      id: current.id,
      date: current.date,
      note: current.note[0].text,
    });
    return result;
  }, []) : [];

  return struct;
};

export const normalizePatientStudy = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.study);

  if (fhirPatient.studies && fhirPatient.studies[0]) {
    struct.id = fhirPatient.studies[0].id;
    struct.name = fhirPatient.studies[0].title;
  }

  return struct;
};


export const normalizePatientPractitioner = (fhirPatient) => {
  const struct = Object.assign({}, initialPatientState.practitioner);

  if (fhirPatient.practitioners && fhirPatient.practitioners[0]) {
    struct.id = fhirPatient.practitioners[0].id;
    struct.rid = fhirPatient.practitioners[0].role_id;
    struct.mln = fhirPatient.practitioners[0].identifier.MD;
    const nameParts = [
      fhirPatient.practitioners[0].name[0].given[0],
      fhirPatient.practitioners[0].name[0].family,
    ];
    if (fhirPatient.practitioners[0].name[0].prefix) {
      nameParts.unshift(fhirPatient.practitioners[0].name[0].prefix[0]);
    }
    if (fhirPatient.practitioners[0].name[0].suffix) {
      nameParts.push(fhirPatient.practitioners[0].name[0].suffix[0]);
    }
    struct.name = nameParts.join(' ');
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

export const normalizePatientConsultations = fhirPatient => (fhirPatient.clinicalImpressions
  ? fhirPatient.clinicalImpressions.reduce((result, current) => {
    const nameParts = [
      current.assessor_name[0].given[0],
      current.assessor_name[0].family,
    ];
    if (current.assessor_name[0].prefix) {
      nameParts.unshift(current.assessor_name[0].prefix[0]);
    }
    if (current.assessor_name[0].suffix) {
      nameParts.push(current.assessor_name[0].suffix[0]);
    }
    result.push({
      id: current.id,
      age: current.runtimePatientAge,
      date: (current.ci_consultation_date ? current.ci_consultation_date.dateTime : ''),
      assessor: nameParts.join(' '),
      organization: current.assessor_org_name || '',
    });

    return result;
  }, []) : []);

export const normalizePatientRequests = fhirPatient => (fhirPatient.serviceRequests
  ? fhirPatient.serviceRequests.reduce((result, current) => {
    const nameParts = [
      current.requester_name[0].given[0],
      current.requester_name[0].family,
    ];
    if (current.requester_name[0].prefix) {
      nameParts.unshift(current.requester_name[0].prefix[0]);
    }
    if (current.requester_name[0].suffix) {
      nameParts.push(current.requester_name[0].suffix[0]);
    }
    result.push({
      id: current.id,
      date: current.authoredOn,
      type: (current.code ? current.code.text : ''),
      status: current.status,
      intent: (current.intent ? current.intent : ''),
      specimen: (current.specimen ? current.specimen[0].id : ''),
      requester: nameParts.join(' '),
      organization: current.requester_org_name || '',
      consulation: current.ci_ref || '',
    });

    return result;
  }, []) : []);

export const normalizePatientObservations = fhirPatient => (fhirPatient.observations
  ? fhirPatient.observations.reduce((result, current) => {
    if (current.code.text.toLowerCase().indexOf('medical') !== -1) {
      result.push({
        id: current.id,
        date: (current.effective ? current.effective.dateTime : ''),
        note: (current.note[0] ? current.note[0].text : ''),
      });
    }

    return result;
  }, []) : []);

export const normalizePatientIndications = fhirPatient => (fhirPatient.observations
  ? fhirPatient.observations.reduce((result, current) => {
    if (current.code.text.toLowerCase().indexOf('indication') !== -1) {
      result.push({
        id: current.id,
        date: (current.effective ? current.effective.dateTime : ''),
        note: (current.note[0] ? current.note[0].text : ''),
      });
    }

    return result;
  }, []) : []);

export const normalizePatientOntology = fhirPatient => (fhirPatient.observations
  ? fhirPatient.observations.reduce((result, current) => {
    if (current.code.text.toLowerCase().indexOf('phenotype') !== -1) {
      result.push({
        ontologie: 'HPO',
        code: (current.phenotype[0] ? current.phenotype[0].code : ''),
        term: (current.phenotype[0] ? current.phenotype[0].display : ''),
        note: (current.note ? current.note[0].text : ''),
        observed: current.observed || '',
        consultation: 'N/A',
        date: (current.effective ? current.effective.dateTime : ''),
      });
    }

    return result;
  }, []) : []);

export const normalizePatientSamples = fhirPatient => (fhirPatient.specimens
  ? fhirPatient.specimens.reduce((result, current) => {
    result.push({
      type: 'DNA',
      id: current.id,
      barcode: (current.container ? current.container[0] : ''),
      request: (current.request ? current.request[0] : ''),
    });

    return result;
  }, []) : []);
