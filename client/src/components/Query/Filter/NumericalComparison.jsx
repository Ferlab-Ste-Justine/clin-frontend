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
  static structFromArgs(id, values = [
    { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value: 0 },
    { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value: 0 },
  ]) {
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
      currentLow: -1,
      currentHigh: -1,
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
    const {
      draft, sliderDisabled, inputDisabled, currentLow, currentHigh,
    } = this.state;
    const { data } = this.props;

    const min = this.minValue();
    const max = this.maxValue();

    let defaultLow = 0;
    if (this.areValuesReceived()) {
      defaultLow = data.values[0].value;
    } else if (this.isMinSet()) {
      defaultLow = currentLow;
    } else {
      defaultLow = min;
    }

    let defaultHigh = 0;
    if (this.areValuesReceived()) {
      defaultHigh = data.values[1].value;
    } else if (this.isMaxSet()) {
      defaultHigh = currentHigh;
    } else {
      defaultHigh = max;
    }

    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: draft && draft.values && draft.values.length > 1 ? (
        <>
          <Row className={styleFilter.rangeSlider}>
            <Slider
              range
              defaultValue={[defaultLow, defaultHigh]}
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
                value={this.lowInputValue()}
                min={min}
                max={this.highInputValue()}
                defaultValue={defaultLow}
                onChange={this.handleMinValueChange}
                disabled={inputDisabled}
              />
            </Col>
            <Col>
              <InputNumber
                step={0.01}
                value={this.highInputValue()}
                min={this.lowInputValue()}
                max={max}
                defaultValue={defaultHigh}
                onChange={this.handleMaxValueChange}
                disabled={inputDisabled}
              />
            </Col>
          </Row>
        </>
      ) : null,
    };
  }

  minValue() {
    const { facets, data } = this.props;
    const min = roundDown2(facets[`${data.id}_min`][0].value);
    return min;
  }

  maxValue() {
    const { facets, data } = this.props;
    const max = roundDown2(facets[`${data.id}_max`][0].value);
    return max;
  }

  lowValueReceived() {
    const { data } = this.props;
    const { values } = data;
    return values[0].value;
  }

  highValueReceived() {
    const { data } = this.props;
    const { values } = data;
    return values[1].value;
  }

  lowInputValue() {
    const { draft } = this.state;
    const { values } = draft;
    const { value } = values[0];

    let ret = 0;
    if (this.isMinSet()) {
      ret = value;
    } else if (this.areValuesReceived()) {
      ret = this.lowValueReceived();
    } else {
      ret = this.minValue();
    }

    return ret;
  }

  highInputValue() {
    const { draft } = this.state;
    const { values } = draft;
    const { value } = values[1];

    let ret = 0;
    if (this.isMaxSet()) {
      ret = value;
    } else if (this.areValuesReceived()) {
      ret = this.highValueReceived();
    } else {
      ret = this.maxValue();
    }

    return ret;
  }

  areValuesReceived() {
    const { data } = this.props;
    return data.values[0].value !== 0 || data.values[0].value !== 0;
  }

  isMinSet() {
    const { currentLow } = this.state;
    return currentLow > -1;
  }

  isMaxSet() {
    const { currentHigh } = this.state;
    return currentHigh > -1;
  }

  addMissingValue() {
    const { facets, data } = this.props;

    const max = roundDown2(facets[`${data.id}_max`][0].value);

    // If older data coming from backend, add a second value element
    if (data.values.length < 2) {
      data.values.push({ comparator: '<=', value: max });
    }
  }

  handleReset() {
    this.setState({ sliderDisabled: false, inputDisabled: false });
  }

  handleMinValueChange(value) {
    const newValue = value;
    const { draft } = this.state;
    let { currentLow } = this.state;

    draft.values[0] = { comparator: '>=', value: newValue };
    currentLow = draft.values[0].value;

    this.setState({ draft, sliderDisabled: true, currentLow });
  }

  handleMaxValueChange(value) {
    const newValue = value;
    const { draft } = this.state;
    let { currentHigh } = this.state;

    draft.values[1] = { comparator: '<=', value: newValue };
    currentHigh = draft.values[1].value;

    this.setState({ draft, sliderDisabled: true, currentHigh });
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

// NumericalComparisonFilter.upgradeData = (data, facets) => {
//   const max = roundDown2(facets[`${data.id}_max`][0].value);

//   if (data.values.length < 2) {
//     data.values.push({ comparator: '<=', value: max });
//   }

//   return data;
// };

NumericalComparisonFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
  facets: PropTypes.shape({}).isRequired,
};

export default NumericalComparisonFilter;
