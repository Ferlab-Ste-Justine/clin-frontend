import React from 'react';
import { MappingResults } from 'store/graphql/utils/actions';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  'consequences.biotype',
  'gene_external_reference',
  'genes__hpo__hpo_term_label',
  'genes__orphanet__panel',
  'genes__omim__name',
  'genes__ddd__disease_name',
  'genes__cosmic__tumour_types_germline',
];
const SUGGESTION_TYPE = 'genes';
const PLACE_HOLDER_TEXT = 'BRAF';
const TITLE = 'Search by Gene';

const GeneFilter = ({ mappingResults }: OwnProps) => {
  return <>Gene Filters</>;
};

export default GeneFilter;