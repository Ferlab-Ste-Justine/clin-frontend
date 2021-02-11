import { ApiError } from '../../api';
import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import {
  Bundle, ClinicalImpression, FamilyMemberHistory, Observation, ServiceRequest,
} from '../types';

const CLINICAL_IMPRESSION_REF = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression';

// type Response = {
//   clinicalImpression: ClinicalImpression;
//   serviceRequest: ServiceRequest;
//   observations: Observation[];
// }
// .clinicalImpression, action.payload.serviceRequest, action.payload.observations
type Batch = {
  length: number;
  serviceRequests: ServiceRequest[];
  clinicalImpressions: ClinicalImpression[];
  observations: Observation[];
  hpos: Observation[];
  fmhs: FamilyMemberHistory[];
}

export const createRequest = async (batch: Batch) : Promise<Batch> => {
  if (batch.length === 0) {
    throw new ApiError('Cannot create a ClinicalImpression without observations');
  }

  // if (serviceRequest.extension.find((ext) => ext.url === CLINICAL_IMPRESSION_REF) == null) {
  //   throw new ApiError('Cannot create Patient Request: ServiceRequest not referencing ClinicalImpression');
  // }

  // const bundleId = window.CLIN.fhirEsRequestBundleId;
  const builder = new BundleBuilder()
    .withType('Transaction');

  batch.serviceRequests.forEach((serviceRequest) => builder.withResource(serviceRequest));
  batch.clinicalImpressions.forEach((clinicalImpression) => builder.withResource(clinicalImpression));
  batch.observations.forEach((observation) => builder.withResource(observation));
  batch.hpos.forEach((hpo) => builder.withResource(hpo));
  batch.fmhs.forEach((fmh) => builder.withResource(fmh));

  const bundle: Bundle = builder.build();

  // Link the service request to their respective clinical impression
  for (let i = 0; i < batch.length; i++) {
    (<ServiceRequest>bundle.entry[i].resource).extension.push({
      url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression',
      valueReference: {
        reference: bundle.entry[batch.length + i].fullUrl!,
      },
    });
  }

  // Link the clinical impressions with their observations, hpos et fmhs
  const observationStartIndex = batch.length * 2;
  const hpoStartIndex = observationStartIndex + batch.observations.length;
  const fmhStartIndex = hpoStartIndex + batch.hpos.length;

  for (let i = batch.length; i < batch.length * 2; i++) {
    const clinicalImpression = (<ClinicalImpression>bundle.entry[i].resource);

    for (let j = observationStartIndex; j < observationStartIndex + batch.observations.length; j++) {
      clinicalImpression.investigation[0].item.push({ reference: bundle.entry[j].fullUrl! });
    }

    for (let j = hpoStartIndex; j < hpoStartIndex + batch.hpos.length; j++) {
      clinicalImpression.investigation[0].item.push({ reference: bundle.entry[j].fullUrl! });
    }

    for (let j = fmhStartIndex; j < fmhStartIndex + batch.fmhs.length; j++) {
      clinicalImpression.investigation[0].item.push({ reference: bundle.entry[j].fullUrl! });
    }
  }

  // observations.forEach((observation) => builder.withResource(observation));

  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/`, bundle);
  const data = BundleIdExtractor.extractIds(
    response,
    ...batch.serviceRequests,
    ...batch.clinicalImpressions,
    ...batch.observations,
    ...batch.hpos,
    ...batch.fmhs,
  );

  const output: Batch = {
    serviceRequests: [],
    clinicalImpressions: [],
    observations: [],
    hpos: [],
    fmhs: [],
    length: batch.length,
  };

  for (let i = 0; i < batch.length; i++) {
    const serviceRequest = data[i] as ServiceRequest;
    const clinicalImpression = data[batch.length + i] as ClinicalImpression;
      serviceRequest.extension.find((ext) => ext.url === CLINICAL_IMPRESSION_REF)!.valueReference = {
        reference: `${clinicalImpression.resourceType}/${clinicalImpression.id}`,
      };

      output.serviceRequests.push(serviceRequest);
  }

  for (let i = batch.length; i < batch.length * 2; i++) {
    const clinicalImpression = data[i] as ClinicalImpression;
    clinicalImpression.investigation[0].item = clinicalImpression.investigation[0].item.map((item, index) => ({
      reference: `${data[observationStartIndex + index].resourceType}/${(<any>data[observationStartIndex + index]).id}`,
    }));
    output.clinicalImpressions.push(clinicalImpression);
  }

  for (let i = observationStartIndex; i < observationStartIndex + batch.observations.length; i++) {
    output.observations.push(data[i] as Observation);
  }

  for (let i = hpoStartIndex; i < hpoStartIndex + batch.hpos.length; i++) {
    output.hpos.push(data[i] as Observation);
  }

  for (let i = fmhStartIndex; i < fmhStartIndex + batch.fmhs.length; i++) {
    output.fmhs.push(data[i] as FamilyMemberHistory);
  }

  // sr.extension.find((ext) => ext.url === CLINICAL_IMPRESSION_REF)!.valueReference = {
  //   reference: `${ci.resourceType}/${ci.id}`,
  // };

  // ci.investigation[0].item = obs.map((observation) => ({ reference: `${observation.resourceType}/${observation.id}` }));

  return output;
};
