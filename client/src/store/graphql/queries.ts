import { gql } from '@apollo/client';
import { ISyntheticSqon } from '@ferlab/ui/core/data/sqon/types'

export type QueryVariable = {
  sqon: ISyntheticSqon;
  first: number; // number of element to fetch
  offset: number; // start from offset number of elements
};

export const INDEX_EXTENDED_MAPPING = (index: string) => gql`
query ExtendedMapping {
  ${index} {
    extended
  }
}
`;
