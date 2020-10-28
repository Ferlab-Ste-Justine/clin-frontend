/* eslint-disable import/no-cycle */
import { has } from "lodash";
import { initialPatientState } from "../reducers/patient";
import { FamilyMemberHistory, Patient, ResourceType, Practitioner } from "./fhir/types";

// THIS REDUCER NEEDS TO BE REMOVED WHEN THE NEW PATIENT PAGE IS IMPLEMENTED.
// INSTEAD, HANDLE ALL YOUR DATA IN THE REDUCER patient.ts.

const extractResource = <T>(data: any, resourceType: ResourceType) => {
  return data.entry.find((entry) => entry.resource.resourceType === resourceType).resource as T;
};

const extractResources = <T>(data: any, resourceType: ResourceType) => {
  return data.entry.filter((entry) => entry.resource.resourceType === resourceType).resource as T[];
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
  // const mother = find(fhirPatient.link, { relationship: "MTH" });
  // const father = find(fhirPatient.link, { relationship: "FTH" });

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

export const normalizePatientOrganization = (fhirPatient) => {
  const struct: any = Object.assign({}, initialPatientState.organization);

  if (fhirPatient.organization) {
    struct.id = fhirPatient.organization.id;
    struct.name = fhirPatient.organization.name;
  }

  return struct;
};

export const normalizePatientConsultations = (fhirPatient) =>
  fhirPatient.clinicalImpressions
    ? fhirPatient.clinicalImpressions.reduce((result, current) => {
        const nameParts = [current.assessor_name[0].given[0], current.assessor_name[0].family];
        if (current.assessor_name[0].prefix) {
          nameParts.unshift(current.assessor_name[0].prefix[0]);
        }
        if (current.assessor_name[0].suffix) {
          nameParts.push(current.assessor_name[0].suffix[0]);
        }
        result.push({
          id: current.id,
          age: current.runtimePatientAge,
          date: current.ci_consultation_date ? current.ci_consultation_date.dateTime : "",
          assessor: nameParts.join(" "),
          organization: current.assessor_org_name || "",
        });

        return result;
      }, [])
    : [];

export const normalizePatientRequests = (fhirPatient) =>
  fhirPatient.serviceRequests
    ? fhirPatient.serviceRequests.reduce((result, current) => {
        const nameParts = [current.requester_name[0].given[0], current.requester_name[0].family];
        if (current.requester_name[0].prefix) {
          nameParts.unshift(current.requester_name[0].prefix[0]);
        }
        if (current.requester_name[0].suffix) {
          nameParts.push(current.requester_name[0].suffix[0]);
        }
        result.push({
          id: current.id,
          date: current.authoredOn,
          type: current.code ? current.code.text : "",
          status: current.status,
          intent: current.intent ? current.intent : "",
          specimen: current.specimen ? current.specimen[0].id : "",
          requester: nameParts.join(" "),
          organization: current.requester_org_name || "",
          consulation: current.ci_ref || "",
        });

        return result;
      }, [])
    : [];

export const normalizePatientSamples = (fhirPatient) =>
  fhirPatient.specimens.reduce((result, current) => {
    result.push({
      type: "DNA",
      id: current.id,
      barcode: current.container ? current.container[0] : "",
      request: current.request ? current.request[0] : "",
    });

    return result;
  }, []);

const emptyImpressions = {
  observations: [],
  indications: [],
  ontology: [],
  history: [],
};
export const normalizePatientImpressions = (fhirPatient) =>
  fhirPatient.clinicalImpressions
    ? fhirPatient.clinicalImpressions.reduce((result, current) => {
        if (current.familyMemberHistory) {
          current.familyMemberHistory.forEach((history) => {
            result.history.push({
              date: history.date || "",
              note: history.note[0] ? history.note[0].text : "",
            });
          });
        }
        if (current.observations) {
          current.observations.forEach((observation) => {
            if (observation.code && observation.code.text) {
              const code = observation.code.text.toLowerCase();
              const nameParts = [observation.performer_name[0].given[0], observation.performer_name[0].family];
              if (observation.performer_name[0].prefix) {
                nameParts.unshift(observation.performer_name[0].prefix[0]);
              }
              if (observation.performer_name[0].suffix) {
                nameParts.push(observation.performer_name[0].suffix[0]);
              }
              if (code.indexOf("medical") !== -1) {
                result.observations.push({
                  consultation_id: current.id,
                  consultation_date: current.ci_consultation_date ? current.ci_consultation_date.dateTime : "",
                  apparition_date: observation.effective ? observation.effective.dateTime : "",
                  note: observation.note[0] ? observation.note[0].text : "",
                  status: observation.status || "",
                  performer: nameParts.join(" "),
                  organization: observation.performer_org_name || "",
                });
              } else if (code.indexOf("indication") !== -1) {
                result.indications.push({
                  consultation_id: current.id,
                  consultation_date: current.ci_consultation_date ? current.ci_consultation_date.dateTime : "",
                  apparition_date: observation.effective ? observation.effective.dateTime : "",
                  note: observation.note[0] ? observation.note[0].text : "",
                  status: observation.status || "",
                  performer: nameParts.join(" "),
                  organization: observation.performer_org_name || "",
                });
              } else if (code.indexOf("phenotype") !== -1 && observation.phenotype) {
                result.ontology.push({
                  consultation_id: current.id,
                  consultation_date: current.ci_consultation_date ? current.ci_consultation_date.dateTime : "",
                  apparition_date: observation.effective ? observation.effective.dateTime : "",
                  ontology: "HPO",
                  observed: observation.observed || "",
                  code: observation.phenotype[0] ? observation.phenotype[0].code : "",
                  term: observation.phenotype[0] ? observation.phenotype[0].display : "",
                });
              }
            }
          });
        }
        return result;
      }, JSON.parse(JSON.stringify(emptyImpressions)))
    : emptyImpressions;
