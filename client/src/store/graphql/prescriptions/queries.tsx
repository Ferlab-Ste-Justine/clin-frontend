import { gql } from '@apollo/client';

import { fields } from './models/Prescription';

export const PRESCRIPTIONS_QUERY = gql`
  query PrescriptionsInformation ($sqon: JSON, $first: Int, $offset: Int) {
    Prescriptions {
      hits(filters: $sqon, first: $first, offset: $offset) {
        edges {
          node {
            cid
            status
            timestamp
            test
            submitted
            practitioner {
              cid
              firstName
              lastName
            }
            familyInfo {
              cid
              type
            }
            patientInfo {
              cid
              organization {
                cid
                name
              }
            }
          }
        }
        total
      }
      aggregations (filters: $sqon){
        ${fields.map(
          (f) =>
            f +
            ' {\n          buckets {\n            key\n            doc_count\n          }\n        }',
        )}
      }
    }
  }
`;


export const PRESCRIPTIONS_SEARCH_QUERY = gql`
  query PrescriptionsInformationSearch ($sqon: JSON, $first: Int, $offset: Int) {
    Prescriptions {
      hits(filters: $sqon, first: $first, offset: $offset) {
        edges {
          node {
            cid
            status
            timestamp
            practitioner {
              cid
              firstName
              lastName
            }
            familyInfo {
              cid
              type
            }
            patientInfo {
              cid
              organization {
                name
              }
            }
          }
        }
        total
      }

    }
  }
`;
