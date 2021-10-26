import React, { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { ISqonGroupFilter } from '@ferlab/ui/core/data/sqon/types';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';

import { Aggregations } from 'store/graphql/models';
import { ExtendedMappingResults } from 'store/graphql/models';
import {PrescriptionResult} from "store/graphql/prescriptions/models/Prescription";

import SidebarFilters from './SidebarFilters';

import styles from './Sidebar.module.scss';

export type SidebarData = {
  aggregations: Aggregations;
  results: PrescriptionResult[];
  extendedMapping: ExtendedMappingResults;
};

type PrescriptionSidebarProps = SidebarData & {
  filters: ISqonGroupFilter;
};

const PrescriptionSidebar = ({
  aggregations,
  extendedMapping,
  filters,
  results
}: PrescriptionSidebarProps): React.ReactElement => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <StackLayout center={false} className={styles.siderContainer} flexContent vertical>
      {collapsed ? (
        <MenuUnfoldOutlined onClick={() => setCollapsed(!collapsed)} />
      ) : (
        <MenuFoldOutlined onClick={() => setCollapsed(!collapsed)} />
      )}
      {!collapsed && (
        <div className={`${styles.scrollView} ${styles.filters}`}>
          <SidebarFilters
            aggregations={aggregations}
            extendedMapping={extendedMapping}
            filters={filters}
            results={results}
          />
        </div>
      )}
    </StackLayout>
  );
};

export default PrescriptionSidebar;
