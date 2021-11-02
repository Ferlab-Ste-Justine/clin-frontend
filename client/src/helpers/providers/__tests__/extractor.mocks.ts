export const emptyData = {
  practitionersData: {
    entry: []
  },
  patientData: {
    entry: []
  },
}

export const mockPractitioner1 = {
  resourceType: "Practitioner",
  id: "1"
}

export const mockPractitioner2 = {
  resourceType: "Practitioner",
  id: "2"
}

export const mockOrganization1 = {
  resourceType: "Organization",
  id: "1"
}

export const mockPractitionerRole1 = {
  id: "1",
  resourceType: "PractitionerRole",
  practitioner: {
    reference: "Practitioner/1"
  },
  organization: {
    reference: "Organization/1"
  },
}

export const mockPractitionerRole2 = {
  id: "2",
  resourceType: "PractitionerRole",
  practitioner: {
    reference: "Practitioner/2"
  },
  organization: {
    reference: "Organization/2"
  },
}

export const mockData = {
  practitionersData: {
    entry: [
      {
        resource: {
          entry: [
            {
              resource: mockPractitionerRole1
            },
            {
              resource: mockPractitioner1
            },
            {
              resource: mockOrganization1
            }
          ]
        }
      },
      {
        resource: {
          entry: [
            {
              resource: mockPractitionerRole2
            },
            {
              resource: mockPractitioner2
            },
          ]
        }
      }
    ]
  },
  patientData: {
    entry: []
  },
}