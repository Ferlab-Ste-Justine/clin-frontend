/* eslint-disable */
import React from 'react';
import {
  Typography, Row, Col, Radio, InputNumber,
} from 'antd';
import {
  cloneDeep, orderBy, pullAllBy, filter,
} from 'lodash';
import PropTypes from 'prop-types';
import Filter from './index';
import {FILTER_TYPE_NUMERICAL_COMPARISON} from './index';

export const FILTER_OPERAND_TYPE_GREATER_THAN = '>';
export const FILTER_OPERAND_TYPE_GREATER_THAN_OR_EQUAL = '>=';
export const FILTER_OPERAND_TYPE_LOWER_THAN = '<';
export const FILTER_OPERAND_TYPE_LOWER_THAN_OR_EQUAL = '<=';

class NumericalComparisonFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      draft: null,
      selection: [],
      size: null,
      page: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.getPopoverContent = this.getPopoverContent.bind(this);
    this.getPopoverLegend = this.getPopoverLegend.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this)
    this.handleValueChange=this.handleValueChange.bind(this)

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;
  }

  componentDidMount() {
    const { dataSet } = this.props;
    const { selection } = this.state;
    if (selection.length > 0) {
      const value = filter(cloneDeep(dataSet), o => selection.includes(o.value));
      const sorted = orderBy(value, ['count'], ['desc']);
      pullAllBy(dataSet, cloneDeep(sorted), 'value');
      dataSet.unshift(...sorted);
    }
  }

  getLabel() {
    const { data } = this.props;
    const { values } = data;
    return JSON.stringify(values);
  }

  getPopoverLegend() {
    const { data } = this.props;
    const { comparator } = data;
    return (<span>{comparator} {data.value}</span>);
  }

  getPopoverContent() {
    const { intl, data, category } = this.props;
    const { Text } = Typography;

    const titleText = intl.formatMessage({ id: `screen.patientvariant.filter_${data.id}` });
    const descriptionText = intl.formatMessage({ id: `screen.patientvariant.filter_${data.id}.description` });
    const categoryText = category ? intl.formatMessage({ id: `screen.patientvariant.category_${category}` }) : null;
    const valueText = intl.formatMessage({ id: 'screen.patientvariant.filter_value' });
    const valueList = data.values ? data.values.map((x, index) => <li key={index}>{x}</li>) : null;

    return (
      <div>
        <Row type="flex" justify="space-between" gutter={32}>
          <Col>
            <Text strong>{titleText}</Text>
          </Col>
          <Col>
            <Text>{categoryText}</Text>
          </Col>
        </Row>
        <Row>
          <Col>
            <Text>{descriptionText}</Text>
          </Col>
        </Row>
        <br />
        <Row>
          <Col>
            <Text>{data.comparator} {data.value}</Text>
          </Col>
        </Row>
      </div>
    );
  }


  getEditor() {
    const { intl } = this.props;
    const { draft } = this.state;
    const { comparator, value } = draft;
    const typeGt = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.gt' });
    const typeGte = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.gte' });
    const typeLt = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.lt' });
    const typeLte = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.lte' });
    const valueText = intl.formatMessage({ id: 'screen.patientvariant.filter.numerical.value' });
    return (
      <>
        <Row>
          <Col span={24}>
            <Radio.Group size="small" type="primary" value={comparator} onChange={this.handleComparatorChange}>
              <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_GREATER_THAN}>{typeGt}</Radio.Button>
              <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_GREATER_THAN_OR_EQUAL}>{typeGte}</Radio.Button>
              <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_LOWER_THAN}>{typeLt}</Radio.Button>
              <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_LOWER_THAN_OR_EQUAL}>{typeLte}</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <br />
        <Row type="flex" align="middle">
          <Col>
            {valueText}
          </Col>
          <Col>
            <InputNumber onChange={this.handleValueChange} defaultValue={value} step={0.1} />
          </Col>
        </Row>
      </>
    );
  }

  handleComparatorChange(e){
        const { draft } = this.state;
        draft.comparator = e.target.value;
        this.setState({ draft });
  }

  handleValueChange(value){
      const { draft } = this.state;
      draft.value = value;
      this.setState({ draft });
  }

  render() {
    return (
      <Filter
        {...this.props}
        type={FILTER_TYPE_NUMERICAL_COMPARISON}
        editor={this.getEditor()}
        label={this.getLabel()}
        legend={this.getPopoverLegend()}
        content={this.getPopoverContent()}
      />
    );
  }
}

NumericalComparisonFilter.propTypes = {
  intl: PropTypes.shape({}).isRequired,
  data: PropTypes.shape({}).isRequired,
  dataSet: PropTypes.array.isRequired,
};

// NumericalComparisonFilter.defaultProps = {};

export default NumericalComparisonFilter;
