import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Checkbox, Tooltip, Tag,
} from 'antd';
import {
  cloneDeep, orderBy, filter, pullAllBy, pull,
} from 'lodash';

import Filter, { FILTER_TYPE_COMPOSITE } from './index';
import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
  FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
  OPERATOR_TYPE_ELEMENT_OF,
  OPERATOR_TYPE_EQUAL,
  OPERATOR_TYPE_UNION,
  IconForOperator,
} from '../Operator';

import { roundDown, roundUp } from '../helpers/rounding';

import style from '../styles/term.module.scss';
import styleFilter from '../styles/filter.module.scss';

import NumericalComparisonWidget from './widgets/NumericalComparisonWidget';
import Interval from './widgets/Interval';

const SCORE_SELECTION = '_score_';

const VALUE_TICK = 0.01;
const VALUE_DECIMALS = 2;

const hasNoComparator = v => !v.comparator;

class CompositeFilter extends React.Component {
  /* @NOTE SQON Struct Sample
  {
      type: 'composite,
      data: {
        values: [
            { value: 'T' }
        ]
      }
  }
  */
  static qualityCompositionStructFromArgs(values) {
    return { values };
  }

  /* @NOTE SQON Struct Sample
  {
      type: 'composite,
      data: {
        values: [
            { comparator: '<=', value: 0 }
        ]
      }
  }
  */
  static numericalCompositionStructFromArgs(comparator, values = [
    { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value: 0 },
    { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value: 0 },
  ]) {
    return {
      comparator,
      values: values.filter(term => !term.markedForDeletion),
    };
  }

  static structFromArgs(id, composition = {}, values = [
    { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value: 0 },
    { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value: 0 },
  ]) {
    return {
      id,
      values,
      type: FILTER_TYPE_COMPOSITE,
      ...composition,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      numericalComparisonActive: true,
      selectionActive: true,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this);
    this.handleQualityChange = this.handleQualityChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.updateScoreRange = this.updateScoreRange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.getPillContent = this.getPillContent.bind(this);
    this.getPillOuterIcon = this.getPillOuterIcon.bind(this);
    this.handleReset = this.handleReset.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet } = props;
    this.state.draft = cloneDeep(data);

    const selection = data.values ? cloneDeep(data.values.filter(hasNoComparator)).map(v => v.value) : [];

