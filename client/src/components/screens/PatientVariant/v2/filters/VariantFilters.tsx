import React from 'react';
import { MappingResults } from 'store/graphql/utils/actions';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [
  'variant_class',
  'consequences__consequences',
  'variant_external_reference',
  'chromosome',
  'start',
];
const SUGGESTION_TYPE = 'variants';
const PLACE_HOLDER_TEXT = 'chr2:g.28025382G>T';
const TITLE = 'Search by Variant';

const VariantFilter = ({ mappingResults }: OwnProps) => {
  return <>Variant Filters</>;
};

export default VariantFilter;