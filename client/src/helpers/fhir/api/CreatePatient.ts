import { get } from 'lodash';
import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import { Bundle, FamilyGroup, Patient } from '../types';

type Response = {
    patient: Patient;
    familyGroup: FamilyGroup;
}

export const createPatient = async (patient: Patient, familyGroup: FamilyGroup) : Promise<Response> => {
  const bundleId = window.CLIN.fhirEsPatientBundleId;
  const bundle: Bundle = new BundleBuilder()
    .withId(bundleId)
    .withType('Transaction')
    .withResource(patient)
    .withResource(familyGroup)
    .build();

  const memebers = get(bundle, 'entry[1].resource.member', []);
  memebers.push({
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
