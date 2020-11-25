import { get } from 'lodash';
import { ServiceRequest } from '../../fhir/types';
import { Prescription } from '../types';
import { DataExtractor } from '../extractor';
// @ts-ignore
import { Provider, Record } from '../providers.ts';

export class ServiceRequestProvider extends Provider<ServiceRequest, Prescription> {
  constructor(name: string) {
    super(name);
  }

  public doProvide(dataExtractor: DataExtractor): Record<ServiceRequest, Prescription> {
    const serviceRequestBundle = dataExtractor.extractBundle('ServiceRequest');

    const serviceRequest = dataExtractor.extractResource<ServiceRequest>(serviceRequestBundle, 'ServiceRequest');

    const prescription: Prescription = {
      date: serviceRequest.authoredOn,
      requester: dataExtractor.getPractitionerDataByReference(serviceRequest, 'requester', serviceRequestBundle),
      performer: dataExtractor.getPractitionerDataByReference(serviceRequest, 'performer[0]', serviceRequestBundle),
      status: serviceRequest.status,
      test: get(serviceRequest, 'code.coding[0].code', 'N/A'),
    };

    return [
      {
        original: serviceRequest,
        parsed: prescription,
      },
    ];
  }
}
