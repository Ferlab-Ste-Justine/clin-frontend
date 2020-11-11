import { has } from "lodash";
import { FamilyGroup, Organization, Patient } from "../../fhir/types";
import { ParsedPatientData } from "../types";
//@ts-ignore
import { DataExtractor } from "../extractor.ts";
//@ts-ignore
import { Provider, Record } from "../providers.ts";

const ETHNICITY_EXT_URL = "http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity";
const BLOOD_RELATIONSHIP_EXT_URL = "http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship";
const PROBAND_EXT_URL = "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband";

export class PatientProvider extends Provider<Patient, ParsedPatientData> {
  constructor(name: string) {
    super(name);
  }

  public doProvide(dataExtractor: DataExtractor): Record<Patient, ParsedPatientData> {
    const patientBundle = dataExtractor.extractBundle("Patient");
    const groupBundle = dataExtractor.extractBundle("FamilyGroup");

    const patient = dataExtractor.extractResource<Patient>(patientBundle, "Patient");
    const organization = dataExtractor.extractResource<Organization>(patientBundle, "Organization");
    const group = dataExtractor.extractResource<FamilyGroup>(groupBundle, "Group");

    const ethnicityExt = dataExtractor.getExtension(patient, ETHNICITY_EXT_URL);
    const bloodRelationshipExt = dataExtractor.getExtension(patient, BLOOD_RELATIONSHIP_EXT_URL);
    const probandExt = dataExtractor.getExtension(patient, PROBAND_EXT_URL);

    const mrn = patient.identifier[0].value;
    const ramq = has(patient, "identifier[1].value") ? patient.identifier[1].value : "N/A";

    const patientData: ParsedPatientData = {
      id: patient.id,
      status: patient.active ? "active" : "inactive",
      lastName: patient.name[0].family,
      firstName: patient.name[0].given[0],
      ramq,
      mrn,
      organization: organization.name || organization.id,
      gender: patient.gender,
      birthDate: patient.birthDate,
      ethnicity:
        ethnicityExt != null && has(ethnicityExt, "valueCoding.display") ? ethnicityExt.valueCoding.display : "N/A",
      bloodRelationship:
        bloodRelationshipExt != null && has(bloodRelationshipExt, "valueCoding.display")
          ? bloodRelationshipExt.valueCoding.display
          : "N/A",
      familyId: group.id,
      familyType: group.type,
      proband: probandExt != null && probandExt.valueBoolean ? "Proband" : "Parent",
    };

    return [
      {
        original: patient,
        parsed: patientData,
      },
    ];
  }
}
