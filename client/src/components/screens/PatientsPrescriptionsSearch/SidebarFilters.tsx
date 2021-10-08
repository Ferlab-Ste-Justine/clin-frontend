import React from 'react';
import intl from 'react-intl-universal';
import { useHistory } from "react-router-dom";
import { InfoCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { ISqonGroupFilter } from '@ferlab/ui/core/data/sqon/types';
import { Col, Row, Tooltip } from 'antd';

import { ExtendedMappingResults, usePrescriptionSearch } from 'store/graphql/prescriptions/actions';
import { Results } from 'store/graphql/prescriptions/models';
import { generateFilters } from 'store/graphql/utils/Filters';

import SearchBar from './SearchBar';
import { MAX_NUMBER_RESULTS } from './SearchPrescription';

import style from './SidebarFilter.module.scss';

export type SidebarFilterProps = {
  filters: ISqonGroupFilter;
  results: Results;
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
  const data = results;
  const options: ItemProps[] = [];
  const history = useHistory();

  const prescriptions = usePrescriptionSearch({
    first: MAX_NUMBER_RESULTS,
    offset: 0,
    sqon: sqon,
  });

  if (prescriptions && prescriptions.data) {
    prescriptions.data.hits.edges.forEach((n: any) =>
      options.push({
        label: (
          <>
            <Row>
              <Col span={2}>
                <ReadOutlined />
              </Col>
              <Col span={22}>
                <div className={style.searchDropdownCode}>{n.node.code}</div>
                <div className={style.searchDropdownName}>{n.node.name}</div>
              </Col>
            </Row>
          </>
        ),
        value: `${n.node.code}|${n.node.name}`,
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
      {generateFilters(history, data, extendedMapping)}
    </>
  );
};

export default SidebarFilters;
