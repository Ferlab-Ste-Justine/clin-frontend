import get from 'lodash/get';
import set from 'lodash/set';
import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { FamilyGroupBuilder, FamilyStructure } from '../builder/FamilyGroupBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import { generateGroupStatus } from '../patientHelper';
import {
  Bundle, FamilyGroup, Patient,
} from '../types';

const EXTENSION_IS_PROBAND = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband';
const EXTENSION_IS_FETUS = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-fetus';
const EXTENSION_FAMILY_ID = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-id';
const FEMALE_GENDER = 'female';

type CreatePatientResponse = {
    patient: Patient;
    familyGroup: FamilyGroup;
}

export const createPatient = async (patient: Patient) : Promise<CreatePatientResponse> => {
  const bundleId = window.CLIN.fhirEsPatientBundleId;

  const familyGroup = new FamilyGroupBuilder()
    .withActual(true)
    .withType('person')
    .withStructure(FamilyStructure.Solo)
    .build();

  const bundle: Bundle = new BundleBuilder()
    .withId(bundleId)
    .withType('Transaction')
    .withResource(patient)
    .withResource(familyGroup)
    .build();

  const members = get(bundle, 'entry[1].resource.member', []);
  members.push({
    extension: [generateGroupStatus('AFF')],
    entity: {
      reference: get(bundle, 'entry[0].fullUrl'),
    },
  });

  patient.extension.push({
    url: EXTENSION_FAMILY_ID,
    valueReference: {
      reference: get(bundle, 'entry[1].fullUrl'),
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

export const createPatientFetus = async (patient: Patient) : Promise<CreatePatientFetusResponse> => {
  const patientFetus = JSON.parse(JSON.stringify(patient)) as Patient;
  const patientParent = JSON.parse(JSON.stringify(patient)) as Patient;
  patientFetus.id = undefined;

  patientFetus.extension.find((ext) => ext.url === EXTENSION_IS_PROBAND)!.valueBoolean = true;
  patientFetus.extension.find((ext) => ext.url === EXTENSION_IS_FETUS)!.valueBoolean = true;

  patientParent.gender = FEMALE_GENDER;

  const familyGroup = new FamilyGroupBuilder()
    .withType('person')
    .withStructure(FamilyStructure.Duo)
    .withActual(true)
    .build();

  const isNewPatient = patientParent.id == null;
  if (!isNewPatient) {
    familyGroup.id = patientParent.extension.find(
      (ext) => ext.url === EXTENSION_FAMILY_ID,
    )!.valueReference?.reference.split('/')[1];
  }

  const bundleId = window.CLIN.fhirEsPatientBundleId;
  const bundle: Bundle = new BundleBuilder()
    .withId(bundleId)
    .withType('Transaction')
    .withResource(patientParent)
    .withResource(patientFetus)
    .withResource(familyGroup)
    .build();

  // Adds reference to the fetus
  get(bundle, 'entry[0].resource.extension').push({
    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
    extension: [
      {
        url: 'subject',
        valueReference: {
          reference: get(bundle, 'entry[1].fullUrl'),
        },
      },
      {
        url: 'relation',
        valueCodeableConcept: {
          coding: [{
            code: 'CHILD',
            display: 'child',
            system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
          }],
        },
      },
    ],
  });

  // Adds reference to the parent
  get(bundle, 'entry[1].resource.extension').push({
    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
    extension: [
      {
        url: 'subject',
        valueReference: {
          reference: get(bundle, 'entry[0].fullUrl'),
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

  if (isNewPatient) {
    (<Patient>bundle.entry[0].resource).extension.push({
      url: EXTENSION_FAMILY_ID,
      valueReference: {
        reference: get(bundle, 'entry[2].fullUrl'),
      },
    });

    (<Patient>bundle.entry[1].resource).extension.push({
      url: EXTENSION_FAMILY_ID,
      valueReference: {
        reference: get(bundle, 'entry[2].fullUrl'),
      },
    });
  }

  set(bundle, 'entry[2].resource.member', [
    {
      extension: [generateGroupStatus('UNF')],
      entity: {
        reference: get(bundle, 'entry[0].fullUrl'),
      },
    },
    {
      extension: [generateGroupStatus('AFF')],
      entity: {
        reference: get(bundle, 'entry[1].fullUrl'),
      },
    },
  ]);
  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/?id=${bundleId}`, bundle);

  const data = BundleIdExtractor.extractIds(response, patient, patientFetus, familyGroup);

  const p = data[0] as Patient;
  const pf = data[1] as Patient;
  const fg = data[2] as FamilyGroup;

  fg.member = [{
    entity: {
      reference: `Patient/${p.id}`,
    },
  }, {
    entity: {
      reference: `Patient/${pf.id}`,
    },
  }];

  return {
    patient: p,
    patientFetus: pf,
    familyGroup: fg,
  };
};
