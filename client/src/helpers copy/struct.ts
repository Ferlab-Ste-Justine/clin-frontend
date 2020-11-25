/* eslint-disable import/no-cycle */
import { has } from 'lodash';
import { Patient, ResourceType } from './fhir/types';

// THIS REDUCER NEEDS TO BE REMOVED WHEN THE NEW PATIENT PAGE IS IMPLEMENTED.
// INSTEAD, HANDLE ALL YOUR DATA IN THE REDUCER patient.ts.

type BundleType = 'Patient' | 'ServiceRequest' | 'ClinicalImpression' | 'FamilyGroup';

const extractBundle = (data: any, type: BundleType) => {
  switch (type) {
    case 'Patient':
      return data.entry[0].resource;
    case 'FamilyGroup':
      return data.entry[1].resource;
    case 'ServiceRequest':
      return data.entry[2].resource;
    case 'ClinicalImpression':
      return data.entry[3].resource;
    default:
      throw new Error(`Invalid bundle type ${type}`);
  }
};

const extractResource = <T>(data: any, resourceType: ResourceType) => data.entry.find((entry:any) => entry.resource.resourceType === resourceType).resource as T;

export const normalizePatientDetails = (data: any) => {
  const patientBundle = extractBundle(data, 'Patient');
  const patient = extractResource<Patient>(patientBundle, 'Patient');
  const ethnicity = patient.extension.find(
    (extension) => extension.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity',
  );
  const isProband = patient.extension.find(
    (extension) => extension.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
  );
  const bloodRelationship = patient.extension.find(
    (extension) => extension.url === 'http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship',
  );

  // const struct = Object.assign({}, initialPatientState.);
  const struct: any = {};

  struct.id = patient.id;
  struct.firstName = patient.name ? patient.name[0].given[0] : '';
  struct.lastName = patient.name ? patient.name[0].family : '';
  struct.birthDate = patient.birthDate;
  struct.gender = patient.gender;
  struct.ethnicity = has(ethnicity, 'valueCoding.display') ? ethnicity!.valueCoding!.display : 'Unknown';
  struct.proband = isProband!.valueBoolean;
  struct.mrn = patient.identifier[0].value;
  struct.ramq = patient.identifier.length > 1 ? patient.identifier[1].value : ' - ';
  struct.bloodRelationship = bloodRelationship == null ? 'No' : bloodRelationship!.valueCoding!.display;

  return struct;
};
