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
      allOptions: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.getPopoverContent = this.getPopoverContent.bind(this);
    this.getPopoverLegend = this.getPopoverLegend.bind(this);
    this.handleComparatorChange = this.handleComparatorChange.bind(this)
    this.handleFilterChange= this.handleFilterChange.bind(this)

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;

    this.state.allOptions = [FILTER_OPERAND_TYPE_GREATER_THAN, FILTER_OPERAND_TYPE_GREATER_THAN_OR_EQUAL];
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
    const { operand } = data;

    return (<span>{operand}</span>);
  }

  getPopoverContent() {
    const { data } = this.props;
    const { operand } = data;
    return (
      <div>
        <Typography.Text>{operand}</Typography.Text>
        <ul>
          <li>VALUE 1</li>
          <li>VALUE 3</li>
        </ul>
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
            <InputNumber defaultValue={value} step={0.1} />
          </Col>
        </Row>
      </>
    );
  }

handleFilterChange(test){
    console.log("test")
    this.setState({
      data: { ...draft },
    }, () => {
      onEditCallback(this.serialize());
    });
}

  handleComparatorChange(e){
        const { draft } = this.state;
        draft.comparator = e.target.value;
        this.setState({ draft });
  }

  render() {
    return (
      <Filter
        {...this.props}
        onEditCallback= {this.handleFilterChange}
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
