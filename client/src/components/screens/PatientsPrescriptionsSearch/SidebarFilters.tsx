import React from 'react';
import { useHistory } from "react-router-dom";
import { ReadOutlined } from '@ant-design/icons';
import { ISqonGroupFilter } from '@ferlab/ui/core/data/sqon/types';
import { Col, Row } from 'antd';

import { Aggregations, ArrangerNodeData } from 'store/graphql/models';
import { ExtendedMappingResults } from 'store/graphql/models';
import { generateFilters } from 'store/graphql/utils/Filters';

import style from './SidebarFilter.module.scss';
import {PrescriptionResult} from "store/graphql/prescriptions/models/Prescription";

export type SidebarFilterProps = {
  aggregations: Aggregations;
  filters: ISqonGroupFilter;
  results: PrescriptionResult[];
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
  aggregations,
  extendedMapping,
  results
}: SidebarFilterProps): React.ReactElement => {
  const options: ItemProps[] = [];
  const history = useHistory();

  if (results) {
    results.forEach((n) =>
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
      {generateFilters(history, aggregations, extendedMapping)}
    </>
  );
};

export default SidebarFilters;
