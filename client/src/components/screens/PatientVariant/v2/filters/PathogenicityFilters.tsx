import React from 'react';
import { MappingResults } from 'store/graphql/utils/actions';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  'clinvar__clin_sig',
  'consequences__vep_impact',
  'consequences__predictions__sift_pred',
  'consequences__predictions__polyphen2_hvar_pred',
  'consequences__predictions__fathmm_pred',
  'consequences__predictions__cadd_rankscore',
  'consequences__predictions__dann_rankscore',
  'consequences__predictions__lrt_pred',
  'consequences__predictions__revel_rankscore',
];

const PathogenicityFilters = ({ mappingResults }: OwnProps) => {
  return <>Pathogenicity Filters</>;
};

export default PathogenicityFilters;