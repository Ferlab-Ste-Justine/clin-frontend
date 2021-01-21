import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import { Bundle, FamilyGroup, Patient } from '../types';

type Response = {
    patient: Patient;
    familyGroup: FamilyGroup;
}

export const createPatient = async (patient: Patient, familyGroup: FamilyGroup) : Promise<Response> => {
  const bundle: Bundle = new BundleBuilder()
    .withId(window.CLIN.fhirEsBundleId)
    .withType('Transaction')
    .withResource('POST', patient)
    .withResource('POST', familyGroup)
    .build();

  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`, bundle);
  const data = BundleIdExtractor.extractIds(response, patient, familyGroup);
  return {
    patient: data[0] as Patient,
    familyGroup: data[1] as FamilyGroup,
  };
};
