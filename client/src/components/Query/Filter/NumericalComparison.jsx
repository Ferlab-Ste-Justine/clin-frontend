import React from 'react';
import {
  Row, Col, InputNumber, Slider,
} from 'antd';
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import styleFilter from '../styles/filter.module.scss';
import Filter, { FILTER_TYPE_NUMERICAL_COMPARISON } from './index';


export const FILTER_COMPARATOR_TYPE_GREATER_THAN = '>';
export const FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL = '>=';
export const FILTER_COMPARATOR_TYPE_LOWER_THAN = '<';
export const FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL = '<=';
export const FILTER_COMPARATOR_TYPE_DEFAULT = FILTER_COMPARATOR_TYPE_GREATER_THAN;

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
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);

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
    const { draft } = this.state;
    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: draft.values ? (
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
        </>
      ) : null,
    };
  }

  handleComparatorChange(e) {
    const { draft } = this.state;
    draft.values[0].comparator = e.target.value;
    this.setState({ draft });
  }

  handleValueChange(value) {
    const { draft } = this.state;
    draft.values[0].value = value;
    this.setState({ draft });
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
      />
    );
  }
}

NumericalComparisonFilter.propTypes = {
  data: PropTypes.shape({}).isRequired,
};

export default NumericalComparisonFilter;
