import { PractitionerRole } from "./types"

const RESIDENT_CODE = '405277009'
const ORGANIZATION_PREFIX = 'Organization/'

const buildOrganizationRef = (organizationRef: string): string => {
  return organizationRef && organizationRef.startsWith(ORGANIZATION_PREFIX) ? organizationRef : `${ORGANIZATION_PREFIX}${organizationRef}`
}

export const findPractitionerRoleByOrganizationRef = (roles: PractitionerRole[], organizationRef: string): PractitionerRole | undefined => {
  const ref = buildOrganizationRef(organizationRef);
  return (roles || []).find((role) => role.organization.reference === ref)
}

export const isPractitionerResident = (role: PractitionerRole): boolean => {
  return role && role.code.some((r) => r.coding?.find((coding) => coding.code === RESIDENT_CODE))
}