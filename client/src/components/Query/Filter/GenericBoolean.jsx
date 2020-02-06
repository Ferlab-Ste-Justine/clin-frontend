import React from 'react';
import PropTypes from 'prop-types';

import {
  Row, Col, Checkbox, Tooltip, Tag,
} from 'antd';
import {
  cloneDeep, pull, orderBy, pullAllBy, filter,
} from 'lodash';
import intl from 'react-intl-universal';

import Filter, { FILTER_TYPE_GENERICBOOL } from './index';


class GenericBooleanFilter extends React.Component {
  /* @NOTE SQON Struct Sample
  {
      type: 'genericbool,
      data: {
          values: ['pubmed', 'clinvar']
      }
  }
  */
  static structFromArgs(id, values = []) {
    return {
      id,
      type: FILTER_TYPE_GENERICBOOL,
      values,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      size: null,
      page: null,
      allOptions: null,
    };

    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleCheckAllSelections = this.handleCheckAllSelections.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet } = props;
    const selection = data.values ? cloneDeep(data.values) : [];
    const allOptions = orderBy(cloneDeep(dataSet), ['count'], ['desc']);

    this.state.draft = cloneDeep(data);
    this.state.selection = selection;
    this.state.page = 1;
    this.state.size = 10;
    if (selection.length > 0) {
      const value = filter(cloneDeep(dataSet), o => selection.includes(o.value));
      if (value.length === 0) {
        const selectedValue = [];
        selection.map(x => selectedValue.push({ value: x, count: 0 }));
        allOptions.unshift(...selectedValue);
      } else {
        const sorted = orderBy(value, ['count'], ['desc']);
        pullAllBy(allOptions, cloneDeep(sorted), 'value');
        allOptions.unshift(...sorted);
      }
    }
    this.state.allOptions = allOptions;
  }

  getEditor() {
    const {
      selection, size, page, allOptions,
    } = this.state;
    const allSelected = allOptions ? selection.length === allOptions.length : false;
    const minValue = size * (page - 1);
    const maxValue = size * page;

    const selectAll = intl.get('screen.patientvariant.filter.selection.all');
    const selectNone = intl.get('screen.patientvariant.filter.selection.none');

    const options = allOptions.slice(minValue, maxValue).map((option) => {
      const value = option.value.length < 60 ? option.value : `${option.value.substring(0, 55)} ...`;
      return {
        label: (
          <span>
            <Tooltip title={option.value}>
              {value}
            </Tooltip>
            <Tag>{option.count}</Tag>
          </span>
        ),
        value: option.value,
      };
    });

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: (
        <>
          <Row>
            <Checkbox
              key="check-all"
              className="selector"
              indeterminate={(!allSelected && selection.length > 0)}
              onChange={this.handleCheckAllSelections}
              checked={allSelected}
            />
            {(!allSelected ? selectAll : selectNone)}
          </Row>
          <br />
          <Row>
            <Col span={24}>
              <Checkbox.Group
                options={options}
                value={selection}
                onChange={this.handleSelectionChange}
              />
            </Col>
          </Row>
        </>
      ),
    };
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, values } = draft;

    return GenericBooleanFilter.structFromArgs(id, values);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, values } = data;

    return GenericBooleanFilter.structFromArgs(id, values);
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: null,
      targets: data.values,
    };
  }

  handleCheckAllSelections(e) {
    const { target } = e;
    const { draft } = this.state;
    if (!target.checked) {
      draft.values = [];
      this.setState({
        selection: [],
        draft,
      });
    } else {
      const { dataSet } = this.props;
      const selection = dataSet.map(option => option.value);
      draft.values = selection;
      this.setState({
        selection,
        draft,
      });
    }
  }

  handleSearchByQuery(values) {
    const { dataSet } = this.props;
    const allOptions = orderBy(cloneDeep(dataSet), ['count'], ['desc']);
    const search = values;
    const toRemove = filter(cloneDeep(allOptions), o => (search !== '' ? !o.value.toLowerCase().startsWith(search) : null));

    pullAllBy(allOptions, cloneDeep(toRemove), 'value');
    this.setState({
      allOptions,
    });
  }

  handleSelectionChange(values) {
    const {
      selection, allOptions, page, size, draft,
    } = this.state;

    const minValue = size * (page - 1);
    const maxValue = size * page;
    const options = allOptions.slice(minValue, maxValue);

    options.forEach((x) => {
      if (selection.includes(x.value)) {
        if (!values.includes(x.value)) { pull(selection, x.value); }
      } else if (values.includes(x.value)) { selection.push(x.value); }
    });
    draft.values = selection;
    this.setState({
      selection,
      draft,
    });
  }

  render() {
    return (
      <Filter
        {...this.props}
        type={FILTER_TYPE_GENERICBOOL}
        editor={this.getEditor()}
        searchable
        onSearchCallback={this.handleSearchByQuery}
      />
    );
  }
}

GenericBooleanFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};

export default GenericBooleanFilter;
