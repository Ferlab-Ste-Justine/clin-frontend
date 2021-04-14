import flatten from 'lodash/flatten';
import { v4 as uuid } from 'uuid';
import { ApiError } from '../../api';
import httpClient from '../../http-client';
import { BundleBuilder } from '../builder/BundleBuilder';
import { BundleIdExtractor } from '../BundleIdExtractor';
import {
  Bundle, ClinicalImpression, FamilyMemberHistory, FhirResource, Observation, ServiceRequest,
} from '../types';

const CLINICAL_IMPRESSION_REF = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression';

export type CreateRequestBatch = {
  length: number;
  serviceRequests: ServiceRequest[];
  clinicalImpressions: ClinicalImpression[];
  observations: Observation[];
  hpos: Observation[];
  fmhs: FamilyMemberHistory[];
  submitted: boolean;
  update: boolean;
}

type CreateRequestResponse = {
  serviceRequests: FhirResource[];
}

const identify = (resource: any) => ({ ...resource, id: `urn:uuid:${uuid()}` });

const generateResourcesFromBatch = (batch: CreateRequestBatch) => {
  const allResources = batch.serviceRequests.map((serviceRequest, index) => {
    const clinicalImpression = identify(batch.clinicalImpressions[index]);
    const sr = identify(serviceRequest);

    sr.extension.push({
      url: CLINICAL_IMPRESSION_REF,
      valueReference: {
        reference: clinicalImpression.id,
      },
    });

    const resources: any[] = [
      sr,
      clinicalImpression,
      ...batch.observations.map((observation) => identify(observation)),
      ...batch.hpos.map((hpo) => identify(hpo)),
      ...batch.fmhs.map((fmh) => identify(fmh)),
    ];

    [...resources].splice(2).forEach((resource) => {
      clinicalImpression.investigation[0].item.push({ reference: resource.id });
    });
    return resources;
  });
  return flatten(allResources);
};

export const createRequest = async (batch: CreateRequestBatch) : Promise<CreateRequestResponse> => {
  if (batch.length === 0) {
    throw new ApiError('Cannot create a ClinicalImpression without observations');
  }

  const builder = new BundleBuilder()
    .withType('Transaction');

  const resources = generateResourcesFromBatch(batch);
  resources.forEach((resource) => builder.withPostResource(resource));

  const bundle: Bundle = builder.build();

  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/`, bundle);
  const data = BundleIdExtractor.extractIds(
    response,
    ...batch.serviceRequests,
    ...batch.clinicalImpressions,
    ...batch.observations,
    ...batch.hpos,
    ...batch.fmhs,
  );

  const output: CreateRequestResponse = {
    serviceRequests: data.filter((resource) => resource.resourceType === 'ServiceRequest'),
  };

  return output;
};

export const updateRequest = async (batch: CreateRequestBatch) : Promise<CreateRequestBatch> => {
  if (batch.length === 0) {
    throw new ApiError('Cannot create a ClinicalImpression without observations');
  }

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

  const response = await httpClient.secureClinAxios.post(`${window.CLIN.fhirBaseUrl}/`, bundle);
  const data = BundleIdExtractor.extractIds(
    response,
    ...batch.serviceRequests,
    ...batch.clinicalImpressions,
    ...batch.observations,
    ...batch.hpos,
    ...batch.fmhs,
  );

  const output: CreateRequestBatch = {
    serviceRequests: [],
    clinicalImpressions: [],
    observations: [],
    hpos: [],
    fmhs: [],
    length: batch.length,
    submitted: batch.submitted,
    update: batch.update,
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

  return output;
};
