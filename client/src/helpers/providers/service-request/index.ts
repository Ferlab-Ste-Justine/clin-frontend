import { get, has } from "lodash";
import { Practitioner, ServiceRequest } from "../../fhir/types";
import { PractitionerData, Prescription } from "../types";
//@ts-ignore
import { DataExtractor } from "../extractor.ts";
//@ts-ignore
import { Provider, Record } from "../providers.ts";

export class ServiceRequestProvider extends Provider<ServiceRequest, Prescription> {
  constructor(name: string) {
    super(name);
  }

  public doProvide(dataExtractor: DataExtractor): Record<ServiceRequest, Prescription> {
    const serviceRequestBundle = dataExtractor.extractBundle("ServiceRequest");

    const serviceRequest = dataExtractor.extractResource<ServiceRequest>(serviceRequestBundle, "ServiceRequest");

    const practitioners = dataExtractor.extractResources<Practitioner>(serviceRequestBundle, "Practitioner");
    let performer: PractitionerData | undefined = undefined;
    if (has(serviceRequest, "performer[0]") && practitioners.length > 0) {
      const prefix = get(practitioners, ["0", "name", "0", "prefix", "0"], "Dr.");
      const lastName = get(practitioners, ["0", "name", "0", "given"], "");
      const firstName = get(practitioners, ["0", "name", "0", "given", "0"], "");
      const suffix = get(practitioners, ["0", "name", "0", "suffix", "0"], "");

      const practMetadata = dataExtractor.getPractitionerMetaData(get(practitioners, ["0", "id"]));

      performer = {
        name: `${prefix} ${firstName} ${lastName} ${suffix}`,
        email:
          practMetadata != null && practMetadata.role != null
            ? dataExtractor.extractEmail(practMetadata.role.telecom)
            : "No email.",
        hospital: "ORGANIZATION",
        phone:
          practMetadata != null && practMetadata.role != null
            ? `${dataExtractor.extractPhone(practMetadata.role.telecom)} - ${dataExtractor.extractExtension(
                practMetadata.role.telecom
              )}`
            : "No phone.",
      };
    }

    const prescription: Prescription = {
      date: serviceRequest.authoredOn,
      performer,
      status: serviceRequest.status,
      test: get(serviceRequest, "code.coding[0].code", "N/A"),
    };

    return [
      {
        original: serviceRequest,
        parsed: prescription,
      },
    ];
  }
}
