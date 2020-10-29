/* eslint-disable import/no-cycle */
import { assign, has } from "lodash";
import { initialPatientState } from "../reducers/patient";
import {
  FamilyMemberHistory,
  Patient,
  ResourceType,
  Practitioner,
  Organization,
  ClinicalImpression,
  ServiceRequest,
  Observation,
} from "./fhir/types";

// THIS REDUCER NEEDS TO BE REMOVED WHEN THE NEW PATIENT PAGE IS IMPLEMENTED.
// INSTEAD, HANDLE ALL YOUR DATA IN THE REDUCER patient.ts.

const extractResource = <T>(data: any, resourceType: ResourceType) => {
  return data.entry.find((entry) => entry.resource.resourceType === resourceType).resource as T;
};

const extractResources = <T>(data: any, resourceType: ResourceType) => {
  return data.entry
    .filter((entry) => entry.resource.resourceType === resourceType)
    .map((entry) => entry.resource as T) as T[];
};

export const normalizePatientDetails = (data) => {
  const patient = extractResource<Patient>(data, "Patient");
  const ethnicity = patient.extension.find(
    (extension) => extension.url === "http://fhir.cqgc.ferlab.bio/StructureDefinition/qc-ethnicity"
  );
  const isProband = patient.extension.find(
    (extension) => extension.url === "http://fhir.cqgc.ferlab.bio/StructureDefinition/is-proband"
  );
  const bloodRelationship = patient.extension.find(
    (extension) => extension.url === "http://fhir.cqgc.ferlab.bio/StructureDefinition/blood-relationship"
  );

  // const struct = Object.assign({}, initialPatientState.);
  const struct: any = {};
  console.log(patient);

  struct.id = patient.id;
  struct.firstName = patient.name ? patient.name[0].given[0] : "";
  struct.lastName = patient.name ? patient.name[0].family : "";
  struct.birthDate = patient.birthDate;
  struct.gender = patient.gender;
  struct.ethnicity = has(ethnicity, "valueCoding.display") ? ethnicity.valueCoding.display : "Unknown";
  struct.proband = isProband.valueBoolean;
  struct.mrn = patient.identifier[0].value;
  struct.ramq = patient.identifier.length > 1 ? patient.identifier[1].value : " - ";
  struct.bloodRelationship = bloodRelationship == null ? "No" : bloodRelationship.valueCoding.display;

  return struct;
};

export const normalizePatientFamily = (data) => {
  const patient = extractResource<Patient>(data, "Patient");
  const fmhs = extractResources<FamilyMemberHistory>(data, "FamilyMemberHistory");
  const struct: any = {};

  struct.id = patient.id;
  struct.proband = patient.id;
  struct.composition = "trio"; // Not suported for now
  struct.members = {};
  fmhs.forEach((fmh) => {
    struct.members[fmh.relationship.coding[0].display];
  });

  return struct;
};

export const normalizePatientStudy = (fhirPatient) => {
  return {};
};

export const normalizePatientPractitioner = (data) => {
  const struct: any = Object.assign({}, initialPatientState.practitioner);
  const practitioner = extractResource<Practitioner>(data, "Practitioner");

  if (practitioner != null) {
    struct.id = practitioner.id;
    struct.rid = "ROLE ID";
    struct.mln = practitioner.identifier[0].value;
    struct.name = has(practitioner, "name[0].prefix[0]") ? `${practitioner.name[0].prefix[0]} ` : "";
    struct.name += has(practitioner, "name[0].given[0]") ? `${practitioner.name[0].given[0]} ` : "";
    struct.name += has(practitioner, "name[0].family") ? practitioner.name[0].family : "";
  }
  return struct;
};

export const normalizePatientOrganization = (data) => {
  const organization = extractResource<Organization>(data, "Organization");
  const struct: any = Object.assign({}, initialPatientState.organization);

  if (organization != null) {
    struct.id = organization.id;
    struct.name = organization.name || organization.id;
  }

  return struct;
};

