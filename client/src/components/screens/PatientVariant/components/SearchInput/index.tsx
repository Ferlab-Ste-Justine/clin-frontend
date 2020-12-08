import React from 'react';
import intl from 'react-intl-universal';
import {
  AutoComplete, Col, Input, Row, Tag, Typography,
} from 'antd';
import IconKit from 'react-icons-kit';
import {
  ic_search,
  ic_done,
} from 'react-icons-kit/md';
import './searchInput.scss';

function getHighlightSearch(value: string, searchValue: string) {
  const regex = new RegExp(searchValue, 'i');
  let tempoValue = value;
  const highlightValue: string[] = [];
  const highlightPart = value.split(regex);
  let haveMoreValue = true;

  while (haveMoreValue) {
    const matchValue = tempoValue.match(regex);
    if (matchValue) {
      highlightValue.push(matchValue[0]);
      // @ts-ignore
      tempoValue = tempoValue.slice(matchValue.index + matchValue[0].length);
    } else {
      haveMoreValue = false;
    }
  }

  return highlightPart.map((stringPart, index) => (
    <>
      { index === 0 ? null : <span className="highlight">{ highlightValue[index - 1] }</span> }{ stringPart }
    </>
  ));
}

interface Props {
  handleNavigationSearch: () => void
  handleNavigationSelection: () => void
  searchQuery: string
  handleAutoCompleteChange: () => void
  searchValue: string
  searchResults: {
    label: string
    matches: {
      value: string,
      count: number
    }[]
  }[]
  searchResultsTotalCount: number
}

function SearchInput({
  handleNavigationSearch,
  handleNavigationSelection,
  searchQuery,
  handleAutoCompleteChange,
  searchValue,
  searchResults,
  searchResultsTotalCount,
}: Props) {
  let autocompletesCount = 0;
  const options = [];

  if (searchValue) {
    options.push(...searchResults.filter((group) => !!group.label).map((group) => {
      autocompletesCount += group.matches.length;

      return {
        value: group.label,
        label: <Typography.Text strong className="label">{ group.label }</Typography.Text>,
        options: group.matches.map((match) => ({
          value: JSON.stringify(match),
          label: (
            <Row gutter={8}>
              <Col span={20}>
                <Typography.Text style={{ maxWidth: '100%' }} ellipsis>
                  <IconKit size={16} icon={ic_done} className="iconCheck" />
                  { getHighlightSearch(match.value, searchValue) }
                </Typography.Text>
              </Col>
              <Col span={4} className="valueCount">
                {
                  match.count
                  && (<Tag color="#f0f2f5">{ intl.get('components.query.count', { count: match.count }) }</Tag>)
                }
              </Col>
            </Row>
          ),
        })),
      };
    }));

    if (searchResultsTotalCount > autocompletesCount) {
      options.push({
        value: 'more-results',
        disabled: true,
        label: (
          <Typography.Text className="dropwDownAutoComplete__detail-item">
            { intl.get('components.variantNavigation.searchInput.moreResults') }
          </Typography.Text>
        ),
      });
    }

    if (searchResultsTotalCount > 0) {
      // Number of elements goes first in the list
      options.unshift({
        value: 'count',
        disabled: true,
        label: (
          <Typography.Text className="dropwDownAutoComplete__detail-item">
            { intl.get('components.variantNavigation.searchInput.resultsCount', { count: searchResultsTotalCount }) }
          </Typography.Text>
        ),
      });
    }
  }

  return (
    <AutoComplete
      key="autocompleter"
      allowClear
      autoFocus
      options={options}
      onSearch={handleNavigationSearch}
      onSelect={handleNavigationSelection}
      value={searchQuery}
      className="autocomplete large-input"
      dropdownClassName="dropwDownAutoComplete"
      onChange={handleAutoCompleteChange}
      open
    >
      <Input prefix={<IconKit size={24} icon={ic_search} />} placeholder="Recherche de filtres" />
    </AutoComplete>
  );
}

export default SearchInput;
