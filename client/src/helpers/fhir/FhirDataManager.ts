import {
  ClinicalImpression, Reference,
} from './types';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
};

export class FhirDataManager {
  private static getPractitionerRoleReference(id: string) : Reference | undefined {
    if (id == null) {
      return undefined;
    }
    return {
      reference: `PractitionerRole/${id}`,
    };
  }

  public static createClinicalImpression(assessorId: string, subjectId: string, submitted: boolean, age: number = 1): ClinicalImpression {
    const clinicalImpression: ClinicalImpression = {
      resourceType: 'ClinicalImpression',
      meta: {
        profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-clinical-impression'],
      },

      extension: [
        {
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-event',
          valueAge: {
            value: age,
            unit: 'days',
            system: 'http://unitsofmeasure.org',
            code: 'd',
          },
        },
      ],
      status: submitted ? 'completed' : 'in-progress',
      assessor: this.getPractitionerRoleReference(assessorId),
      date: formatDate(new Date()),
      subject: {
        reference: subjectId.startsWith('urn:') ? subjectId : `Patient/${subjectId}`,
      },
      investigation: [
        {
          code: {
            text: 'initial-examination',
          },
          item: [],
        },
      ],
    };
    return clinicalImpression;
  }
}
