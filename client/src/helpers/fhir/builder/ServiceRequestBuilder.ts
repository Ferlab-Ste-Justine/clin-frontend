import { ServiceRequest } from '../types';
import { formatDate, getExtension, getPractitionerRoleReference } from './Utils';

const EXTENSION_SUBMITTED = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted';
const SERVICE_REQUEST_CODE_SYSTEM = 'http://fhir.cqgc.ferlab.bio/CodeSystem/service-request-code';

const defaultSR = () : Partial<ServiceRequest> => ({
  resourceType: 'ServiceRequest',
  status: 'draft',
  meta: {
    profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-service-request'],
  },
  extension: [
    {
      url: EXTENSION_SUBMITTED,
      valueBoolean: false,
    },
  ],
  intent: 'order',
  category: [
    {
      text: 'MedicalRequest',
    },
  ],
  priority: 'routine',
  authoredOn: formatDate(new Date()),
  note: [],
});

type ServiceRequestCoding = 'WXS' | 'WGS' | 'GP' | undefined;

export class ServiceRequestBuilder {
    private serviceRequest: Partial<ServiceRequest> = defaultSR()

    constructor(serviceRequest: any) {
      if (serviceRequest != null) {
        this.serviceRequest = {
          ...this.serviceRequest,
          ...serviceRequest,
        };
      }
      if (this.serviceRequest.note == null) {
        this.serviceRequest.note = [];
      }
    }

    public setSubmitted(value: boolean | undefined, roleId: string) {
      const isSubmitted = value != null && value;

      const ext = getExtension(this.serviceRequest, EXTENSION_SUBMITTED);
      if (ext) {
        ext.valueBoolean = isSubmitted;
      } else {
        this.serviceRequest.extension?.push({
          url: EXTENSION_SUBMITTED,
          valueBoolean: isSubmitted,
        });
      }

      if (isSubmitted) {
        this.serviceRequest.note?.push({
          authorReference: getPractitionerRoleReference(roleId),
          text: 'Service Request submitted.',
          time: new Date().toISOString(),
        });
        this.serviceRequest.status = 'on-hold';
      }
      return this;
    }

    public addSubject(id: string) {
      this.serviceRequest.subject = {
        reference: id,
      };
      return this;
    }

    public addCoding(coding: ServiceRequestCoding) {
      if (coding !== undefined) {
        switch (coding) {
          case 'WXS':
            this.serviceRequest.code = {
              coding: [
                {
                  system: SERVICE_REQUEST_CODE_SYSTEM,
                  code: 'WXS',
                  display: 'Whole Exome Sequencing',
                },
              ],
            };
            break;
          case 'WGS':
            this.serviceRequest.code = {
              coding: [
                {
                  system: SERVICE_REQUEST_CODE_SYSTEM,
                  code: 'WGS',
                  display: 'Whole Genome Sequencing',
                },
              ],
            };
            break;
          case 'GP':
            this.serviceRequest.code = {
              coding: [
                {
                  system: SERVICE_REQUEST_CODE_SYSTEM,
                  code: 'GP',
                  display: 'Gene Panel',
                },
              ],
            };
            break;
          default:
            break;
        }
      }
      return this;
    }

    public addRequester(id: string | null) {
      if (id != null) {
        this.serviceRequest.requester = getPractitionerRoleReference(id);
      }
      return this;
    }

    public build() {
      return this.serviceRequest;
    }
}
