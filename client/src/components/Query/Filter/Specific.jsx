
import React from 'react';
import {
  Row, Col, Checkbox, Tag, Tooltip, Divider, Button,
} from 'antd';
import intl from 'react-intl-universal';
import {
  cloneDeep, orderBy, pullAllBy, filter,
} from 'lodash';
import PropTypes from 'prop-types';

import Filter, {
  FILTER_TYPE_SPECIFIC,
  FILTER_OPERAND_TYPE_ALL,
  FILTER_OPERAND_TYPE_DEFAULT,
  FILTER_OPERAND_TYPE_NONE,
  FILTER_OPERAND_TYPE_ONE,
} from './index';
import '../styles/filter.scss';
import styleFilter from '../styles/filter.module.scss';

const SELECTOR_ALL = 'all';
const SELECTOR_NONE = 'none';
const SELECTOR_INTERSECTION = 'intersection';
const SELECTOR_DIFFERENCE = 'difference';
const SELECTOR_DEFAULT = SELECTOR_NONE;
const SELECTORS = [SELECTOR_ALL, SELECTOR_NONE, SELECTOR_INTERSECTION, SELECTOR_DIFFERENCE];

class SpecificFilter extends Filter {
  /* @NOTE SQON Struct Sample
  {
    type: 'specific',
    data: {
        id: 'variant_type',
        operand: 'all',
        selector: 'none',
        values: ['SNP', 'deletion']
    }
  }
  */
  static structFromArgs(id, values = [], operand = FILTER_OPERAND_TYPE_DEFAULT, selector = SELECTOR_NONE) {
    return {
      id,
      type: FILTER_TYPE_SPECIFIC,
      operand,
      selector,
      values,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      selector: null,
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

  handleSelectionChange(values) {
    const { draft } = this.state;

    draft.values = values;
    this.setState({
      draft,
    });
  }

  handleSelectorChange(selector) {
    if (SELECTORS.indexOf(selector) !== -1) {
      const { draft } = this.state;
      const { dataSet, externalDataSet } = this.props;
      const hpoRegexp = new RegExp(/HP:[0-9]{7}/g);
      let selectedValues = [];
      let selectorDataSet = [];

      switch (selector) {
        default:
        case SELECTOR_NONE:
          break;
        case SELECTOR_ALL:
          selectedValues = dataSet;
          break;
        case SELECTOR_INTERSECTION:
          selectorDataSet = externalDataSet.ontology.filter(ontology => ontology.observed === 'POS')
            .map(ontology => ontology.code);
          selectedValues = dataSet.filter((option) => {
            const hpoValue = option.value.match(hpoRegexp).toString();
            return hpoValue ? (selectorDataSet.indexOf(hpoValue) !== -1) : false;
          });
          break;
        case SELECTOR_DIFFERENCE:
          selectorDataSet = externalDataSet.ontology.filter(ontology => ontology.observed === 'NEG' || ontology.observed === '')
            .map(ontology => ontology.code);
          selectedValues = dataSet.filter((option) => {
            const hpoValue = option.value.match(hpoRegexp).toString();
            return hpoValue ? (selectorDataSet.indexOf(hpoValue) !== -1) : false;
          });
          break;
      }

      draft.values = selectedValues.map(option => option.value);
      draft.selector = selector;
      this.setState({
        draft,
      });
    }
  }

  handleOperandChange(operand) {
    const { config } = this.props;
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
    const { renderCustomDataSelector } = this.props;
    const {
      draft, size, page, allOptions,
    } = this.state;
    const { selector } = draft;
    const selectorAll = intl.get('screen.patientvariant.filter.specific.selector.all');
    const selectorNone = intl.get('screen.patientvariant.filter.specific.selector.none');
    const selectorIntersection = intl.get('screen.patientvariant.filter.specific.selector.intersection');
    const selectorDifference = intl.get('screen.patientvariant.filter.specific.selector.difference');
    const minValue = size * (page - 1);
    const maxValue = size * page;

    pullAllBy(allOptions, [{ value: '' }], 'value');

    const options = allOptions.slice(minValue, maxValue).map((option) => {
      const value = option.value.length < 29 ? option.value : `${option.value.substring(0, 25)} ...`;
      return {
        label: (
          <span className={styleFilter.checkboxValue}>
            <Tooltip title={option.value}>
              {value}
            </Tooltip>
            <Tag className={styleFilter.valueCount}>{option.count}</Tag>
          </span>
        ),
        value: option.value,
      };
    });

    const dataSelector = renderCustomDataSelector(
      this.handleSelectorChange,
      [
        { label: selectorAll, value: SELECTOR_ALL },
        { label: selectorNone, value: SELECTOR_NONE },
        { label: selectorIntersection, value: SELECTOR_INTERSECTION },
        { label: selectorDifference, value: SELECTOR_DIFFERENCE },
      ],
      selector,
    );

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: (
        <>
          { dataSelector || null }
          <Row>
            <Col span={24}>
              <Checkbox.Group onChange={this.handleSelectionChange} option={options} className={`${styleFilter.checkboxGroup} `} value={draft.values}>
                { options.map(option => (
                  <Row>
                    <Col>
                      <Checkbox className={draft.values.includes(option.value) ? `${styleFilter.check} ${styleFilter.checkboxLabel}` : `${styleFilter.checkboxLabel}`} value={option.value}>{ option.label }</Checkbox>
                    </Col>
                  </Row>
                )) }
              </Checkbox.Group>
            </Col>
          </Row>
        </>
      ),
    };
  }

  render() {
    const { allOptions, draft } = this.state;
    const { config } = this.props;

    return (
      <Filter
        {...this.props}
        config={config}
        type={FILTER_TYPE_SPECIFIC}
        editor={this.getEditor()}
        searchable
        draft={draft}
        onSearchCallback={this.handleSearchByQuery}
        onPageChangeCallBack={this.handlePageChange}
        onOperandChangeCallBack={this.handleOperandChange}
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
  renderCustomDataSelector: (onChangeCallback, values) => (
    // @NOTE Contained in both dataSet and externalDataSet -> intersection / not intersection
    <Row className={styleFilter.selectionToolBar}>
      { values.map(value => (
        <>
          <Button onClick={() => onChangeCallback(value.value)} className={value.value}>{value.label}</Button>
          <Divider className="divider" type="vertical" />
        </>
      )) }
    </Row>
  ),
  category: '',
  config: {
    operands: [FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_NONE],
  },
};

export default SpecificFilter;
