export const mockRoleDoctorAndResident = {
  "organization": {
    "reference": "Organization/CHUSJ"
  },
  "code": [
    {
      "coding": [
        {
          "code": "doctor"
        }
      ]
    },
    {
      "coding": [
        {
          "code": "405277009"
        }
      ]
    }
  ]
}

export const mockRoleDoctor = {
  "organization": {
      "reference": "Organization/CHUM"
  },
  "code": [
      {
          "coding": [
              {
                  "code": "doctor"
              }
          ]
      }
  ]
}

export const roles = [mockRoleDoctorAndResident, mockRoleDoctor]