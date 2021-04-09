import {
  CodeableConcept,
  Interpretation,
  Meta,
  Note,
  Observation,
  Reference,
  ResourceType,
} from '../types';

type Status = 'registered' | 'preliminary' | 'final' | 'amended';

type SupportedCodes = 'CGH' | 'INDIC' | 'HPO' | 'INVES' | 'ETH' | 'CONS';

export class ObservationBuilder {
    private id?: string;

    private resourceType: ResourceType = 'Observation';

    private meta: Meta = {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-observation',
      ],
    };

    private status: Status = 'registered';

    private category: CodeableConcept[];

    private subject?: Reference;

    private interpretation?: Interpretation[];

    private note?: Note[];

    private code?: CodeableConcept;

    private valueCodeableConcept?: CodeableConcept = undefined;

    private valueBoolean?: boolean = undefined;

    public constructor(code: SupportedCodes) {
      switch (code) {
        case 'CGH':
          this.code = {
            coding: [
              {
                system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
                code: 'CGH',
                display: 'cgh',
              },
            ],
          };
          break;
        case 'INDIC':
          this.code = {
            coding: [
              {
                system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
                code: 'INDIC',
                display: 'indications',
              },
            ],
          };

          break;
        case 'HPO':
          this.code = {
            coding: [
              {
                system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
                code: 'PHENO',
                display: 'phenotype',
              },
            ],
          };
          break;
        case 'INVES':
          this.code = {
            coding: [
              {
                system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
                code: 'INVES',
                display: 'investigations',
              },
            ],
          };
          break;
        case 'ETH':
          this.code = {
            coding: [
              {
                system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
                code: 'ETH',
                display: 'ethnicity',
              },
            ],
          };
          break;
        case 'CONS':
          this.code = {
            coding: [
              {
                system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/observation-code',
                code: 'CONS',
                display: 'consangunity',
              },
            ],
          };
          break;
        default:
          break;
      }

      switch (code) {
        case 'CGH':
          this.category = [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory',
                },
              ],
            },
          ];
          break;
        case 'HPO':
        case 'ETH':
        case 'CONS':
        case 'INVES':
        case 'INDIC':
          this.category = [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'exam',
                  display: 'Exam',
                },
              ],
            },
          ];
          break;
        default:
          throw new Error(`Code ${code} not supported.`);
      }
    }

    public build(): Observation {
      return {
        id: this.id,
        resourceType: this.resourceType,
        meta: this.meta,
        status: this.status,
        category: this.category,
        code: this.code!,
        subject: this.subject!,
        interpretation: this.interpretation,
        note: this.note,
        valueCodeableConcept: this.valueCodeableConcept,
        valueBoolean: this.valueBoolean,
      };
    }

    public withId(id: string) {
      if (id != null) {
        this.id = id;
      }
      return this;
    }

    public withResourceType(value: ResourceType) {
      this.resourceType = value;
      return this;
    }

    public withMeta(value: Meta) {
      this.meta = value;
      return this;
    }

    public withStatus(value: Status) {
      this.status = value;
      return this;
    }

    public withCategory(value: CodeableConcept) {
      this.category.push(value);
      return this;
    }

    public withCode(value: CodeableConcept) {
      this.code = value;
      return this;
    }

    public withSubject(value: Reference) {
      this.subject = value;
      return this;
    }

    public withInterpretation(value: Interpretation) {
      this.interpretation = this.interpretation || [];
      this.interpretation.push(value);
      return this;
    }

    public withNote(value?: string) {
      if (value != null && value.length > 0) {
        this.note = this.note || [];
        this.note.push({
          text: value,
          time: new Date().toISOString(),
        });
      }
      return this;
    }

    public withValue(code: string, display: string, system?: string) {
      this.valueCodeableConcept = {
        coding: [{
          code,
          display,
          system,
        }],
      };
      return this;
    }

    public withBooleanValue(value: boolean) {
      this.valueBoolean = value;
      return this;
    }
}
