import {
  BackboneElement, FamilyGroup, FamilyGroupType, Meta, Reference,
} from '../types';

export enum FamilyStructure{
  Solo = 'Solo',
  Duo = 'Duo',
  Trio = 'Trio',
}

const StructureCodes: {[key in FamilyStructure]: string} = {
  [FamilyStructure.Solo]: 'SOL',
  [FamilyStructure.Duo]: 'DUO',
  [FamilyStructure.Trio]: 'TRI',
};
export class FamilyGroupBuilder {
    private meta: Meta = {
      profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-family-group'],
    };

    private type?: FamilyGroupType = undefined;

    private actual: boolean = false;

    private member: BackboneElement[] = [];

    private structure: FamilyStructure = FamilyStructure.Solo;

    public build(): FamilyGroup {
      return {
        resourceType: 'Group',
        meta: this.meta,
        type: this.type!,
        actual: this.actual,
        member: this.member,
        extension: [{
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/fm-structure',
          valueCoding: {
            code: StructureCodes[this.structure],
            display: this.structure.toString(),
            system: 'http://fhir.cqgc.ferlab.bio/CodeSystem/fm-structure',
          },
        }],
      };
    }

    public withStructure(value: FamilyStructure) {
      this.structure = value;
      return this;
    }

    public withType(value: FamilyGroupType) {
      this.type = value;
      return this;
    }

    public withActual(value: boolean) {
      this.actual = value;
      return this;
    }

    public withMember(value: Reference) {
      this.member.push({
        entity: value,
      });
      return this;
    }
}
