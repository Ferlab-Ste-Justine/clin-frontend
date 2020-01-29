/* eslint-disable */
import React from 'react';
import {
  Row, Col, Radio, InputNumber,
} from 'antd';
import {
  cloneDeep, orderBy, pullAllBy, filter,
} from 'lodash';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';

import Filter, { FILTER_TYPE_NUMERICAL_COMPARISON } from './index';


export const FILTER_COMPARATOR_TYPE_GREATER_THAN = '>';
export const FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL = '>=';
export const FILTER_COMPARATOR_TYPE_LOWER_THAN = '<';
export const FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL = '<=';
export const FILTER_COMPARATOR_TYPE_DEFAULT = FILTER_COMPARATOR_TYPE_GREATER_THAN

class NumericalComparisonFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draft: null
    };
    this.getEditor = this.getEditor.bind(this);
    this.getEditorLabels = this.getEditorLabels.bind(this);
    this.getEditorDraftInstruction = this.getEditorDraftInstruction.bind(this);
    this.getEditorInstruction = this.getEditorInstruction.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this)
    this.handleValueChange=this.handleValueChange.bind(this)

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
  }

  static structFromArgs(id, values = [{ comparator: FILTER_COMPARATOR_TYPE_DEFAULT, value: 0 }]) {
    return {
      id,
      type: FILTER_TYPE_NUMERICAL_COMPARISON,
      values,
    }
  }

  getEditor() {
    const { draft } = this.state;
    const typeGt = intl.get('screen.patientvariant.filter.comparator.gt');
    const typeGte = intl.get('screen.patientvariant.filter.comparator.gte');
    const typeLt = intl.get('screen.patientvariant.filter.comparator.lt');
    const typeLte = intl.get('screen.patientvariant.filter.comparator.lte');
    const valueText = intl.get('screen.patientvariant.filter.numerical.value');
    return {
      getLabels: this.getEditorLabels,
      getDraftInstruction: this.getEditorDraftInstruction,
      getInstruction: this.getEditorInstruction,
      contents: draft.values ? draft.values.map((datum, index) => (
        <>
          <Row>
            <Col span={24}>
              <Radio.Group size="small" type="primary" dataindex={index} value={datum.comparator} onChange={this.handleComparatorChange}>
                <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_COMPARATOR_TYPE_GREATER_THAN}>{typeGt}</Radio.Button>
                <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_COMPARATOR_TYPE_GREATER_THAN_OR_EQUAL}>{typeGte}</Radio.Button>
                <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_COMPARATOR_TYPE_LOWER_THAN}>{typeLt}</Radio.Button>
                <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_COMPARATOR_TYPE_LOWER_THAN_OR_EQUAL}>{typeLte}</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
          <br />
          <Row type="flex" align="middle">
            <Col>
              {valueText}
            </Col>
            <Col>
              <InputNumber onChange={this.handleValueChange} defaultValue={datum.value} step={1} />
            </Col>
          </Row>
        </>
      )) : null
    }
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
      targets: [ data.values[0].value ]
    }
  }

  handleComparatorChange(e){
    const { draft } = this.state;
    draft.values[0].comparator = e.target.value
    this.setState({ draft });
  }

  handleValueChange(value){
    const { draft } = this.state;
    draft.values[0].value = value;
    this.setState({ draft });
  }

  render() {
    return (
      <Filter
        {...this.props}
        type={FILTER_TYPE_NUMERICAL_COMPARISON}
        editor={this.getEditor()}
      />
    );
  }
}

NumericalComparisonFilter.propTypes = {
  data: PropTypes.shape({}).isRequired
};

// NumericalComparisonFilter.defaultProps = {};

export default NumericalComparisonFilter;
