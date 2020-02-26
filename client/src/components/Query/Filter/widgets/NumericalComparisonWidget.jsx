import React from 'react';
import {
  Row, Col, InputNumber, Slider,
} from 'antd';

import PropTypes from 'prop-types';
import styleFilter from '../../styles/filter.module.scss';

import {
  FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL,
  FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL,
} from '../../Operator';

class NumericalComparisonWidget extends React.Component {
  constructor(props) {
    super(props);

    this.handleMinValueChange = this.handleMinValueChange.bind(this);
    this.handleMaxValueChange = this.handleMaxValueChange.bind(this);
    this.handleSliderValueChange = this.handleSliderValueChange.bind(this);
  }

  handleMinValueChange(value) {
    const { draft, updateDraft } = this.props;

    const newDraft = { ...draft };
    newDraft.values[0] = { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value };

    updateDraft(newDraft);
  }

  handleMaxValueChange(value) {
    const { draft, updateDraft } = this.props;

    const newDraft = { ...draft };
    newDraft.values[1] = { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value };

    updateDraft(newDraft);
  }

  handleSliderValueChange(range) {
    const {
      draft, updateDraft, rounding,
    } = this.props;

    const newDraft = { ...draft };
    newDraft.values[0] = { comparator: FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL, value: rounding(range[0]) };
    newDraft.values[1] = { comparator: FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL, value: rounding(range[1]) };

    updateDraft(newDraft);
  }

  render() {
    const {
      min,
      max,
      draft,
    } = this.props;

    let currentLow = draft.values[0].value;
    let currentHigh = draft.values[1].value;

    if (currentLow === 0 && currentHigh === 0) {
      currentLow = min;
      currentHigh = max;
    }

    return (
      <>
        <Row className={styleFilter.rangeSlider}>
          <Slider
            range
            defaultValue={[currentLow, currentHigh]}
            value={[currentLow, currentHigh]}
            min={min}
            max={max}
            step={0.01}
            onChange={this.handleSliderValueChange}
          />
        </Row>
        <Row type="flex" justify="space-between" className={styleFilter.rangeInput}>
          <Col>
            <InputNumber
              step={0.01}
              value={currentLow}
              min={min}
              max={currentHigh}
              defaultValue={currentLow}
              onChange={this.handleMinValueChange}
            />
          </Col>
          <Col>
            <InputNumber
              step={0.01}
              value={currentHigh}
              min={currentLow}
              max={max}
              defaultValue={currentHigh}
              onChange={this.handleMaxValueChange}
            />
          </Col>
        </Row>
      </>
    );
  }
}

NumericalComparisonWidget.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  draft: PropTypes.shape({}).isRequired,
  updateDraft: PropTypes.func.isRequired,
  rounding: PropTypes.func.isRequired,
};

export default NumericalComparisonWidget;
