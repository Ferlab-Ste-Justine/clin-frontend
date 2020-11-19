import { get, has } from "lodash";
import { Organization, Practitioner, PractitionerRole, ResourceType, Telecom } from "../fhir/types";
import { PractitionerData } from "./types";

type BundleType = "Patient" | "ServiceRequest" | "ClinicalImpression" | "FamilyGroup";

type PractitionersData = {
  entry?: { resource: { entry?: { resource: PractitionerRole }[] } }[];
};

type PractitionerMetaData = {
  organization?: Organization;
  role?: PractitionerRole;
};

type Data = {
  patientData: any;
  practitionersData: PractitionersData;
};

const PRACTITIONER_NOT_FOUND: PractitionerData = {
  email: "N/A",
  name: "N/A",
  phone: "N/A",
  mrn: "N/A",
  organization: "N/A",
  phoneExtension: "N/A",
}

export class DataExtractor {
  constructor(private readonly data: Data) {}

  public extractBundle(type: BundleType): any {
    switch (type) {
      case "Patient":
        return this.data.patientData.entry[0].resource;
      case "FamilyGroup":
        return this.data.patientData.entry[1].resource;
      case "ServiceRequest":
        return this.data.patientData.entry[2].resource;
      case "ClinicalImpression":
        return this.data.patientData.entry[3].resource;
      default:
        throw new Error(`Invalid bundle type ${type}`);
    }
  }

  public getPractitionerMetaData(id: string): PractitionerMetaData | undefined {
    if (this.data.practitionersData.entry == null) {
      return null;
    }
    for (let i = 0; i < this.data.practitionersData.entry.length; i++) {
      if (this.data.practitionersData.entry[i].resource.entry == null) {
        continue;
      }

      if (has(this.data.practitionersData.entry[i], "resource.entry[0]")) {
        const resource = this.data.practitionersData.entry[i].resource.entry[0].resource;
        if (resource.practitioner.reference.indexOf(id) !== -1) {
          return {
            role: resource,
            organization: get(this.data.practitionersData.entry[i], "resource.entry[1]", null),
          };
        }
      }
    }
    return undefined;
  }

  public extractResource<T>(data: any, resourceType: ResourceType): T {
    return data.entry.find((entry) => entry.resource.resourceType === resourceType).resource as T;
  }

  public extractResources<T>(data: any, resourceType: ResourceType): T[] {
    return data.entry
      .filter((entry) => entry.resource.resourceType === resourceType)
      .map((entry) => entry.resource as T) as T[];
  }

  public getExtension(data: any, url: string) {
    return data.extension.find((ext) => ext.url === url);
  }

  public extractEmail(telecom: Telecom[]): string {
    const email = telecom.find((tel) => tel.system === "email");
    return get(email, "value", "N/A");
  }

  public extractPhone(telecom: Telecom[]): string {
    const phone = telecom.find((tel) => tel.system === "phone" && tel.rank === 1);
    return get(phone, "value", "N/A");
  }

  public extractPhoneExtension(telecom: Telecom[]): string {
    const ext = telecom.find((tel) => tel.system === "phone" && tel.rank === 0);
    return get(ext, "value", "N/A");
  }

  public getPractitionerDataByReference(resource: any, attributeName: string, bundle: any): PractitionerData {
    const reference = get(resource, `${attributeName}.reference`, null);
    if (reference == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const id = reference.split("/")[1];
    const practitioners = this.extractResources<Practitioner>(bundle, "Practitioner");
    const practitioner = practitioners.find((pract) => pract.id === id);
    if (practitioner == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const practMetadata = this.getPractitionerMetaData(id);
    if (practMetadata == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const prefix = get(practitioner, ["name", "0", "prefix", "0"], "Dr.");
    const lastName = get(practitioner, ["name", "0", "family"], "");
    const firstName = get(practitioner, ["name", "0", "given", "0"], "");
    const suffix = get(practitioner, ["name", "0", "suffix", "0"], "");

    return {
      organization: get(practMetadata.organization, "resource.name", "N/A"),
      mrn: get(practitioner, "identifier[0].value", "N/A"),
      name: `${prefix} ${firstName} ${lastName.toUpperCase()} ${suffix !== "null" ? suffix : ""}`,
      email: practMetadata.role != null ? this.extractEmail(practMetadata.role.telecom) : "No email.",
      phone: practMetadata.role != null
          ? `${this.extractPhone(practMetadata.role.telecom)}`
          : "N/A",
          phoneExtension:  this.extractPhoneExtension(practMetadata.role.telecom)
    };
  }
}
