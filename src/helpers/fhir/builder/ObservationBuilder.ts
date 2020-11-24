import {
  CodeableConcept,
  Coding,
  Extension,
  Interpretation,
  Meta,
  Note,
  Observation,
  Reference,
  ResourceType,
} from '../types';

type Status = 'registered' | 'preliminary' | 'final' | 'amended';

interface HpoCategoryExtension extends Extension {
    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/hpo-category';
    valueCoding: Coding;
}

interface AgeAtOnset extends Extension {
    url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset';
    valueCoding: Coding;
}

type SupportedExtensions = HpoCategoryExtension | AgeAtOnset;
type SupportedCodes = 'CGH' | 'INDIC' | 'HPO' | 'INVES';

export class ObservationBuilder {
    private resourceType: ResourceType = 'Observation';

    private meta: Meta = {
      profile: [
        'http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-observation',
      ],
    };

    private status: Status = 'registered';

    private category: CodeableConcept[];

    private subject?: Reference;

    private interpretation: Interpretation[] = [];

    private note: Note[] = [];

    private extension: SupportedExtensions[] = [];

    private code?: CodeableConcept;

    private valueCodeableConcept?: CodeableConcept = undefined;

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
        default:
          break;
      }

      switch (code) {
        case 'CGH':
        case 'INDIC':
        case 'HPO':
          this.category = [
            {
              coding: [
                {
                  system:
                                    'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory',
                },
              ],
            },
          ];
          break;
        case 'INVES':
          this.category = [
            {
              coding: [
                {
                  system:
                                    'http://terminology.hl7.org/CodeSystem/observation-category',
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
        resourceType: this.resourceType,
        meta: this.meta,
        status: this.status,
        category: this.category,
        code: this.code!,
        subject: this.subject!,
        interpretation: this.interpretation,
        note: this.note,
        extension: this.extension,
        valueCodeableConcept: this.valueCodeableConcept,
      };
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
      this.interpretation.push(value);
      return this;
    }

    public withNote(value?: string) {
      if (value != null && value.length > 0) {
        this.note.push({
          text: value,
        });
      }
      return this;
    }

    public withExtension(value: SupportedExtensions) {
      this.extension.push(value);
      return this;
    }

    public withValue(value: CodeableConcept) {
      this.valueCodeableConcept = value;
    }
}
