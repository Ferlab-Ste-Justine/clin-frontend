/* eslint-disable react/no-unused-state */
import React from 'react';
import {
  Row, Col, InputNumber, Slider,
} from 'antd';

// import { Icon } from 'react-icons-kit';
// import { ic_refresh } from 'react-icons-kit/md/ic_refresh';

import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';

import Filter, { FILTER_TYPE_NUMERICAL_COMPARISON } from './index';
import styleFilter from '../styles/filter.module.scss';

export const FILTER_COMPARATOR_TYPE_GREATER_THAN = '>';
export const FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL = '>=';
export const FILTER_COMPARATOR_TYPE_LOWER_THAN = '<';
export const FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL = '<=';
export const FILTER_COMPARATOR_TYPE_DEFAULT = FILTER_COMPARATOR_TYPE_GREATER_THAN;

const roundDown2 = value => Math.floor(100 * value) / 100.0;

class NumericalComparisonFilter extends React.Component {
  /* @NOTE SQON Struct Sample
  {
    type: 'numcomparison,
    data: {
        id: 'phylop'
        values: [
            {
                comparator: '<',
                value: 10
            }
            {
                comparator: '>=',
                value: 0
            }
        ]
    }
  }
  */
  static structFromArgs(id, values = [{ comparator: FILTER_COMPARATOR_TYPE_DEFAULT, value: 0 }]) {
    return {
      id,
      type: FILTER_TYPE_NUMERICAL_COMPARISON,
      values,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      sliderDisabled: false,
      inputDisabled: false,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSliderChange = this.handleSliderChange.bind(this);
    this.handleMinValueChange = this.handleMinValueChange.bind(this);
    this.handleMaxValueChange = this.handleMaxValueChange.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
  }

  getEditorDraftInstruction() {
    const { draft } = this.state;
    const { id, values } = draft;

    return NumericalComparisonFilter.structFromArgs(id, values);
  }

  getEditorInstruction() {
    const { data } = this.props;
    const { id, values } = data;

    return NumericalComparisonFilter.structFromArgs(id, values);
  }

  getEditorLabels() {
    const { data } = this.props;
    return {
      action: data.values[0].comparator,
      targets: [data.values[0].value],
    };
  }

  getEditor() {
    const { draft, sliderDisabled, inputDisabled } = this.state;
    const { facets, data } = this.props;

    const min = roundDown2(facets[`${data.id}_min`][0].value);
    const max = roundDown2(facets[`${data.id}_max`][0].value);

    // If older data coming from backend, add a second value element
    if (data.values.length < 2) {
      data.values.push({ comparator: '<=', value: max });
    }

    const defaultMin = data && data.values.length ? data.values[0].value : min;
    const defaultMax = data && data.values.length ? data.values[1].value : max;

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: draft && draft.values ? (
        <>
          <Row className={styleFilter.rangeSlider}>
            <Slider
              range
              defaultValue={[defaultMin, defaultMax]}
              min={min}
              max={max}
              step={0.01}
              disabled={sliderDisabled}
              onChange={this.handleSliderChange}
            />
          </Row>
          <Row type="flex" justify="space-between" className={styleFilter.rangeInput}>
            <Col>
              <InputNumber
                step={0.01}
                min={min}
                defaultValue={defaultMin}
                onChange={this.handleMinValueChange}
                disabled={inputDisabled}
              />
            </Col>
            <Col>
              <InputNumber
                step={0.01}
                max={max}
                defaultValue={defaultMax}
                onChange={this.handleMaxValueChange}
                disabled={inputDisabled}
              />
            </Col>
          </Row>
          {/* <br /> */}
        </>
      ) : null,
    };
  }

  handleReset() {
    this.setState({ sliderDisabled: false, inputDisabled: false });
  }

  handleMinValueChange(value) {
    const { draft } = this.state;
    draft.values[0] = { comparator: '>=', value: roundDown2(value) };
    this.setState({ draft, sliderDisabled: true });
  }

  handleMaxValueChange(value) {
    const { draft } = this.state;
    draft.values[1] = { comparator: '<=', value: roundDown2(value) };
    this.setState({ draft, sliderDisabled: true });
  }

  handleSliderChange(range) {
    const { draft } = this.state;
    draft.values[0] = { comparator: '>=', value: roundDown2(range[0]) };
    draft.values[1] = { comparator: '<=', value: roundDown2(range[1]) };

    this.setState({ draft, inputDisabled: true });
  }

  render() {
    const {
      draft,
    } = this.state;

    return (
      <Filter
        {...this.props}
        draft={draft}
        type={FILTER_TYPE_NUMERICAL_COMPARISON}
        editor={this.getEditor()}
        resettable
        onReset={this.handleReset}
      />
    );
  }
}

NumericalComparisonFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  facets: PropTypes.shape({}).isRequired,
};

export default NumericalComparisonFilter;
