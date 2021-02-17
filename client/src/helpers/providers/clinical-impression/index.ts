import get from 'lodash/get';
import { ClinicalImpression, Observation } from '../../fhir/types';
import { ConsultationSummary } from '../types';
import { DataExtractor } from '../extractor';
import { Provider, Record } from '../providers';

const CGH_CODE = 'CGH';
const CGH_INVES = 'INVES';
const CGH_INDIC = 'INDIC';

export class ClinicalImpressionProvider extends Provider<ClinicalImpression, ConsultationSummary> {
  constructor(name: string) {
    super(name);
  }

  public doProvide(dataExtractor: DataExtractor): Record<ClinicalImpression, ConsultationSummary>[] {
    const clinicalImpressionBundle = dataExtractor.extractBundle('ClinicalImpression');

    const clinicalImpressions = dataExtractor.extractResources<ClinicalImpression>(
      clinicalImpressionBundle,
      'ClinicalImpression',
    );

    const consultationsSummary: ConsultationSummary[] = clinicalImpressions.map(
      (clinicalImpression: ClinicalImpression) => {
        const observations = dataExtractor.extractResources<Observation>(clinicalImpressionBundle, 'Observation');
        const cgh = observations.find((observation) => get(observation, 'code.coding[0].code', '') === CGH_CODE);
        const inves = observations.find((observation) => get(observation, 'code.coding[0].code', '') === CGH_INVES);
        const indic = observations.find((observation) => get(observation, 'code.coding[0].code', '') === CGH_INDIC);

        const assessor = dataExtractor.getPractitionerDataFromPractitionerRole(
          clinicalImpression,
          'assessor',
          clinicalImpressionBundle,
        );
        return {
          cgh: get(cgh, 'interpretation[0].coding[0].code', undefined),
          precision: get(cgh, 'interpretation[0].coding[0].note[0].text', undefined),
          hypothesis: get(indic, 'note[0].text', 'N/A'),
          practitioner: assessor!,
          summary: get(inves, 'note[0].text', 'N/A'),
        };
      },
    );

    const output: Record<ClinicalImpression, ConsultationSummary>[] = [];

    for (let i = 0; i < consultationsSummary.length; i++) {
      output.push({
        original: clinicalImpressions[i],
        parsed: consultationsSummary[i],
      });
    }
    return output;
  }
}
