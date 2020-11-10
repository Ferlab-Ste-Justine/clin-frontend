import { produce } from "immer";
import { has } from "lodash";
import * as actions from "../actions/type";
import {
  ClinicalImpression,
  FamilyGroup,
  Observation,
  Organization,
  Patient,
  Practitioner,
  ResourceType,
  ServiceRequest,
} from "../helpers/fhir/types";

// Data
type PatientData = {
  patient: Patient;
};

type PositionType = "proband" | "parent";

type ParsedPatientData = {
  id: string;
  status: string;
  lastName: string;
  firstName: string;
  ramq: string;
  mrn: string;
  organization: string;
  gender: string;
  birthDate: string;
  ethnicity: string;
  bloodRelationship: string;
  familyId: string;
  familyType: string;
  proband: string;
};

type PractitionerData = {
  name: string;
  hospital: string;
  phone: string;
  email: string;
};

type Prescription = {
  date: string;
  requester: PractitionerData;
  practitioner: PractitionerData;
  test: string;
  status: string;
};

// Parser

// Reducer

type State = {
  patient?: ParsedPatientData;
  prescriptions: Prescription[];
};

const ETHNICITY_EXT_URL = "http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity";
const BLOOD_RELATIONSHIP_EXT_URL = "http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship";
const PROBAND_EXT_URL = "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband";

type BundleType = "Patient" | "ServiceRequest" | "ClinicalImpression" | "FamilyGroup";

class PatientPageParser {
  private static extractBundle(data: any, type: BundleType): any {
    switch (type) {
      case "Patient":
        return data.entry[0].resource;
      case "FamilyGroup":
        return data.entry[1].resource;
      case "ServiceRequest":
        return data.entry[2].resource;
      case "ClinicalImpression":
        return data.entry[3].resource;
      default:
        throw new Error(`Invalid bundle type ${type}`);
    }
  }

  private static extractResource<T>(data: any, resourceType: ResourceType): T {
    return data.entry.find((entry) => entry.resource.resourceType === resourceType).resource as T;
  }

  private static extractResources<T>(data: any, resourceType: ResourceType): T[] {
    return data.entry
      .filter((entry) => entry.resource.resourceType === resourceType)
      .map((entry) => entry.resource as T) as T[];
  }

  private static getExtension(data: any, url: string) {
    return data.extension.find((ext) => ext.url === url);
  }

  public static parse(data: any): Partial<State> {
    const patientBundle = this.extractBundle(data, "Patient");
    const groupBundle = this.extractBundle(data, "FamilyGroup");

    const patient = this.extractResource<Patient>(patientBundle, "Patient");
    const practitioner = this.extractResource<Practitioner>(patientBundle, "Practitioner");
    const organization = this.extractResource<Organization>(patientBundle, "Organization");
    const group = this.extractResource<FamilyGroup>(groupBundle, "Group");

    const ethnicityExt = this.getExtension(patient, ETHNICITY_EXT_URL);
    const bloodRelationshipExt = this.getExtension(patient, BLOOD_RELATIONSHIP_EXT_URL);
    const probandExt = this.getExtension(patient, PROBAND_EXT_URL);

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

    console.log(patientData);

    return {
      patient: patientData,
      prescriptions: null,
    };
  }
}

type Action = {
  type: keyof typeof actions;
  payload: any;
};

const reducer = (state: State = { prescriptions: [] }, action: Action) =>
  produce<State>(state, (draft) => {
    switch (action.type) {
      case "PATIENT_FETCH_SUCCEEDED":
        console.log(action);
        PatientPageParser.parse(action.payload);
        break;
    }
  });

export default reducer;
