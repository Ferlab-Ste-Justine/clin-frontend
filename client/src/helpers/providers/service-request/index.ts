import get from 'lodash/get';
import head from 'lodash/head';
import { ExtensionUrls } from 'store/urls'
import { Practitioner, ServiceRequest, SupervisorsBundle } from '../../fhir/types';
import { PractitionerData, Prescription, PrescriptionStatus } from '../types';
import { DataExtractor } from '../extractor';
import { Provider, Record } from '../providers';
import { getNoteComment, getNoteStatus } from 'helpers/fhir/ServiceRequestNotesHelper';

const IS_SUBMITTED_EXT = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted';
const CLIN_REF_EXT = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/ref-clin-impression';

const ON_HOLD = 'on-hold';
const INCOMPLETE = 'incomplete';

export class ServiceRequestProvider extends Provider<ServiceRequest, Prescription> {
  
  supervisors: SupervisorsBundle;

  constructor(name: string, supervisors: SupervisorsBundle) {
    super(name);
    this.supervisors = supervisors;
  }

  private getStatus(dataExtractor: DataExtractor, serviceRequest: ServiceRequest): string {
    if (serviceRequest.status !== ON_HOLD) {
      return serviceRequest.status;
    }

    const isSubmittedExtension = dataExtractor.getExtension(serviceRequest, IS_SUBMITTED_EXT);
    return isSubmittedExtension.valueBoolean ? ON_HOLD : INCOMPLETE;
  }

  private getClinicalImpressionRef(dataExtractor: DataExtractor, serviceRequest: ServiceRequest): string {
    return get(dataExtractor.getExtension(serviceRequest, CLIN_REF_EXT), 'valueReference.reference');
  }

  private getSupervisor(dataExtractor: DataExtractor, serviceRequest: ServiceRequest): PractitionerData {
    const ext = dataExtractor.getExtension(serviceRequest, ExtensionUrls.ResidentSupervisor);
    const ref = get(ext, 'valueReference.reference');
    const id = ref && ref.split('/')[1]
    const practitioner = id && head(this.supervisors?.entry.flatMap((e: any) => {
      const res = get(e, 'resource.entry[0].resource')
      return res?.id === id ? res : []
    }))
    return practitioner && dataExtractor.formatPractitioner(practitioner as Practitioner);
  }

  public doProvide(dataExtractor: DataExtractor): Record<ServiceRequest, Prescription>[] {
    const serviceRequestBundle = dataExtractor.extractBundle('ServiceRequest');
    const serviceRequests = dataExtractor.extractResources<ServiceRequest>(serviceRequestBundle, 'ServiceRequest');

    const prescriptions: Prescription[] = serviceRequests.map((serviceRequest: ServiceRequest) => ({
      id: serviceRequest.id,
      date: serviceRequest.authoredOn,
      supervisor: this.getSupervisor(dataExtractor, serviceRequest),
      requester: dataExtractor.getPractitionerDataFromPractitioner(serviceRequest, 'requester', serviceRequestBundle)!,
      status: this.getStatus(dataExtractor, serviceRequest) as PrescriptionStatus,
      test: get(serviceRequest, 'code.coding[0].display', 'N/A'),
      note: getNoteComment(serviceRequest),
      noteStatus: getNoteStatus(serviceRequest),
      clinicalImpressionRef: this.getClinicalImpressionRef(dataExtractor, serviceRequest),
      mrn: get(serviceRequest, 'identifier[0].value', '--'),
      organization: get(serviceRequest, 'identifier[0].assigner.reference', '--/--').split('/')[1],
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
