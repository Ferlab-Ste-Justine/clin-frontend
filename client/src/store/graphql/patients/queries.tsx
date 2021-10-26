import { gql } from '@apollo/client';

export const PATIENTS_QUERY = gql`
  query PatientsInformation ($sqon: JSON, $first: Int, $offset: Int) {
    Patients {
      hits(filters: $sqon, first: $first, offset: $offset) {
        edges {
          node {
            cid
            score
            birthDate
            bloodRelationship
            ethnicity
            familyId
            familyType
            fetus
            firstName
            gender
            lastName
            position
            ramq
            timestamp
            organization {
              cid
              name
            }
            requests {
              prescription
              request
              status
              submitted
              test
            }
            practitioner {
              cid
              firstName
              lastName
            }
          }
        }
        total
      }
    }
  }
`;