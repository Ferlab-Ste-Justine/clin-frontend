import { get } from 'lodash';
import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import { Bundle, FamilyGroup, Patient } from '../types';

type CreatePatientResponse = {
    patient: Patient;
    familyGroup: FamilyGroup;
}

export const createPatient = async (patient: Patient, familyGroup: FamilyGroup) : Promise<CreatePatientResponse> => {
  const bundleId = window.CLIN.fhirEsPatientBundleId;
  const bundle: Bundle = new BundleBuilder()
    .withId(bundleId)
    .withType('Transaction')
    .withResource(patient)
    .withResource(familyGroup)
    .build();

  const members = get(bundle, 'entry[1].resource.member', []);
  members.push({
    entity: {
      reference: get(bundle, 'entry[0].fullUrl'),
    },
  });

  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/?id=${bundleId}`, bundle);
  const data = BundleIdExtractor.extractIds(response, patient, familyGroup);

  const p = data[0] as Patient;
  const fg = data[1] as FamilyGroup;

  fg.member = [{
    entity: {
      reference: `Patient/${p.id}`,
    },
  }];

  return {
    patient: p,
    familyGroup: fg,
  };
};

type CreatePatientFetusResponse = {
  patient: Patient;
  patientFetus: Patient;
  familyGroup?: FamilyGroup;
}

const EXTENSION_IS_FETUS = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus';

export const createPatientFetus = async (patient: Patient, familyGroup?: FamilyGroup) : Promise<CreatePatientFetusResponse> => {
  const patientFetus = JSON.parse(JSON.stringify(patient)) as Patient;
  patientFetus.id = undefined;

  patientFetus.extension.find((ext) => ext.url === EXTENSION_IS_FETUS)!.valueBoolean = true;
  patientFetus.extension.push({
    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
    extension: [
      {
        url: 'subject',
        valueReference: {
          reference: `Patient/${patient.id}`,
        },
      },
      {
        url: 'relation',
        valueCodeableConcept: {
          coding: [{
            code: 'NMTHF',
            display: 'natural mother of fetus',
            system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
          }],
        },
      },
    ],
  });

  const bundleId = window.CLIN.fhirEsPatientBundleId;
  const builder = new BundleBuilder()
    .withId(bundleId)
    .withType('Transaction')
    .withResource(patient)
    .withResource(patientFetus);

  const isNewPatient = patient.id == null;

  if (isNewPatient) {
    builder.withResource(familyGroup);
  }

  const bundle: Bundle = builder.build();

  if (isNewPatient) {
    const members = get(bundle, 'entry[2].resource.member', []);
    members.push({
      entity: {
        reference: get(bundle, 'entry[0].fullUrl'),
      },
    });
    members.push({
      entity: {
        reference: get(bundle, 'entry[1].fullUrl'),
      },
    });
  }
  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/?id=${bundleId}`, bundle);
  const extractResources: any[] = [patient, patientFetus];

  if (isNewPatient) {
    extractResources.push(familyGroup);
  }

  const data = BundleIdExtractor.extractIds(response, ...extractResources);

  const p = data[0] as Patient;
  const pf = data[1] as Patient;

  if (isNewPatient) {
    const fg = data[2] as FamilyGroup;

    fg.member = [{
      entity: {
        reference: `Patient/${p.id}`,
      },
    }];
  }

  return {
    patient: p,
    patientFetus: pf,
    familyGroup: isNewPatient ? data[2] as FamilyGroup : undefined,
  };
};
