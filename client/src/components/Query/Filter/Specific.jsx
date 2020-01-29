/* eslint-disable */

import React from 'react';
import {
  Row, Col, Checkbox, Radio, Tag, Tooltip,
} from 'antd';
import intl from 'react-intl-universal';
import {
  cloneDeep, pull, orderBy, pullAllBy, filter,
} from 'lodash';
import {
  empty, one, full,
} from 'react-icons-kit/entypo';
import PropTypes from 'prop-types';

import Filter, { FILTER_TYPE_SPECIFIC } from './index';
import {
  FILTER_OPERAND_TYPE_ALL,
  FILTER_OPERAND_TYPE_DEFAULT,
  FILTER_OPERAND_TYPE_NONE,
  FILTER_OPERAND_TYPE_ONE,
} from './Generic';

const SELECTOR_ALL = 'all';
const SELECTOR_INTERSECTION = 'intersection';
const SELECTOR_DIFFERENCE = 'difference';
const SELECTOR_DEFAULT = SELECTOR_ALL;
const SELECTORS = [SELECTOR_ALL, SELECTOR_INTERSECTION, SELECTOR_DIFFERENCE];

class SpecificFilter extends Filter {
  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      selector: null,
      indeterminate: false,
      size: null,
      page: null,
      allOptions: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleOperandChange = this.handleOperandChange.bind(this);
    this.handleSelectorChange = this.handleSelectorChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleCheckAllSelections = this.handleCheckAllSelections.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet } = props;

    this.state.draft = cloneDeep(data);
    this.state.selector = SELECTOR_DEFAULT;
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;
    this.state.allOptions = cloneDeep(dataSet);

    const { selection, allOptions } = this.state;
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
  }

  static structFromArgs(id, values = [], operand = FILTER_OPERAND_TYPE_DEFAULT) {
    return {
      id,
      type: FILTER_TYPE_SPECIFIC,
      operand,
      values,
    };
  }

  handleSearchByQuery(values) {
    const { dataSet } = this.props;
    const allOptions = cloneDeep(dataSet);
    const search = values.toLowerCase();
    const toRemove = filter(cloneDeep(allOptions), o => (search !== '' ? !o.value.toLowerCase().startsWith(search) : null));

    pullAllBy(allOptions, cloneDeep(toRemove), 'value');
    this.setState({
      allOptions,
    });
  }

  handlePageChange(page, size) {
    this.setState({
      page,
      size,
    });
  }

  handleCheckAllSelections(e) {
    const { target } = e;
    if (!target.checked) {
      this.setState({
        selection: [],
        indeterminate: false,
      });
    } else {
      const { dataSet, externalDataSet } = this.props;
      const { selector } = this.state;
      const externalOntology = externalDataSet.ontology.map(ontology => ontology.code);
      let options = [];
      let indeterminate = false;
      switch (selector) {
        default:
        case SELECTOR_ALL:
          options = dataSet;
          break;
        case SELECTOR_INTERSECTION:
          indeterminate = true;
          options = dataSet.filter(option => externalOntology.indexOf(option.value.split(',')[0]) !== -1);
          break;
        case SELECTOR_DIFFERENCE:
          indeterminate = true;
          options = dataSet.filter(option => externalOntology.indexOf(option.value.split(',')[0]) === -1);
          break;
      }

      this.setState({
        selection: options.map(option => option.value),
        indeterminate,
      });
    }
  }

  handleSelectionChange(values) {
    const { dataSet } = this.props;
    const { draft } = this.state;
    const {
      selection, allOptions, page, size,
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

  handleSelectorChange(e) {
    const selector = e.target.value;
    if (SELECTORS.indexOf(selector) !== -1) {
      this.setState({ selector });
    }
  }

  handleOperandChange(e) {
    const { config } = this.props;
    const operand = e.target.value;
    if (config.operands.indexOf(operand) !== -1) {
      const { draft } = this.state;
      draft.operand = operand;
      this.setState({ draft });
    }
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, operand, values } = draft;

    return SpecificFilter.structFromArgs(id, values, operand);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, operand, values } = data;

    return SpecificFilter.structFromArgs(id, values, operand);
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: intl.get(`screen.patientvariant.filter.operand.${data.operand}`),
      targets: data.values,
    };
  }

  getEditor() {
    const { config, renderCustomDataSelector } = this.props;
    const {
      draft, selection, selector, size, page, allOptions, indeterminate,
    } = this.state;
    const { operand } = draft;
    const allSelected = allOptions ? selection.length === allOptions.length : false;
    const selectAll = intl.get('screen.patientvariant.filter.selection.all');
    const selectNone = intl.get('screen.patientvariant.filter.selection.none');
    const selectorAll = intl.get('screen.patientvariant.filter.specific.selector.all');
    const selectorIntersection = intl.get('screen.patientvariant.filter.specific.selector.intersection');
    const selectorDifference = intl.get('screen.patientvariant.filter.specific.selector.difference');
    const minValue = size * (page - 1);
    const maxValue = size * page;

    pullAllBy(allOptions, [{ value: '' }], 'value');

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

    const customDataSelector = renderCustomDataSelector(
      this.handleSelectorChange,
      this.handleCheckAllSelections,
      [
        { label: selectorIntersection, value: SELECTOR_INTERSECTION },
        { label: selectorDifference, value: SELECTOR_DIFFERENCE },
        { label: selectorAll, value: SELECTOR_ALL },
      ],
      selector,
      allSelected ? selectNone : selectAll,
      allSelected,
      indeterminate,
    );

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: (
        <>
          <Row>
            <Col span={24}>
              <Radio.Group size="small" type="primary" value={operand} onChange={this.handleOperandChange}>
                {config.operands.map(configOperand => (
                  <Radio.Button style={{ width: 150, textAlign: 'center' }} value={configOperand}>
                    {intl.get(`screen.patientvariant.filter.operand.${configOperand}`)}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Col>
          </Row>
          { customDataSelector }
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

  render() {
    const { allOptions } = this.state;
    return (
      <Filter
        {...this.props}
        type={FILTER_TYPE_SPECIFIC}
        editor={this.getEditor()}
        searchable={true}
        onSearchCallback={this.handleSearchByQuery}
        onPageChangeCallBack={this.handlePageChange}
        sortData={allOptions}
      />
    );
  }
}

SpecificFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
  category: PropTypes.string,
  config: PropTypes.shape({}).isRequired,
  externalDataSet: PropTypes.shape({}).isRequired,
  renderCustomDataSelector: PropTypes.shape.func,
};

SpecificFilter.defaultProps = {
  renderCustomDataSelector: (onChangeCallback, onCheckAllCallback, values, selector, checkboxLabel, checkboxIsChecked, checkboxIsIndeterminate = false) => (
    // @NOTE Contained in both dataSet and externalDataSet -> intersection / not intersection
    <>
      <br />
      <Row style={{ display: 'flex', alignItems: 'center' }}>
        <Col span={6}>
          <Checkbox
            key="specific-selector-check-all"
            className="selector"
            indeterminate={checkboxIsIndeterminate}
            onChange={onCheckAllCallback}
            checked={checkboxIsChecked}
          />
          {checkboxLabel}
        </Col>
        <Col span={18}>
          <Radio.Group size="small" type="secondary" value={selector} onChange={onChangeCallback} style={{ display: 'flex', justifyContent: 'stretch' }}>
            { values.map(value => (
              <Radio.Button style={{ textAlign: 'center', width: '100%' }} value={value.value}>
                {value.label}
              </Radio.Button>
            )) }
          </Radio.Group>
        </Col>
      </Row>
    </>
  ),
  category: '',
  config: {
    operands: [FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_NONE],
  },
};

export default SpecificFilter;
