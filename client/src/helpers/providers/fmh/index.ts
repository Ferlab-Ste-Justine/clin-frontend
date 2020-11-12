import { get } from "lodash";
import { FamilyMemberHistory } from "../../fhir/types";
import { FamilyObservation } from "../types";
//@ts-ignore
import { DataExtractor } from "../extractor.ts";
//@ts-ignore
import { Provider, Record } from "../providers.ts";

export class FMHProvider extends Provider<FamilyMemberHistory, FamilyObservation> {
  constructor(name: string) {
    super(name);
  }

  public doProvide(dataExtractor: DataExtractor): Record<FamilyMemberHistory, FamilyObservation>[] {
    const clinicalImpressionBundle = dataExtractor.extractBundle("ClinicalImpression");

    const fmhs = dataExtractor.extractResources<FamilyMemberHistory>(clinicalImpressionBundle, "FamilyMemberHistory");

    return fmhs.map<Record<FamilyMemberHistory, FamilyObservation>>((fmh) => {
      const fmhObservation: FamilyObservation = {
        link: get(fmh, "relationship.coding[0].display", "N/A"),
        note: get(fmh, "note[0].text", ""),
      };

      return {
        original: fmh,
        parsed: fmhObservation,
      };
    });
  }
}
