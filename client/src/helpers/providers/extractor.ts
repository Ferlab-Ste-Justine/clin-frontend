import get from 'lodash/get';
import has from 'lodash/has';
import {
  Organization, Practitioner, PractitionerRole, ResourceType, Telecom,
} from '../fhir/types';
import { PractitionerData } from './types';

type BundleType = 'Patient' | 'ServiceRequest' | 'ClinicalImpression' | 'FamilyGroup';

type PractitionersData = {
  entry?: { resource: { entry?: { resource: any }[] } }[];
};

type PractitionerMetaData = {
  organization?: Organization;
  practitioner?: Practitioner;
  role?: PractitionerRole;
};

type Data = {
  patientData: any;
  practitionersData: PractitionersData;
};

const PRACTITIONER_NOT_FOUND: PractitionerData = {
  email: 'N/A',
  firstName: 'N/A',
  lastName: 'N/A',
  formattedName: 'N/A',
  phone: 'N/A',
  mrn: 'N/A',
  organization: 'N/A',
  phoneExtension: 'N/A',
};

export class DataExtractor {
  constructor(private readonly data: Data) {}

  public extractBundle(type: BundleType): any {
    switch (type) {
      case 'Patient':
        return this.data.patientData.entry[0].resource;
      case 'FamilyGroup':
        return this.data.patientData.entry[1].resource;
      case 'ServiceRequest':
        return this.data.patientData.entry[2].resource;
      case 'ClinicalImpression':
        return this.data.patientData.entry[3].resource;
      default:
        throw new Error(`Invalid bundle type ${type}`);
    }
  }

  public getPractitionerMetaData(id: string): PractitionerMetaData | undefined {
    if (this.data.practitionersData.entry == null) {
      return undefined;
    }
    for (let i = 0; i < this.data.practitionersData.entry.length; i += 1) {
      if (this.data.practitionersData.entry[i].resource.entry == null) {
        continue;
      }

      if (has(this.data.practitionersData.entry[i], 'resource.entry[1]')) {
        const { resource } = this.data.practitionersData.entry[i].resource.entry![1];
        if (id.indexOf(resource.id) !== -1) {
          return {
            organization: get(this.data.practitionersData.entry[i], 'resource.entry[2]', null),
            practitioner: resource as Practitioner,
          };
        }
      }
    }
    return undefined;
  }

  public getPractitionerRoleMetaData(id: string): PractitionerMetaData | undefined {
    if (this.data.practitionersData.entry == null) {
      return undefined;
    }
    for (let i = 0; i < this.data.practitionersData.entry.length; i += 1) {
      if (this.data.practitionersData.entry[i].resource.entry == null) {
        continue;
      }

      if (has(this.data.practitionersData.entry[i], 'resource.entry[0]')) {
        const { resource } = this.data.practitionersData.entry[i].resource.entry![0];
        if (resource.practitioner.reference.indexOf(id) !== -1) {
          return {
            role: resource,
            organization: get(this.data.practitionersData.entry[i], 'resource.entry[2]', null),
          };
        }
      }
    }
    return undefined;
  }

  public maybeExtractResource<T>(data: any, resourceType: ResourceType): T | undefined {
    const result = data.entry.find((entry: any) => entry.resource.resourceType === resourceType);
    if (result == null) {
      return undefined;
    }
    return result.resource as T;
  }

  public extractResource<T>(data: any, resourceType: ResourceType): T {
    return data.entry.find((entry: any) => entry.resource.resourceType === resourceType).resource as T;
  }

  public extractResources<T>(data: any, resourceType: ResourceType): T[] {
    return data.entry
      .filter((entry: any) => entry.resource.resourceType === resourceType)
      .map((entry: any) => entry.resource as T) as T[];
  }

  public getExtension(data: any, url: string) {
    return get(data, 'extension', []).find((ext: any) => ext.url === url);
  }

  public extractEmail(telecom: Telecom[]): string {
    const email = telecom.find((tel) => tel.system === 'email');
    return get(email, 'value', 'N/A');
  }

  public extractPhone(telecom: Telecom[]): string {
    const phone = telecom.find((tel) => tel.system === 'phone' && tel.rank === 1);
    return get(phone, 'value', 'N/A');
  }

  public extractPhoneExtension(telecom: Telecom[]): string {
    const ext = telecom.find((tel) => tel.system === 'phone' && tel.rank === 0);
    return get(ext, 'value', 'N/A');
  }

  public getPractitionerDataFromPractitionerRole(resource: any, attributeName: string, bundle: any): PractitionerData | null {
    const reference = get(resource, `${attributeName}.reference`, null);
    if (reference == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const id = reference.split('/')[1];
    const practitioners = this.extractResources<PractitionerRole>(bundle, 'PractitionerRole');
    const practitionerRole = practitioners.find((pract) => pract.id === id);
    if (practitionerRole == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const practMetadata = this.getPractitionerMetaData(id);
    if (practMetadata == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const prefix = get(practMetadata.practitioner, ['name', '0', 'prefix', '0'], 'Dr.');
    const lastName = get(practMetadata.practitioner, ['name', '0', 'family'], '');
    const firstName = get(practMetadata.practitioner, ['name', '0', 'given', '0'], '');
    const suffix = get(practMetadata.practitioner, ['name', '0', 'suffix', '0'], '');

    return {
      organization: get(practMetadata, 'organization.resource.name', 'N/A'),
      mrn: get(practitionerRole, 'identifier[0].value', 'N/A'),
      firstName,
      lastName,
      formattedName: `${prefix} ${lastName.toUpperCase()}, ${firstName} ${suffix !== 'null' ? suffix : ''}`,
      email: this.extractEmail(practitionerRole.telecom),
      phone: this.extractPhone(practitionerRole.telecom),
      phoneExtension: this.extractPhoneExtension(practitionerRole.telecom),
    };
  }

  public getPractitionerDataFromPractitioner(resource: any, attributeName: string, bundle: any): PractitionerData | null {
    const reference = get(resource, `${attributeName}.reference`, null);
    if (reference == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const id = reference.split('/')[1];
    const practitioners = this.extractResources<Practitioner>(bundle, 'Practitioner');
    const practitioner = practitioners.find((pract) => pract.id === id);
    if (practitioner == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const practMetadata = this.getPractitionerRoleMetaData(id);
    if (practMetadata == null) {
      return PRACTITIONER_NOT_FOUND;
    }

    const prefix = get(practitioner, ['name', '0', 'prefix', '0'], 'Dr.');
    const lastName = get(practitioner, ['name', '0', 'family'], '');
    const firstName = get(practitioner, ['name', '0', 'given', '0'], '');
    const suffix = get(practitioner, ['name', '0', 'suffix', '0'], '');

    return {
      organization: get(practMetadata, 'organization.resource.name', 'N/A'),
      mrn: get(practitioner, 'identifier[0].value', 'N/A'),
      firstName,
      lastName,
      formattedName: `${prefix} ${lastName.toUpperCase()}, ${firstName} ${suffix !== 'null' ? suffix : ''}`,
      email: practMetadata.role != null ? this.extractEmail(practMetadata.role.telecom) : 'No email.',
      phone: practMetadata.role != null
        ? `${this.extractPhone(practMetadata.role.telecom)}`
        : 'N/A',
      phoneExtension: this.extractPhoneExtension(practMetadata.role!.telecom),
    };
  }
}
