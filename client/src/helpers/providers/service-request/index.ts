import { get } from 'lodash';
import { ServiceRequest } from '../../fhir/types';
import { Prescription } from '../types';
import { DataExtractor } from '../extractor';
import { Provider, Record } from '../providers';

const IS_SUBMITTED_EXT = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted';
const ON_HOLD = 'on-hold';
const INCOMPLETE = 'incomplete';

export class ServiceRequestProvider extends Provider<ServiceRequest, Prescription> {
  constructor(name: string) {
    super(name);
  }

  private getStatus(dataExtractor: DataExtractor, serviceRequest: ServiceRequest) : string {
    if (serviceRequest.status !== ON_HOLD) {
      return serviceRequest.status;
    }

    const isSubmittedExtension = dataExtractor.getExtension(serviceRequest, IS_SUBMITTED_EXT);
    return isSubmittedExtension.valueBoolean ? ON_HOLD : INCOMPLETE;
  }

  public doProvide(dataExtractor: DataExtractor): Record<ServiceRequest, Prescription>[] {
    const serviceRequestBundle = dataExtractor.extractBundle('ServiceRequest');
    const serviceRequest = dataExtractor.extractResource<ServiceRequest>(serviceRequestBundle, 'ServiceRequest');

    const prescription: Prescription = {
      id: serviceRequest.id,
      date: serviceRequest.authoredOn,
      requester: dataExtractor.getPractitionerDataFromPractitioner(serviceRequest, 'requester', serviceRequestBundle)!,
      status: this.getStatus(dataExtractor, serviceRequest),
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
