import get from 'lodash/get';
import { FamilyMemberHistory } from '../../fhir/types';
import { FamilyObservation } from '../types';
import { DataExtractor } from '../extractor';
import { Provider, Record } from '../providers';

export class FMHProvider extends Provider<FamilyMemberHistory, FamilyObservation> {
  constructor(name: string) {
    super(name);
  }

  public doProvide(dataExtractor: DataExtractor): Record<FamilyMemberHistory, FamilyObservation>[] {
    const clinicalImpressionBundle = dataExtractor.extractBundle('ClinicalImpression');

    const fmhs = dataExtractor.extractResources<FamilyMemberHistory>(clinicalImpressionBundle, 'FamilyMemberHistory');

    return fmhs.map<Record<FamilyMemberHistory, FamilyObservation>>((fmh) => {
      const fmhObservation: FamilyObservation = {
        id: fmh.id!,
        link: get(fmh, 'relationship.coding[0].display', 'N/A'),
        code: get(fmh, 'relationship.coding[0].code'),
        note: get(fmh, 'note[0].text', ''),
      };

      return {
        original: fmh,
        parsed: fmhObservation,
      };
    });
  }
}
