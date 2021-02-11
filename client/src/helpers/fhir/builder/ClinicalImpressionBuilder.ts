import { ClinicalImpression, Reference } from '../types';
import { formatDate, getPractitionerRoleReference } from './Utils';

const CLINICAL_IMPRESSION_PROFILE = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-clinical-impression';
const AGE_AT_EVENT_EXTENSION_URL = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-event';

export class ClinicalImpressionBuilder {
    private id?: string;

    private submitted: boolean = false;

    private age: number = 1;

    private assessorId!: string;

    private subjectReference!: Reference;

    public withId(id: string) {
      if (id != null) {
        this.id = id;
      }
      return this;
    }

    public withSubmitted(submitted: boolean) {
      if (submitted != null) {
        this.submitted = submitted;
      }
      return this;
    }

    public withAge(age: number) {
      if (age != null) {
        this.age = age;
      }
      return this;
    }

    public withAssessorId(assessorId: string) {
      if (assessorId != null) {
        this.assessorId = assessorId;
      }
      return this;
    }

    public withSubjectReference(subjectReference: Reference) {
      if (subjectReference != null) {
        this.subjectReference = subjectReference;
      }
      return this;
    }

    public withSubject(id: string) {
      this.subjectReference = {
        reference: `Patient/${id}`,
      };
      return this;
    }

    public build() {
      const clinicalImpression: ClinicalImpression = {
        id: this.id,
        resourceType: 'ClinicalImpression',
        meta: {
          profile: [CLINICAL_IMPRESSION_PROFILE],
        },

        extension: [
          {
            url: AGE_AT_EVENT_EXTENSION_URL,
            valueAge: {
              value: this.age,
              unit: 'days',
              system: 'http://unitsofmeasure.org',
              code: 'd',
            },
          },
        ],
        status: this.submitted ? 'completed' : 'in-progress',
        assessor: getPractitionerRoleReference(this.assessorId),
        date: formatDate(new Date()),
        subject: this.subjectReference,
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
