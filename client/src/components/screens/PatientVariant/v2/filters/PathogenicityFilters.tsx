import React from 'react';
import { MappingResults } from 'store/graphql/utils/actions';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  'clinvar__clin_sig',
  'consequences__vep_impact', //<--- not in index
  'consequences__predictions__sift_pred', //<--- not in index
  'consequences__predictions__polyphen2_hvar_pred', //<--- not in index
  'consequences__predictions__fathmm_pred', //<--- not in index
  'consequences__predictions__cadd_rankscore', //<--- not in index
  'consequences__predictions__dann_rankscore', //<--- not in index
  'consequences__predictions__lrt_pred', //<--- not in index
  'consequences__predictions__revel_rankscore', //<--- not in index
];

const PathogenicityFilters = ({ mappingResults }: OwnProps) => {
  return <>Pathogenicity Filters</>;
};

export default PathogenicityFilters;