import { findPractitionerRoleByOrganizationRef, isPractitionerResident } from '../PractitionerRoleHelper'
import * as mocks from './PractitionerRoleHelper.mocks'
import { PractitionerRole } from "./types"

describe('PractitionerRoleHelper', () => {

  test('findPractitionerRoleByOrganizationRef - should find a valid role by organization ref', () => {
    expect(findPractitionerRoleByOrganizationRef(mocks.roles as PractitionerRole[], 'CHUM')).toBeDefined
  })

  test('findPractitionerRoleByOrganizationRef - should find a valid role by organization full-ref', () => {
    expect(findPractitionerRoleByOrganizationRef(mocks.roles as PractitionerRole[], 'Organization/CHUM')).toBeDefined
  })

  test('findPractitionerRoleByOrganizationRef - should not find a valid role by organization ref', () => {
    expect(findPractitionerRoleByOrganizationRef(mocks.roles as PractitionerRole[], 'foo')).toBeUndefined
  })

  test('isPractitionerResident - should return true', () => {
    expect(isPractitionerResident(mocks.mockRoleDoctorAndResident as PractitionerRole)).toEqual(true)
  })

  test('isPractitionerResident - should return false', () => {
    expect(isPractitionerResident(mocks.mockRoleDoctor as PractitionerRole)).toEqual(false)
  })

})