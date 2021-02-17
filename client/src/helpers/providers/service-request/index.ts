import get from 'lodash/get';
import { ServiceRequest } from '../../fhir/types';
import { Prescription, PrescriptionStatus } from '../types';
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
    const serviceRequests = dataExtractor.extractResources<ServiceRequest>(serviceRequestBundle, 'ServiceRequest');

    const prescriptions: Prescription[] = serviceRequests.map((serviceRequest: ServiceRequest) => ({
      id: serviceRequest.id,
      date: serviceRequest.authoredOn,
      requester: dataExtractor.getPractitionerDataFromPractitioner(serviceRequest, 'requester', serviceRequestBundle)!,
      status: this.getStatus(dataExtractor, serviceRequest) as PrescriptionStatus,
      test: get(serviceRequest, 'code.coding[0].code', 'N/A'),
      note: get(serviceRequest, 'note[0].text', ''),
    }));

    const output: Record<ServiceRequest, Prescription>[] = [];
    for (let i = 0; i < prescriptions.length; i++) {
      output.push({
        original: serviceRequests[i],
        parsed: prescriptions[i],
      });
    }

    return output;
  }
}
