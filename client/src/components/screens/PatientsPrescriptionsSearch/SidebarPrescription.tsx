import React, { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { ISqonGroupFilter } from '@ferlab/ui/core/data/sqon/types';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';

import { ExtendedMappingResults } from 'store/graphql/prescriptions/actions';
import { Results } from 'store/graphql/prescriptions/models';

import SidebarFilters from './SidebarFilters';

import styles from './Sidebar.module.scss';


export type SidebarData = {
  results: Results;
  extendedMapping: ExtendedMappingResults;
};

type PrescriptionSidebarProps = SidebarData & {
  filters: ISqonGroupFilter;
};

const PrescriptionSidebar = ({
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

      <div className={styles.scrollView}>
        {!collapsed && (
          <SidebarFilters
            extendedMapping={extendedMapping}
            filters={filters}
            results={results}
          />
        )}
      </div>
    </StackLayout>
  );
};

export default PrescriptionSidebar;