const formatName = (subject) => {
  const nameParts = [subject.name[0].given[0], subject.name[0].family];
  if (subject.name[0].prefix) {
    nameParts.unshift(subject.name[0].prefix[0]);
  }
  if (subject.name[0].suffix) {
    nameParts.push(subject.name[0].suffix[0]);
  }
  return nameParts.join(" ");
};

export const normalizePatientConsultations = (data) => {
  const organization = extractResource<Organization>(data, "Organization");
  const clinicalImpressions = extractResources<ClinicalImpression>(data, "ClinicalImpression");

  return clinicalImpressions.map((clinicalImpression) => {
    let assessor = null;
    if (clinicalImpression.assessor != null) {
      const practitioners = extractResources<Practitioner>(data, "Practitioner");
      assessor = practitioners.find(
        (practitioner) => practitioner.id === clinicalImpression.assessor.reference.split("/")[1]
      );
    }
    return {
      id: clinicalImpression.id,
      assessor: assessor != null ? formatName(assessor) : "",
      age: 0,
      date: clinicalImpression.date,
      organization: organization.name || organization.id,
    };
  });
};

export const normalizePatientRequests = (data) => {
  const organization = extractResource<Organization>(data, "Organization");
  const serviceRequests = extractResources<ServiceRequest>(data, "ServiceRequest");

  serviceRequests.map((serviceRequest) => {
    const practitioners = extractResources<Practitioner>(data, "Practitioner");
    let requester = null;
    if (serviceRequest.requester != null) {
      requester = practitioners.find(
        (practitioner) => practitioner.id === serviceRequest.requester.reference.split("/")[1]
      );
    }

    return {
      id: serviceRequest.id,
      date: serviceRequest.authoredOn,
      type: has(serviceRequest, "code.coding[0].code") ? serviceRequest.code.coding[0].code : "",
      status: serviceRequest.status,
      intent: serviceRequest.intent,
      specimen: "",
      requester: requester != null ? formatName(requester) : "",
      organization: organization.name || organization.id,
      consultation: serviceRequest.extension[0].valueReference.reference,
    };
  });
};

export const normalizePatientSamples = (data) => [];

const emptyImpressions = {
  observations: [],
  indications: [],
  ontology: [],
  history: [],
};
export const normalizePatientImpressions = (data) => {
  const familyMemberHistories = extractResources<FamilyMemberHistory>(data, "FamilyMemberHistory");
  const observations = extractResources<Observation>(data, "Observation");
  const organization = extractResource<Organization>(data, "Organization");

  const result: any = {
    history: [],
    observations: [],
    ontology: [],
    indications: [],
  };

  familyMemberHistories.forEach((familyMemberHistory) => {
    result.history.push({
      data: "",
      note: has(familyMemberHistory, "note[0].text") ? familyMemberHistory.note[0].text : "",
    });
  });

  observations.forEach((observation) => {
    if (has(observation, "code.coding[0].code")) {
      const code = observation.code.coding[0].code;
      switch (code) {
        case "CGH":
          result.observations.push({
            consultation_id: observation.id,
            consultation_date: observation.meta.lastUpdated,
            apparition_date: "",
            note: has(observation, "note[0].text") ? observation.note[0].text : "",
            status: observation.status,
            performer: "",
            organization: organization.name || organization.id,
          });
          break;
        case "INDIC":
        case "INVES":
          result.indications.push({
            consultation_id: observation.id,
            consultation_date: observation.meta.lastUpdated,
            apparition_date: "",
            note: has(observation, "note[0].text") ? observation.note[0].text : "",
            status: observation.status,
            performer: "",
            organization: organization.name || organization.id,
          });
          break;
        case "PHENO":
          result.ontology.push({
            consultation_id: observation.id,
            consultation_date: observation.meta.lastUpdated,
            apparition_date: "",
            ontology: "HPO",
            observed: has(observation, "interpretation[0].coding[0].code")
              ? observation.interpretation[0].coding[0].code
              : "",
            code: has(observation, "valueCodeableConcept.coding[0].code")
              ? observation.valueCodeableConcept.coding[0].code
              : "",
            term: has(observation, "valueCodeableConcept.coding[0].display")
              ? observation.valueCodeableConcept.coding[0].display
              : "",
          });
          break;
      }
    }
  });
  return result;
};
