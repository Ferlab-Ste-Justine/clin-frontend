import React from 'react';

import {
  Row, Col, InputNumber, Slider,
} from 'antd';

import PropTypes from 'prop-types';
import styleFilter from '../../styles/filter.module.scss';
import { calculateTitleWidth } from '../../helpers/query';

import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
  FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
} from '../../Operator';

import { roundDown, roundUp } from '../../helpers/rounding';

class NumericalComparisonWidget extends React.Component {
  constructor(props) {
    super(props);

    this.handleMinValueChange = this.handleMinValueChange.bind(this);
    this.handleMaxValueChange = this.handleMaxValueChange.bind(this);
    this.handleSliderValueChange = this.handleSliderValueChange.bind(this);
    this.cachedValues = props.cachedValues;
  }

  componentWillUnmount() {
    this.clearCache();
  }

  setHighValue(value) {
    const { decimals, draft } = this.props;
    const { values } = draft;

    const comparator = FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL;
    let valueObj = null;
    values.forEach((term) => {
      if (term.comparator === comparator) {
        term.value = value;
        valueObj = term;
      }
    });

    if (!valueObj) {
      valueObj = { comparator, value: roundUp(decimals)(value) };
      values.push(valueObj);
    }

    this.cacheValueObj(valueObj);
  }

  setLowValue(value) {
    const { draft } = this.props;
    const { values } = draft;

    const comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL;
    let valueObj = null;
    values.forEach((term) => {
      if (term.comparator === comparator) {
        term.value = value;
        valueObj = term;
      }
    });

    if (!valueObj) {
      valueObj = { comparator, value: roundDown(value) };
      values.unshift(valueObj);
    }

    this.cacheValueObj(valueObj);
  }

  clearCache() {
    this.cachedValues.length = 0;
  }

  cacheValueObj(valueObj) {
    const values = this.cachedValues;
    const { comparator } = valueObj;

    let found = false;
    values.forEach((vo) => {
      if (vo.comparator === valueObj.comparator) {
        vo.value = valueObj.value;
        found = true;
      }
    });

    if (!found) {
      switch (comparator) {
        case FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL:
          values.unshift(valueObj);
          break;
        case FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL:
          values.push(valueObj);
          break;
        default:
          break;
      }
    }
  }

  lowValueObject() {
    const comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL;
    return this.findValueObject(comparator);
  }

  highValueObject() {
    const comparator = FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL;
    return this.findValueObject(comparator);
  }

  lowValue() {
    const lowVO = this.lowValueObject();

    const {
      min,
    } = this.props;

    if (lowVO) {
      if (lowVO.value === 0) {
        lowVO.value = min;
      }
      return lowVO.value;
    }

    return min;
  }

  highValue() {
    const highVO = this.highValueObject();

    const {
      max,
    } = this.props;

    if (highVO) {
      if (highVO.value === 0) {
        highVO.value = max;
      }
      return highVO.value;
    }

    return max;
  }

  findValueObject(comparator) {
    const { draft } = this.props;
    const { values } = draft;

    let valueObject = null;
    valueObject = values.find((vo) => vo.comparator === comparator);

    if (!valueObject) {
      valueObject = this.cachedValues.find((vo) => vo.comparator === comparator);
    }

    return valueObject;
  }

  markLowValueObject(mark) {
    const comparator = FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL;
    this.markValueObject(comparator, mark);
  }

  markHighValueObject(mark) {
    const comparator = FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL;
    this.markValueObject(comparator, mark);
  }

  markValueObject(comparator, mark) {
    const { draft } = this.props;

    const markVO = (list) => {
      list.forEach((vo) => {
        if (vo.comparator === comparator) {
          if (mark) {
            vo.markedForDeletion = true;
          } else {
            delete vo.markedForDeletion;
          }
        }
      });
    };

    markVO(draft.values);
    markVO(this.cachedValues);
  }

  updateDraft() {
    const {
      draft, updateDraft, min, max,
    } = this.props;

    if (this.lowValueObject() && this.lowValueObject().value === min) {
      this.markLowValueObject(true);
    } else {
      this.markLowValueObject(false);
    }

    if (this.highValueObject() && this.highValueObject().value === max) {
      this.markHighValueObject(true);
    } else {
      this.markHighValueObject(false);
    }

    updateDraft(draft);
  }

  sanitizeDraft() {
    const { draft } = this.props;
    draft.values = draft.values.filter((v) => !!v.comparator);
  }

  handleSliderValueChange(range) {
    this.sanitizeDraft();
    this.setLowValue(range[0]);
    this.setHighValue(range[1]);
    this.updateDraft();
  }

  handleMinValueChange(value) {
    this.sanitizeDraft();
    this.setLowValue(value);
    this.updateDraft();
  }

  handleMaxValueChange(value) {
    this.sanitizeDraft();
    this.setHighValue(value);
    this.updateDraft();
  }

  render() {
    const {
      min,
      max,
      tick,
      disabled,
    } = this.props;
    const widthMin = calculateTitleWidth(min.toFixed(2).toString());
    const widthMax = calculateTitleWidth(max.toFixed(2).toString());

    const currentLow = this.lowValue();
    const currentHigh = this.highValue();

    return (
      <>
        <Row className={styleFilter.rangeSlider}>
          <Slider
            range
            defaultValue={[currentLow, currentHigh]}
            value={[currentLow, currentHigh]}
            min={min}
            max={max}
            step={tick}
            onChange={this.handleSliderValueChange}
            disabled={disabled}
          />
        </Row>
        <Row className={`flex-row ${styleFilter.rangeInput}`}>
          <Col>
            <InputNumber
              step={tick}
              value={currentLow}
              min={min}
              max={currentHigh}
              defaultValue={currentLow}
              onChange={this.handleMinValueChange}
              disabled={disabled}
              style={{ width: `calc(38px + ${widthMin}ch)` }}
              onFocus={(e) => { e.target.select(); }}
            />
          </Col>
          <Col className="input-right">
            <InputNumber
              step={tick}
              value={currentHigh}
              min={currentLow}
              max={max}
              defaultValue={currentHigh}
              onChange={this.handleMaxValueChange}
              disabled={disabled}
              style={{ width: `calc(38px + ${widthMax}ch)` }}
              onFocus={(e) => { e.target.select(); }}
            />
          </Col>
        </Row>
      </>
    );
  }
}

NumericalComparisonWidget.defaultProps = {
  tick: 0.01,
  decimals: 2,
  disabled: false,
};

NumericalComparisonWidget.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  tick: PropTypes.number,
  decimals: PropTypes.number,
  savedData: PropTypes.shape({}).isRequired,
  draft: PropTypes.shape({}).isRequired,
  cachedValues: PropTypes.array.isRequired,
  updateDraft: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default NumericalComparisonWidget;