    const allOptions = orderBy(cloneDeep(dataSet), ['count'], ['desc']);
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
  }

  getMin() {
    const { data, facets } = this.props;
    return roundUp(VALUE_DECIMALS)(facets[`${data.id}_min`][0].value);
  }

  getMax() {
    const { data, facets } = this.props;
    return roundDown(VALUE_DECIMALS)(facets[`${data.id}_max`][0].value);
  }

  getEditor() {
    const { dataSet, facets, data } = this.props;
    const {
      selection,
      draft,
      numericalComparisonActive,
      selectionActive,
    } = this.state;

    const options = dataSet.map((option) => {
      const valueText = option.value.length < 60 ? option.value : `${option.value.substring(0, 55)} ...`;
      return {
        label: (
          <span className={styleFilter.checkboxValue}>
            <Tooltip title={option.value}>
              {valueText}
            </Tooltip>
            <Tag className={styleFilter.valueCount}>{option.count}</Tag>
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
          {facets && (
          <NumericalComparisonWidget
            min={this.getMin()}
            max={this.getMax()}
            tick={VALUE_TICK}
            decimals={VALUE_DECIMALS}
            draft={cloneDeep(draft)}
            savedData={data}
            updateDraft={this.updateScoreRange}
            disabled={!numericalComparisonActive}
          />
          )}

          <Row>
            <Col span={24}>
              <Checkbox.Group onChange={this.handleSelectionChange} option={options.map(option => option.value)} className={`${styleFilter.checkboxGroup} `} value={selection}>
                { options.map(option => (
                  <Row>
                    <Col>
                      <Checkbox
                        className={selection.includes(option.value) ? `${styleFilter.check} ${styleFilter.checkboxLabel}` : `${styleFilter.checkboxLabel}`}
                        value={option.value}
                        disabled={!selectionActive}
                      >
                        { option.label }
                      </Checkbox>
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

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, comparator, values } = draft;

    const trimmedValues = values.filter(v => !v.markedForDeletion);

    const composition = comparator
      ? CompositeFilter.numericalCompositionStructFromArgs(comparator, trimmedValues)
      : CompositeFilter.qualityCompositionStructFromArgs(trimmedValues);

    return CompositeFilter.structFromArgs(id, composition);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, comparator, values } = data;

    const trimmedValues = values.filter(v => !v.markedForDeletion);
    const composition = comparator
      ? CompositeFilter.numericalCompositionStructFromArgs(comparator, trimmedValues)
      : CompositeFilter.qualityCompositionStructFromArgs(trimmedValues);

    return CompositeFilter.structFromArgs(id, composition);
  }

  getEditorLabels() {
    const { data } = this.props;

    const {
      comparator,
    } = data.values[0];

    const labels = {
      action: comparator || 'selection',
      targets: data.values.map(v => v.value),
    };

    return labels;
  }

  getPillContent() {
    const {
      data,
    } = this.props;

    const { values } = data;

    if (values[0].comparator) {
      return (
        <Interval
          terms={values}
        />
      );
    }

    const contents = values.map((target, index) => (
      <div key={target}>
        {index !== 0 ? IconForOperator(OPERATOR_TYPE_UNION) : null}{target.value}
      </div>
    ));
    return (
      <div className={style.termList}>
        {contents}
      </div>
    );
  }

  getPillOuterIcon() {
    const { data } = this.props;
    const { values } = data;

    let operator = null;
    const { comparator } = values[0];
    if (comparator) {
      switch (values.length) {
        case 1:
          operator = values[0].comparator;
          break;
        case 2:
          operator = OPERATOR_TYPE_ELEMENT_OF;
          break;
        default:
          operator = OPERATOR_TYPE_ELEMENT_OF;
          break;
      }
    } else {
      operator = OPERATOR_TYPE_EQUAL;
    }

    return IconForOperator(operator);
  }

  updateScoreRange(scoreRangeDraft) {
    this.setState({ draft: scoreRangeDraft, selectionActive: false });
  }

  handleReset() {
    const { draft } = this.state;

    const newDraft = { ...draft };

    newDraft.values = [
      { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value: 0 },
      { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value: 0 },
    ];

    this.setState({
      draft: newDraft, selection: [], selectionActive: true, numericalComparisonActive: true,
    });
  }

  handleComparatorChange(comparator) {
    const { draft } = this.state;
    const draftClone = cloneDeep(draft);

    draftClone.comparator = comparator;
    this.setState({ draft: draftClone });
  }

  handleSelectionChange(values) {
    const {
      selection, page, size, draft,
    } = this.state;
    const { dataSet } = this.props;
    const allOptions = orderBy(cloneDeep(dataSet), ['count'], ['desc']);
    const minValue = size * (page - 1);
    const maxValue = size * page;
    const options = allOptions.slice(minValue, maxValue);

    options.forEach((x) => {
      if (selection.includes(x.value)) {
        if (!values.includes(x.value)) { pull(selection, x.value); }
      } else if (values.includes(x.value)) { selection.push(x.value); }
    });

    draft.values = selection.filter(s => !s.comparator).map(v => ({ value: v }));
    this.setState({
      selection,
      draft,
      numericalComparisonActive: false,
    });
  }

  handleQualityChange(quality) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    if (quality !== SCORE_SELECTION) {
      delete clone.comparator;
    } else if (!clone.comparator) {
      clone.comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL;
      quality = 0;
    }

    clone.value = quality;
    this.setState({ draft: clone });
  }

  handleFilterChange(filterArg) {
    const {
      draft,
    } = this.state;

    const {
      onEditCallback,
    } = this.props;

    const draftClone = cloneDeep(draft);
    draftClone.values = draftClone.values.filter(term => !term.markedForDeletion);

    const vals = draftClone.values;

    if (!vals.length) return;
    if (vals.length === 2 && vals[0].value === vals[1].value) return;

    this.setState({ draft: draftClone }, () => {
      onEditCallback(filterArg);
    });
  }

  render() {
    const {
      draft,
    } = this.state;

    return (
      <Filter
        {...this.props}
        onEditCallback={this.handleFilterChange}
        draft={draft}
        type={FILTER_TYPE_COMPOSITE}
        editor={this.getEditor()}
        resettable
        getPillContent={this.getPillContent}
        getPillOuterIcon={this.getPillOuterIcon}
        onReset={this.handleReset}
      />
    );
  }
}

CompositeFilter.propTypes = {
  onEditCallback: PropTypes.func.isRequired,
  facets: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};

export default CompositeFilter;
