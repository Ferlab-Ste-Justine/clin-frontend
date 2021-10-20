import { removeSpecificFamilyRelation } from '../patient';

import { patient207347 } from './mockData';

describe('Patient Helpers', () => {
  describe(`family relation (${removeSpecificFamilyRelation.name})`, () => {
    const extensionWithFatherAndMother = patient207347.original.extension;
    test('should return a new extension with the same content as the original one if no id found', () => {
      const rubbishId = '911';
      const extensionAfter = removeSpecificFamilyRelation(rubbishId, extensionWithFatherAndMother);
      expect(extensionWithFatherAndMother).toEqual(extensionAfter);
      //make sure would output is not original
      expect(Object.is(extensionWithFatherAndMother, extensionAfter)).toBeFalsy();
    });
    test('should return a new extension without the family relation while preserving the rest of the content', () => {
      const relativesIdToRemove = '207331';
      const fatherFamilyRelation = [
        {
          extension: [
            {
              url: 'subject',
              valueReference: {
                reference: 'Patient/207331',
              },
            },
            {
              url: 'relation',
              valueCodeableConcept: {
                coding: [
                  {
                    code: 'FTH',
                    system: 'http://terminology.hl7.org/ValueSet/v3-FamilyMember',
                  },
                ],
              },
            },
          ],
          url: 'http://fhir.cqgc.ferlab.bio/StructureDefinition/family-relation',
        },
      ];
      const extensionAfter = removeSpecificFamilyRelation(
        relativesIdToRemove,
        extensionWithFatherAndMother,
      );
      expect(extensionAfter).toEqual(expect.not.arrayContaining(fatherFamilyRelation));
      //make sure would output is not original
      expect(Object.is(extensionWithFatherAndMother, [])).toBeFalsy();
    });
  });
});
