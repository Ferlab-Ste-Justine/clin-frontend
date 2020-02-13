import React from 'react';
import {
  Row, Col, Checkbox, Radio, Tag, Tooltip,
} from 'antd';
import intl from 'react-intl-universal';
import {
  cloneDeep, pull, orderBy, pullAllBy, filter,
} from 'lodash';
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
  /* @NOTE SQON Struct Sample
  {
    type: 'specific',
    data: {
        id: 'variant_type',
        operand: 'all',
        values: ['SNP', 'deletion']
    }
  }
  */
  static structFromArgs(id, values = [], operand = FILTER_OPERAND_TYPE_DEFAULT) {
    return {
      id,
      type: FILTER_TYPE_SPECIFIC,
      operand,
      values,
    };
  }

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

  handleOperandChange(operand) {
    const { config } = this.props;
    if (config.operands.indexOf(operand) !== -1) {
      const { draft } = this.state;
      draft.operand = operand;
      this.setState({ draft });
    }
  }

  handleCheckAllSelections(e) {
    const { target } = e;
    const { draft } = this.state;
    if (!target.checked) {
      draft.values = [];
      this.setState({
        selection: [],
        draft,
        indeterminate: false,
      });
    } else {
      const { dataSet, externalDataSet } = this.props;
      const { selector } = this.state;
      const notObserved = externalDataSet.ontology.filter(ontology => ontology.observed === 'NEG' || ontology.observed === '')
        .map(ontology => ontology.code);
      const observed = externalDataSet.ontology.filter(ontology => ontology.observed === 'POS')
        .map(ontology => ontology.code);
      const hpoRegexp = new RegExp(/HP:[0-9]{7}/g);
      let options = [];
      let indeterminate = false;

      switch (selector) {
        default:
        case SELECTOR_ALL:
          options = dataSet;
          break;
        case SELECTOR_INTERSECTION:
          indeterminate = true;
          options = dataSet.filter((option) => {
            const hpoValue = option.value.match(hpoRegexp).toString();
            return hpoValue ? (observed.indexOf(hpoValue) !== -1) : false;
          });
          break;
        case SELECTOR_DIFFERENCE:
          indeterminate = true;
          options = dataSet.filter((option) => {
            const hpoValue = option.value.match(hpoRegexp).toString();
            return hpoValue ? (notObserved.indexOf(hpoValue) !== -1) : false;
          });
          break;
      }

      const selection = options.map(option => option.value);
      draft.values = selection;
      this.setState({
        selection,
        draft,
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

    options.forEach((x) => {
      if (selection.includes(x.value)) {
        if (!values.includes(x.value)) { pull(selection, x.value); }
      } else if (values.includes(x.value)) { selection.push(x.value); }
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
    const { renderCustomDataSelector } = this.props;
    const {
      selection, selector, size, page, allOptions, indeterminate,
    } = this.state;
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
            { customDataSelector }
          </Row>
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
        searchable
        onSearchCallback={this.handleSearchByQuery}
        onPageChangeCallBack={this.handlePageChange}
        onOperandChange={this.handleOperandChange}
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
      <Row>
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
          <Radio.Group type="secondary" size="small" value={selector} onChange={onChangeCallback}>
            { values.map(value => (
              <Radio.Button value={value.value}>
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
