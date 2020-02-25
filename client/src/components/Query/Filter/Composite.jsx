import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, InputNumber, Slider, Checkbox, Tooltip, Tag,
} from 'antd';
import {
  cloneDeep, orderBy, filter, pullAllBy, pull,
} from 'lodash';

import Filter, { FILTER_TYPE_COMPOSITE } from './index';
import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN,
} from './NumericalComparison';
import styleFilter from '../styles/filter.module.scss';

const SCORE_SELECTION = '_score_';


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
  static qualityCompositionStructFromArgs(value) {
    return { value };
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
  static numericalCompositionStructFromArgs(comparator, value) {
    return {
      comparator,
      value,
    };
  }

  static structFromArgs(id, composition = {}) {
    return {
      id,
      type: FILTER_TYPE_COMPOSITE,
      ...composition,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this);
    this.handleQualityChange = this.handleQualityChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);

    // @NOTE Initialize Component State
    const { data, dataSet } = props;
    this.state.draft = cloneDeep(data);
    const selection = data.values ? cloneDeep(data.values) : [];
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

  getEditor() {
    const { dataSet } = this.props;
    const { selection } = this.state;

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
          <Row className={styleFilter.rangeSlider}>
            <Slider range defaultValue={[20, 50]} />
          </Row>
          <Row type="flex" justify="space-between" className={styleFilter.rangeInput}>
            <Col>
              <InputNumber
                step={0.1}
                defaultValue={0.0}
                onChange={this.onChange}
              />
            </Col>
            <Col>
              <InputNumber
                step={0.1}
                defaultValue={0.0}
                onChange={this.onChange}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Checkbox.Group onChange={this.handleSelectionChange} option={options.map(option => option.value)} className={`${styleFilter.checkboxGroup} `} value={selection}>
                { options.map(option => (
                  <Row>
                    <Col>
                      <Checkbox className={selection.includes(option.value) ? `${styleFilter.check} ${styleFilter.checkboxLabel}` : `${styleFilter.checkboxLabel}`} value={option.value}>{ option.label }</Checkbox>
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
    const { id, comparator, value } = draft;
    const composition = comparator
      ? CompositeFilter.numericalCompositionStructFromArgs(comparator, value)
      : CompositeFilter.qualityCompositionStructFromArgs(value);

    return CompositeFilter.structFromArgs(id, composition);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, comparator, value } = data;
    const composition = comparator
      ? CompositeFilter.numericalCompositionStructFromArgs(comparator, value)
      : CompositeFilter.qualityCompositionStructFromArgs(value);

    return CompositeFilter.structFromArgs(id, composition);
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: data.comparator,
      targets: [data.value],
    };
  }

  handleComparatorChange(comparator) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    clone.comparator = comparator;
    this.setState({ draft: clone });
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
    draft.values = selection;
    this.setState({
      selection,
      draft,
    });
  }

  handleScoreChange(score) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    clone.value = score;
    this.setState({ draft: clone });
  }

  handleQualityChange(quality) {
    const { draft } = this.state;
    const clone = cloneDeep(draft);

    if (quality !== SCORE_SELECTION) {
      delete clone.comparator;
    } else if (!clone.comparator) {
      clone.comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN;
      quality = 0;
    }

    clone.value = quality;
    this.setState({ draft: clone });
  }

  render() {
    const {
      draft,
    } = this.state;

    return (
      <Filter
        {...this.props}
        draft={draft}
        type={FILTER_TYPE_COMPOSITE}
        editor={this.getEditor()}
        resettable
      />
    );
  }
}

CompositeFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};

export default CompositeFilter;
