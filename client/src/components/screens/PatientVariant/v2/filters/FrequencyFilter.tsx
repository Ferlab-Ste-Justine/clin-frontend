import React from 'react';
import { MappingResults } from 'store/graphql/utils/actions';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  'participant_frequency',
  'frequencies__gnomad_genomes_2_1__af',
  'frequencies__gnomad_genomes_3_0__af',
  'frequencies__gnomad_genomes_3_1_1__af',
  'frequencies__gnomad_exomes_2_1__af',
  'frequencies__topmed__af',
  'frequencies__one_thousand_genomes__af',
];

const FrequencyFilter = ({ mappingResults }: OwnProps) => {
  return <>Frequency Filters</>;
};

export default FrequencyFilter;
