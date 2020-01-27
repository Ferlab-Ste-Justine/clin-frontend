/* eslint-disable */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Row, Col, Checkbox, Tooltip, Tag,
} from 'antd';
import {
  cloneDeep, pull, orderBy, pullAllBy, filter,
} from 'lodash';
import Filter, { FILTER_TYPE_GENERIC } from './index';
import { FILTER_TYPE_GENERICBOOL } from './index';

class GenericBooleanFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      indeterminate: false,
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

    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.allOptions = orderBy(cloneDeep(dataSet), ['count'], ['desc']);
    this.state.page = 1;
    this.state.size = 10;

    if (this.state.selection.length > 0) {
      const value = filter(cloneDeep(dataSet), o => this.state.selection.includes(o.value));
      if (value.length === 0) {
        const selectedValue = [];
        this.state.selection.map(x => selectedValue.push({ value: x, count: 0 }));
        this.state.allOptions.unshift(...selectedValue);
      } else {
        const sorted = orderBy(value, ['count'], ['desc']);
        pullAllBy(this.state.allOptions, cloneDeep(sorted), 'value');
        this.state.allOptions.unshift(...sorted);
      }
    }
  }

  static structFromArgs(id, values = []) {
    return {
      id,
      type: FILTER_TYPE_GENERICBOOL,
      values,
    }
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
      targets: data.values
    }
  }

  getEditor() {
    const { intl } = this.props;
    const {
      selection, size, page, allOptions,
    } = this.state;
    const allSelected = allOptions ? selection.length === allOptions.length : false;
    const minValue = size * (page - 1);
    const maxValue = size * page;

    const selectAll = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.all' });
    const selectNone = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.none' });

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
      )
    };
  }

  handleCheckAllSelections(e) {
    const { target } = e;
    if (!target.checked) {
      this.setState({
        selection: [],
        indeterminate: false,
      });
    } else {
      const { dataSet } = this.props;
      const options = dataSet.map(option => option.value);
      this.setState({
        selection: options,
        indeterminate: false,
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
    const { dataSet } = this.props;
    const {
      selection, allOptions, page, size, draft,
    } = this.state;

    const minValue = size * (page - 1);
    const maxValue = size * page;
    const options = allOptions.slice(minValue, maxValue);

    options.map((x) => {
      if (selection.includes(x.value)) {
        !values.includes(x.value) ? pull(selection, x.value) : null;
      } else {
        values.includes(x.value) ? selection.push(x.value) : null;
      }
    });
    draft.values = selection;
    this.setState({
      selection,
      draft,
      indeterminate: (!(values.length === dataSet.length) && values.length > 0),
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
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};

// GenericBooleanFilter.defaultProps = {};

export default GenericBooleanFilter;
