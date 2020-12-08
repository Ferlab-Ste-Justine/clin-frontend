import React from 'react';
import {
  Row, Col, Checkbox, Tag, Tooltip, Divider, Button, Badge,
} from 'antd';
import intl from 'react-intl-universal';
import InfiniteScroll from 'react-infinite-scroller';
import {
  get, cloneDeep, orderBy, pullAllBy, filter, find,
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
const HPO_POSITIVE_CODE = 'POS';
const HPO_NEGATIVE_CODE = 'NEG';
const HPO_REGEX = new RegExp(/HP:[0-9]{7}/g);

const isObservedPos = (ontology) => {
  if (ontology.parsed.observed === HPO_POSITIVE_CODE) {
    return true;
  }

  return false;
};

const isObservedNeg = (ontology) => {
  if (ontology.parsed.observed === HPO_NEGATIVE_CODE) {
    return true;
  }
  return false;
};

const optionObservedPos = (externalDataSet) => (option) => {
  const observedPos = externalDataSet.hpos.filter(isObservedPos);
  const code = option.value.match(HPO_REGEX).toString();
  const obsPos = find(observedPos, { code });
  return obsPos;
};

const optionObservedNeg = (externalDataSet) => (option) => {
  const observedNeg = externalDataSet.hpos.filter(isObservedNeg);
  const code = option.value.match(HPO_REGEX).toString();
  const obsNeg = find(observedNeg, { code });
  return obsNeg;
};

const sortOptions = (externalDataSet) => (options) => {
  const observedPos = options.filter(optionObservedPos(externalDataSet));
  const observedNeg = options.filter(optionObservedNeg(externalDataSet));
  const notObserved = options.filter((o) => !optionObservedPos(externalDataSet)(o) && !optionObservedNeg(externalDataSet)(o));
  return [...observedPos, ...observedNeg, ...notObserved];
};

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
      loadedOptions: [],
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
    this.loadMoreFacets = this.loadMoreFacets.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet, externalDataSet } = props;

    this.state.draft = cloneDeep(data);
    this.state.selector = SELECTOR_DEFAULT;
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;

    const dataSetDeepClone = cloneDeep(dataSet);

    this.state.allOptions = sortOptions(externalDataSet)(dataSetDeepClone);

    const { selection, allOptions } = this.state;
    if (selection.length > 0) {
      const value = filter(cloneDeep(dataSet), (o) => selection.includes(o.value));
      if (value.length === 0) {
        const selectedValue = [];
        selection.map((x) => selectedValue.push({ value: x, count: 0 }));
        allOptions.unshift(...selectedValue);
      } else {
        const sorted = orderBy(value, ['count'], ['desc']);
        pullAllBy(allOptions, cloneDeep(sorted), 'value');
        allOptions.unshift(...sorted);
      }
    }
  }

  handleSearchByQuery(values) {
    const { dataSet, externalDataSet } = this.props;

    let allOptions = cloneDeep(dataSet);
    allOptions = sortOptions(externalDataSet)(allOptions);

    const search = values.toLowerCase();
    const toKeep = filter(allOptions, (o) => (search === '' || o.value.toLowerCase().startsWith(search)));

    allOptions.length = 0;
    allOptions.push(...toKeep);

    const page = 1;
    const loadedOptions = allOptions.slice(
      0,
      Math.min(allOptions.length, page * 10),
    );

    this.setState({
      allOptions,
      currentFacetPage: page,
      loadedOptions,
    });
  }

  handlePageChange(page, size) {
    this.setState({
      page,
      size,
    });
  }

  handleSelectionChange(option) {
    const { draft } = this.state;
    const { value } = option.target;

    const removed = draft.values.includes(value);

    draft.values = removed ? draft.values.filter((val) => val !== value) : [...draft.values, value];
    draft.values = draft.values
      .filter((val, index) => draft.values.indexOf(val) === index);
    this.setState({
      draft,
    });
  }

  handleSelectorChange(selector) {
    if (SELECTORS.indexOf(selector) !== -1) {
      const { draft } = this.state;
      const { dataSet, externalDataSet } = this.props;
      let selectedValues = draft.values.map((value) => ({ value }));
      let selectorDataSet = [];

      switch (selector) {
        default:
        case SELECTOR_NONE:
          break;
        case SELECTOR_ALL:
          selectedValues = selectedValues.concat(dataSet);
          break;
        case SELECTOR_INTERSECTION: {
          selectorDataSet = externalDataSet.hpos.filter(isObservedPos)
            .map((ontology) => get(ontology, 'original.valueCodeableConcept.coding[0].code', undefined));
          const interSelectedValues = dataSet.filter((option) => {
            const hpoValue = option.value.match(HPO_REGEX).toString();
            return hpoValue ? (selectorDataSet.indexOf(hpoValue) !== -1) : false;
          });

          const isChecked = interSelectedValues.every((option) => selectedValues.find((val) => val.value === option.value));
          if (isChecked) {
            selectedValues = selectedValues.filter((value) => interSelectedValues
              .find((option) => option.value === value.value) == null);
          } else {
            selectedValues = selectedValues.concat(interSelectedValues);
          }
          break;
        }
        case SELECTOR_DIFFERENCE:
        {
          selectorDataSet = externalDataSet.hpos.filter(isObservedNeg)
            .map((ontology) => get(ontology, 'original.valueCodeableConcept.coding[0].code', undefined));
          const interSelectedValues = dataSet.filter((option) => {
            const hpoValue = option.value.match(HPO_REGEX).toString();
            return hpoValue ? (selectorDataSet.indexOf(hpoValue) !== -1) : false;
          });

          const isChecked = interSelectedValues.every((option) => selectedValues.find((val) => val.value === option.value));
          if (isChecked) {
            selectedValues = selectedValues.filter((value) => interSelectedValues
              .find((option) => option.value === value.value) == null);
          } else {
            selectedValues = selectedValues.concat(interSelectedValues);
          }
          break;
        }
      }

      draft.values = selectedValues.map((option) => option.value);
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

  loadMoreFacets(page) {
    const {
      allOptions,
      loadedOptions,
    } = this.state;

    const newlyLoadedOptions = allOptions.slice(
      loadedOptions.length,
      Math.min(allOptions.length, loadedOptions.length + page * 10),
    );

    this.setState({ currentFacetPage: page, loadedOptions: [...loadedOptions, ...newlyLoadedOptions] });
  }

  getEditor() {
    const { renderCustomDataSelector, externalDataSet } = this.props;
    const {
      draft, allOptions,
      loadedOptions,
    } = this.state;
    const { selector } = draft;
    const selectorAll = intl.get('screen.patientvariant.filter.specific.selector.all');
    const selectorNone = intl.get('screen.patientvariant.filter.specific.selector.none');
    const selectorIntersection = intl.get('screen.patientvariant.filter.specific.selector.intersection');
    const selectorDifference = intl.get('screen.patientvariant.filter.specific.selector.difference');

    pullAllBy(allOptions, [{ value: '' }], 'value');

    const loadedOptionsClone = loadedOptions.length ? [...loadedOptions] : allOptions.slice(0, Math.min(10, allOptions.length));

    const observedOptions = allOptions.filter((option) => {
      const code = option.value.match(HPO_REGEX).toString();
      return externalDataSet.hpos.find((hpo) => {
        const hpoCode = get(hpo, 'original.valueCodeableConcept.coding[0].code', null);
        return hpoCode === code;
      });
    });

    const renderOption = (option, isObservePos, isObserveNeg) => {
      const value = option.value.length < 40 ? option.value : `${option.value.substring(0, 37)} ...`;
      return {
        label: (
          <span className={styleFilter.checkboxValue}>
            <div className={styleFilter.valueInfo}>
              <Tooltip title={option.value}>
                { value }
              </Tooltip>
              { (isObservePos || isObserveNeg) && (
                <Badge color={isObservePos ? '#52c41a' : '#f5646c'} className={styleFilter.tag} />
              ) }
            </div>
            <Tag className={styleFilter.valueCount}>{ intl.get('components.query.count', { count: option.count }) }</Tag>
          </span>
        ),
        value: option.value,
      };
    };

    const selected = get(draft, 'values', []);
    const options = [];
    if (selected.length > 0) {
      observedOptions.forEach((option) => {
        if (selected.find((value) => value === option.value) != null) {
          const code = option.value.match(HPO_REGEX).toString();
          const marked = externalDataSet.hpos.find((hpo) => {
            const hpoCode = get(hpo, 'original.valueCodeableConcept.coding[0].code', undefined);
            return hpoCode === code;
          });

          const isObserved = marked.parsed.observed === HPO_POSITIVE_CODE;
          const isNotObserved = marked.parsed.observed === HPO_NEGATIVE_CODE;

          options.push(renderOption(option, isObserved, isNotObserved));
        }
      });
    }

    for (let i = 0; i < loadedOptionsClone.length; i += 1) {
      const option = loadedOptionsClone[i];

      if (options.find((opt) => opt.value === option.value) != null) {
        continue;
      }

      // const observedPos = externalDataSet.hpos.filter((ontology) => ontology.parsed.observed === HPO_POSITIVE_CODE);
      // const observedNeg = externalDataSet.hpos.filter((ontology) => ontology.parsed.observed === HPO_NEGATIVE_CODE);
      // const code = option.value.match(HPO_REGEX).toString();
      // const isObservePos = find(observedPos, { code });
      // const isObserveNeg = find(observedNeg, { code });

      options.push(renderOption(option, undefined, undefined));
    }

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
              <Checkbox.Group
                option={options}
                className={`${styleFilter.checkboxGroup} `}
                value={draft.values}
              >
                <div
                  className="scrollFilter"
                  ref={(ref) => { this.scrollParentRef = ref; }}
                >
                  <InfiniteScroll
                    pageStart={0}
                    loadMore={this.loadMoreFacets}
                    hasMore={allOptions.length > loadedOptions.length}
                    loader={<div className="loader" key={0}>Loading ...</div>}
                    useWindow={false}
                    getScrollParent={() => this.scrollParentRef}
                  >
                    { options.map((option) => (
                      <Row>
                        <Col className="checkboxLine">
                          <Checkbox
                            onChange={this.handleSelectionChange}
                            className={draft.values.includes(option.value) ? `${styleFilter.check} ${styleFilter.checkboxLabel}` : `${styleFilter.checkboxLabel}`}
                            value={option.value}
                          >{ option.label }
                          </Checkbox>
                        </Col>
                      </Row>
                    )) }
                  </InfiniteScroll>
                </div>
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
        draft={draft}
        config={config}
        type={FILTER_TYPE_SPECIFIC}
        editor={this.getEditor()}
        searchable
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
      { values.map((value) => (
        <>
          <Button onClick={() => onChangeCallback(value.value)} className={value.value}>{ value.label }</Button>
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
