/* eslint-disable */

import React from 'react';
import {
    Typography, Row, Col, Checkbox, Radio, Input,
} from 'antd';
import { cloneDeep, pull , orderBy , pullAllBy , filter} from 'lodash';
import IconKit from 'react-icons-kit';
import {
    empty, one, full,
} from 'react-icons-kit/entypo';

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
        indeterminate: false,
        size: null,
        page: null,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.getPopoverContent = this.getPopoverContent.bind(this);
    this.getPopoverLegend = this.getPopoverLegend.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleOperandChange = this.handleOperandChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleCheckAllSelections = this.handleCheckAllSelections.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;
  }

  componentDidMount(){
    const { dataSet } = this.props;
    const { selection } = this.state;
    if (selection.length > 0) {
      const value = filter(cloneDeep(dataSet), function(o) { return selection.includes(o.value) });
      const sorted = orderBy(value, ['count'] ,  ['desc']);
      pullAllBy(dataSet, cloneDeep(sorted), 'value')
      dataSet.unshift(...sorted)
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

      return (<span>{operand}</span>)
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

  handleOperandChange(e) {
    const { draft } = this.state;
    draft.operand = e.target.value;
    this.setState({ draft });
  }

  handleSelectionChange(values) {
      const { dataSet } = this.props;
      this.setState({
          selection: values,
          indeterminate: (!(values.length === dataSet.length) && values.length > 0),
      });
  }

  handleCheckAllSelections(e) {
    const { target } = e;
    if (!target.checked) {
      this.setState({
        selection: [],
        indeterminate: false
      });
    } else {
      const { dataSet } = this.props;
      const options = dataSet.map(option => option.value)
      this.setState({
        selection: options,
        indeterminate: false
      });
    }
  }

  handleSearchByQuery() {
  }

  handlePageChange(page, size) {
    this.setState({
        page,
        size,
    });
  }

  getEditor() {
      const { intl, dataSet } = this.props;
      const { draft, selection } = this.state;
      const { operand } = draft;
      const allSelected = dataSet ? selection.length === dataSet.length : false;
      const typeGt = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.gt' });
      const typeGte = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.gte' });
      const typeLt = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.lt' });
      const typeLte = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.lte' });
      const selectAll = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.all' });
      const selectNone = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.none' });
      const filterSearch = intl.formatMessage({ id: 'screen.patientvariant.filter.search' });

      return (
          <>
              <Row>
                  <Col span={24}>
                      <Radio.Group size="small" type="primary" value={operand} onChange={this.handleOperandChange}>
                          <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_GREATER_THAN}>{typeGt}</Radio.Button>
                          <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_GREATER_THAN_OR_EQUAL}>{typeGte}</Radio.Button>
                          <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_LOWER_THAN}>{typeLt}</Radio.Button>
                          <Radio.Button style={{ width: 112, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_LOWER_THAN_OR_EQUAL}>{typeLte}</Radio.Button>
                      </Radio.Group>
                  </Col>
              </Row>
              <br />
              <Row>
                  <Input
                      allowClear
                      placeholder={filterSearch}
                      size="small"
                      onSearch={this.handleSearchByQuery}
                  />
              </Row>
              <br />
              <Row>
                  <Checkbox
                      key="check-all"
                      className="selector"
                      indeterminate={(!allSelected && selection.length > 0)}
                      onChange={this.handleCheckAllSelections}
                      checked={allSelected}
                  />
                  {(!allSelected ? selectAll : selectNone)}
              </Row>
              <br />
              <Row>
                  <Col span={24}>
                      <Checkbox.Group
                          style={{ display: 'flex', flexDirection: 'column' }}
                          options={options}
                          value={selection}
                          onChange={this.handleSelectionChange}
                      />
                  </Col>
              </Row>
          </>
      );
  }

  render() {
      return <Filter
          {...this.props}
          editor={this.getEditor()}
          label={this.getLabel()}
          legend={this.getPopoverLegend()}
          content={this.getPopoverContent()}
      />;
  }

}

// NumericalComparisonFilter.propTypes = {};

// NumericalComparisonFilter.defaultProps = {};

export default NumericalComparisonFilter;
