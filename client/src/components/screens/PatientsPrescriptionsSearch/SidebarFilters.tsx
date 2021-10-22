import React from 'react';
import intl from 'react-intl-universal';
import { useHistory } from "react-router-dom";
import { InfoCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { ISqonGroupFilter } from '@ferlab/ui/core/data/sqon/types';
import { Col, Row, Tooltip } from 'antd';

import { ExtendedMappingResults, usePrescription } from 'store/graphql/prescriptions/actions';
import { GqlResults } from 'store/graphql/prescriptions/models';
import { generateFilters } from 'store/graphql/utils/Filters';

import SearchBar from './SearchBar';
import { MAX_NUMBER_RESULTS } from './SearchPrescription';

import style from './SidebarFilter.module.scss';

export type SidebarFilterProps = {
  filters: ISqonGroupFilter;
  results: GqlResults;
  extendedMapping: ExtendedMappingResults;
};

export interface ItemProps {
  label: React.ReactElement;
  value: string;
}

const sqon = {
  content: [],
  op: 'and',
};

const SidebarFilters = ({
  extendedMapping,
  filters,
  results
}: SidebarFilterProps): React.ReactElement => {
  const options: ItemProps[] = [];
  const history = useHistory();

  const prescriptions = usePrescription({
    first: MAX_NUMBER_RESULTS,
    offset: 0,
    sqon: sqon,
  });

  if (prescriptions && prescriptions.data) {
    results.data.forEach((n) =>
      options.push({
        label: (
          <>
            <Row>
              <Col span={2}>
                <ReadOutlined />
              </Col>
              <Col span={22}>
                <div className={style.searchDropdownCode}>{n.code}</div>
                <div className={style.searchDropdownName}>{n.name}</div>
              </Col>
            </Row>
          </>
        ),
        value: `${n.code}|${n.name}`,
      }),
    );
  }

  return (
    <>
      <div id={'anchor-search-bar'}>
        <Row gutter={5}>
          <Col>
            <div className={style.searchTitle}>{intl.get('components.table.action.search')}</div>
          </Col>
          <Col>
            <Tooltip placement="topLeft" title={intl.get('screen.patientsearch.placeholder')}>
              <InfoCircleOutlined className={style.searchIconsDisabled} />
            </Tooltip>
          </Col>
        </Row>
        {options.length ? <SearchBar filters={filters} options={options} /> : <div />}
      </div>
      {generateFilters(history, results, extendedMapping)}
    </>
  );
};

export default SidebarFilters;
