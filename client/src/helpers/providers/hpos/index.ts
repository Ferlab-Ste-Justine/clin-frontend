import { get } from 'lodash';
import { Observation } from '../../fhir/types';
import { ClinicalObservation } from '../types';
// @ts-ignore
import { DataExtractor } from '../extractor.ts';
// @ts-ignore
import { Provider, Record } from '../providers.ts';

const AGE_AT_ONSET_EXTENSION = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/age-at-onset';

const HPO_CODE = 'PHENO';
export class HPOProvider extends Provider<Observation, ClinicalObservation> {
  public doProvide(dataExtractor: DataExtractor): Record<Observation, ClinicalObservation>[] {
    const clinicalImpressionBundle = dataExtractor.extractBundle('ClinicalImpression');

    const hpos = dataExtractor
      .extractResources<Observation>(clinicalImpressionBundle, 'Observation')
      .filter((observation: any) => get(observation, ['code', 'coding', '0', 'code'], '') === HPO_CODE);

    return hpos.map<Record<Observation, ClinicalObservation>>((hpo: any) => {
      const ageAtOnset = dataExtractor.getExtension(hpo, AGE_AT_ONSET_EXTENSION);

      const observation: ClinicalObservation = {
        observed: get(hpo, 'interpretation[0].coding[0].code', 'IND'),
        term: get(hpo, 'valueCodeableConcept.coding[0].display', 'N/A'),
        ageAtOnset: get(ageAtOnset, 'valueCoding.display', 'N/A'),
        note: get(hpo, 'note[0].text', ''),
      };

      return {
        original: hpo,
        parsed: observation,
      };
    });
  }
}
