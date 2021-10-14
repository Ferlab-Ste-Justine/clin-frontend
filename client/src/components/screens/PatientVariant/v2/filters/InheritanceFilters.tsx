import React from 'react';
import { MappingResults } from 'store/graphql/utils/actions';

import styles from './Filters.module.scss';

type OwnProps = {
  mappingResults: MappingResults;
};

const INPUT_FILTER_LIST = [];

const InheritanceFilters = ({ mappingResults }: OwnProps) => {
  return <>Inheritance Filters</>;
};

export default InheritanceFilters;