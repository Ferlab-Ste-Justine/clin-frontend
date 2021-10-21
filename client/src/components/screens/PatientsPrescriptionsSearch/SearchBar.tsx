import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { VisualType } from '@ferlab/ui/core/components/filters/types';
import { getQueryBuilderCache, updateFilters } from '@ferlab/ui/core/data/filters/utils';
import {
  ISqonGroupFilter,
  ISyntheticSqon,
  IValueContent,
  TSqonContentValue,
} from '@ferlab/ui/core/data/sqon/types';
import { resolveSyntheticSqon } from '@ferlab/ui/core/data/sqon/utils';
import { Select, Tag } from 'antd';

import { ItemProps } from './SidebarFilters';

import styles from './SearchBar.module.scss';

type OwnProps = {
  options: ItemProps[];
  filters: ISqonGroupFilter;
};

const extractCodesFromFilter = (filters: ISyntheticSqon) => {
  const allSqons = getQueryBuilderCache('study-repo').state;
  const resolvedSqon = resolveSyntheticSqon(allSqons, filters);

  const find = resolvedSqon.content.find(
    (s: TSqonContentValue) => (s.content as IValueContent)?.field === 'code',
  );
  return find ? (find.content as IValueContent).value : [];
};

const codeFromKey = (key: string) => key.split('|')[0];

const SearchBar = ({ filters, options }: OwnProps) => {
  const [selected, setSelected] = useState<string[]>([]);

  const selectedStudyCodes = extractCodesFromFilter(filters);

  useEffect(() => {
    const updateSelected = options.filter((f) => selectedStudyCodes.includes(codeFromKey(f.value)));
    setSelected(updateSelected.map((s) => s.value));
  }, [filters]);

  const handleClose = (value: string) => {
    const remainingSelected = selected.filter((v) => v !== value);

    const iFilter = remainingSelected.map((c: string) => ({
      data: { key: codeFromKey(c) },
      id: '',
      name: '',
    }));

    updateFilters(
      history,
      { field: 'code', title: 'Study Code', type: VisualType.Checkbox },
      iFilter,
    );

    setSelected(remainingSelected);
  };

  const handleOnChange = (select: string[]) => {
    const codes = select.map((k: string) => codeFromKey(k));
    const history = useHistory();

    const iFilter = codes.map((c: string) => ({
      data: { key: c },
      id: '',
      name: '',
    }));
    updateFilters(
      history,
      { field: 'code', title: 'Study Code', type: VisualType.Checkbox },
      iFilter,
    );
  };

  const selectProps = {
    allowClear: true,
    maxTagCount: 'responsive' as const,
    mode: 'multiple' as const,
    onChange: (newSelect: string[]) => {
      setSelected(newSelect);
      handleOnChange(newSelect);
    },
    options,
    placeholder: 'KF-DSD, Neuroblastoma…',

    tagRender: ({ value }: Record<string, any>) => (
      <Tag className={styles.tagSearchBar} closable key={value} onClose={() => handleClose(value)}>
        {codeFromKey(value)}
      </Tag>
    ),


    value: selected,
  };

  return (
    <Select
      className={styles.storiesSearchBar}
      getPopupContainer={(trigger) => trigger.parentNode}
      {...selectProps}
    />
  );
};

export default SearchBar;
