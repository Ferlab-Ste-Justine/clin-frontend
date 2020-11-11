import { get, has } from "lodash";
import { Organization, PractitionerRole, ResourceType, Telecom } from "../fhir/types";

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
    console.log(id);
    console.log(this.data.practitionersData);
    for (let i = 0; i < this.data.practitionersData.entry.length; i++) {
      if (this.data.practitionersData.entry[i].resource.entry == null) {
        continue;
      }

      if (has(this.data.practitionersData.entry[i], "resource.entry[0]")) {
        const resource = this.data.practitionersData.entry[i].resource.entry[0].resource;
        console.log(resource);
        if (resource.practitioner.reference.indexOf(id) !== -1) {
          return {
            role: resource,
            organization: get(this.data.practitionersData.entry[i], "[resource, entry, 1]", null),
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

  public extractExtension(telecom: Telecom[]): string {
    const ext = telecom.find((tel) => tel.system === "phone" && tel.rank === 0);
    return get(ext, "value", "N/A");
  }
}
