import { ApiError } from '../../api';
import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import {
  Bundle, ClinicalImpression, Observation, ServiceRequest,
} from '../types';

const CLINICAL_IMPRESSION_REF = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression';

type Response = {
  clinicalImpression: ClinicalImpression;
  serviceRequest: ServiceRequest;
  observations: Observation[];
}

export const createRequest = async (clinicalImpression: ClinicalImpression, serviceRequest: ServiceRequest, observations: Observation[]) : Promise<Response> => {
  if (observations.length === 0 || clinicalImpression.investigation.length !== 1) {
    throw new ApiError('Cannot create a ClinicalImpression without observations');
  }

  if (serviceRequest.extension.find((ext) => ext.url === CLINICAL_IMPRESSION_REF) == null) {
    throw new ApiError('Cannot create Patient Request: ServiceRequest not referencing ClinicalImpression');
  }

  const builder = new BundleBuilder()
    .withId(window.CLIN.fhirEsBundleId)
    .withType('Transaction')
    .withResource(clinicalImpression)
    .withResource(serviceRequest);

  observations.forEach((observation) => builder.withResource(observation));

  const bundle: Bundle = builder.build();

  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}`, bundle);
  const data = BundleIdExtractor.extractIds(response, clinicalImpression, serviceRequest, ...observations);

  const ci = data[0] as ClinicalImpression;
  const sr = data[1] as ServiceRequest;
  const obs = data.slice(2) as Observation[];

  sr.extension.find((ext) => ext.url === CLINICAL_IMPRESSION_REF)!.valueReference = {
    reference: `${ci.resourceType}/${ci.id}`,
  };

  ci.investigation[0].item = obs.map((observation) => ({ reference: `${observation.resourceType}/${observation.id}` }));

  return {
    clinicalImpression: ci,
    serviceRequest: sr,
    observations: obs,
  };
};
