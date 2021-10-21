import { computeHeadingLevel } from ".pnpm/@testing-library+dom@7.28.1/node_modules/@testing-library/dom"
import { Organization } from "helpers/search/types"
import { PractitionerRole } from "./types"

const RESIDENT_CODE = '405277009'
const ORGANIZATION_PREFIX = 'Organization/'

const buildOrganizationRef = (organizationRef: string) => {
  return organizationRef ? organizationRef.startsWith(ORGANIZATION_PREFIX) ? organizationRef : `${ORGANIZATION_PREFIX}${organizationRef}` : undefined
}

export const findPractitionerRoleByOrganizationRef = (roles: PractitionerRole[], organizationRef: string): PractitionerRole | undefined => {
  const ref = buildOrganizationRef(organizationRef);
  return roles && organizationRef ? roles.find((role) => role.organization.reference === ref) : undefined
}

export const isPractitionerResident = (role: PractitionerRole) => {
  return role ? role.code.find((r) => r.coding?.find((coding) => coding.code === RESIDENT_CODE)) !== undefined : false
}