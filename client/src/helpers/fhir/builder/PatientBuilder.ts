import { v4 as uuid } from 'uuid';
import { Patient, Reference } from '../types';
import { formatDate } from './Utils';

export class PatientBuilder {
  private id: string = `urn:uuid:${uuid()}`;

  private family!: string;

  private given!: string;

  private active: boolean = false;

  private birthDate!: Date;

  private gender!: string;

  private ramq?: string;

  private mrn!: string;

  private ethnicityCode?: string;

  private ethnicityDisplay?: string;

  private practitioners: string[] = [];

  private bloodRelationship?: string;

  private organization?: string;

  public withId(id: string) {
    if (id != null) {
      this.id = id;
    }
    return this;
  }

  public withFamily(family: string) {
    if (family != null) {
      this.family = family;
    }
    return this;
  }

  public withGiven(given: string) {
    if (given != null) {
      this.given = given;
    }
    return this;
  }

  public withActive(active: boolean) {
    if (active != null) {
      this.active = active;
    }
    return this;
  }

  public withBirthDate(birthDate: Date) {
    if (birthDate != null) {
      this.birthDate = birthDate;
    }
    return this;
  }

  public withGender(gender: string) {
    if (gender != null) {
      this.gender = gender;
    }
    return this;
  }

  public withRamq(ramq: string) {
    if (ramq != null) {
      this.ramq = ramq;
    }
    return this;
  }

  public withMrn(mrn: string) {
    if (mrn != null) {
      this.mrn = mrn;
    }
    return this;
  }

  public withPractitionerId(practitionerId: string) {
    if (practitionerId != null) {
      this.practitioners.push(practitionerId);
    }
    return this;
  }

  public withGeneralPractitioners(practitioners: Reference[] | undefined) {
    practitioners?.forEach((practitioner) => {
      this.practitioners.push(practitioner.reference.split('/')[1]);
    });
    return this;
  }

  public withEthnicityCode(ethnicityCode: string) {
    if (ethnicityCode != null) {
      this.ethnicityCode = ethnicityCode;
    }
    return this;
  }

  public withEthnicityDisplay(ethnicityDisplay: string) {
    if (ethnicityDisplay != null) {
      this.ethnicityDisplay = ethnicityDisplay;
    }
    return this;
  }

  public withBloodRelationship(bloodRelationship: string) {
    if (bloodRelationship != null) {
      this.bloodRelationship = bloodRelationship;
    }
    return this;
  }

  public withOrganization(organization: string) {
    if (organization != null) {
      this.organization = organization;
    }
    return this;
  }

  public build() {
    const formattedBirthDate = formatDate(this.birthDate);

    const patient: Patient = {
      resourceType: 'Patient',
      meta: {
        profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-patient'],
      },
      active: this.active,
      birthDate: formattedBirthDate,
      extension: [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband',
          valueBoolean: true,
        },
      ],
      gender: this.gender,
      generalPractitioner: [],
      identifier: [
        {
          type: {
            coding: [
              {
                code: 'MR',
                display: 'Medical record number',
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              },
            ],
            text: 'Numéro du dossier médical',
          },
          value: this.mrn,
        },
      ],
      managingOrganization: {
        reference: `Organization/${this.organization}`,
      },
      name: [
        {
          family: this.family,
          given: [this.given],
        },
      ],
    };
    if (
      this.ethnicityCode != null
      && this.ethnicityDisplay != null
      && this.ethnicityCode.length > 0
      && this.ethnicityDisplay.length > 0
    ) {
      patient.extension.push({
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity',
        valueCoding: {
          system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/qc-ethnicity',
          code: this.ethnicityCode,
          display: this.ethnicityDisplay,
        },
      });
    }
    if (this.bloodRelationship != null && this.bloodRelationship.length > 0) {
      const code = this.bloodRelationship.charAt(0);
      patient.extension.push({
        url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship',
        valueCoding: {
          system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/blood-relationship',
          code,
          display: code === 'Y' ? 'Yes' : code === 'N' ? 'No' : 'Unknown',
        },
      });
    }

    if (this.ramq != null && this.ramq.length > 0) {
      patient.identifier.push({
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'JHN',
              display: 'Jurisdictional health number (Canada)',
            },
          ],
          text: 'Numéro du dossier médical',
        },
        value: this.ramq,
      });
    }

    if (this.id != null) {
      patient.id = this.id;
    }

    if (this.practitioners.length > 0) {
      this.practitioners.forEach((practitionerId) => {
        patient.generalPractitioner.push({
          reference: `PractitionerRole/${practitionerId}`,
        });
      });
    }

    return patient;
  }
}
