import {
  BackboneElement, FamilyGroup, FamilyGroupType, Meta, Reference,
} from '../types';

export class FamilyGroupBuilder {
    private meta: Meta = {
      profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-family-group'],
    };

    private type?: FamilyGroupType = undefined;

    private actual: boolean = false;

    private member: BackboneElement[] = [];

    public build(): FamilyGroup {
      return {
        resourceType: 'Group',
        meta: this.meta,
        type: this.type!,
        actual: this.actual,
        member: this.member,
      };
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
