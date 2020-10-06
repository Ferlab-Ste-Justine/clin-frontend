import {CodeableConcept, FamilyMemberHistory, Meta, Note, Reference, ResourceType} from '../types'

type Status = "partial" | "completed" | "entered-in-error" | "health-unknown";

export class FamilyMemberHistoryBuilder {
  private resourceType: ResourceType = "FamilyMemberHistory";
  private meta: Meta = {
    profile: [
        "http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-fmh"
    ]
};
  private status: Status = "completed";
  private patient: Reference = null;
  private note: Note[] = [];
  private readonly relationship: CodeableConcept;

  public constructor(relationshipCode: string, relationshipName: string){
    this.relationship = {
      coding: [
        {
          code:  relationshipCode,
          display: relationshipName,
          system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode"
        }
      ]
    };
  }

  public build(): FamilyMemberHistory {
    return {
      resourceType: this.resourceType,
      meta: this.meta,
      status: this.status,
      patient: this.patient,
      relationship: this.relationship,
      note: this.note
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

  public withPatient(patientId: string){
    if(patientId.indexOf('urn:') !== -1){
      this.patient = {
        reference: patientId
      }
    }else{
      this.patient = {
        reference: `Patient/${patientId}`
      }
    }
  }

  public withNote(value: string) {
    this.note.push({
      text: value
    });
    return this;
  }
}
