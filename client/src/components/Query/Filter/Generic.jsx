/* eslint-disable */

import React from 'react';
import {
    Typography, Row, Col, Checkbox, Radio, Tooltip, Input, Tag, Pagination
} from 'antd';
import { cloneDeep, pull , orderBy , pullAllBy , filter} from 'lodash';
import IconKit from 'react-icons-kit';
import {
    empty, one, full,
} from 'react-icons-kit/entypo';

import Filter, { FILTER_OPERAND_TYPE_ALL, FILTER_OPERAND_TYPE_ONE, FILTER_OPERAND_TYPE_NONE } from './index';


class GenericFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        draft: null,
        selection: [],
        indeterminate: false,
        size:10,
        page:1
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
  }

  componentDidMount(){
    const {  dataSet } = this.props;
    const {  selection } = this.state;
    if(selection.length>0){
          const valeur = filter(cloneDeep(dataSet), function(o) { return selection.includes(o.value) });
          const sorted = orderBy(valeur, ['count'] ,  ['desc']);
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
      switch (operand) {
          default:
          case FILTER_OPERAND_TYPE_ALL:
              return (<IconKit size={16} icon={full} />);
          case FILTER_OPERAND_TYPE_ONE:
              return (<IconKit size={16} icon={one} />);
          case FILTER_OPERAND_TYPE_NONE:
              return (<IconKit size={16} icon={empty} />);
      }
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

  handlePageChange(page, size) {
    const { actions } = this.props;
    const { search } = this.props;
    this.setState({
      page,
      size,
    });
  }

  handleSearchByQuery() {
  }

  getEditor() {
      const { intl, dataSet } = this.props;
      const { draft, selection , size, page } = this.state;
      const { operand } = draft;
      const allSelected = dataSet ? selection.length === dataSet.length : false;
      const typeAll = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.all' });
      const typeOne = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.one' });
      const typeNone = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.none' });
      const selectAll = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.all' });
      const selectNone = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.none' });
      const filterSearch = intl.formatMessage({ id: 'screen.patientvariant.filter.search' });
      const minValue = size*(page-1)
      const maxValue =  size * page
      const options = dataSet.slice(minValue,maxValue).map((option) => {

        const count = option.count >99999 ? '99999+' : option.count
        return {label: (
            <span>
                {option.value}
                <Tag style={{ float: 'right' }}>{count}</Tag>
            </span>
         ), value: option.value}
      })

      return (
          <>
              <Row>
                  <Col span={24}>
                      <Radio.Group size="small" type="primary" value={operand} onChange={this.handleOperandChange}>
                          <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_ALL}>{typeAll}</Radio.Button>
                          <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_ONE}>{typeOne}</Radio.Button>
                          <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_NONE}>{typeNone}</Radio.Button>
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
              <br />
              {
                dataSet.length >=size ?
                  <Row style={{ marginTop: 'auto' }}>
                    <Col align="end" span={24} >

                        <Pagination
                        total={dataSet.length}
                        pageSize={size}
                        current={page}
                        pageSizeOptions={['10', '25', '50', '100']}
                        onChange={this.handlePageChange}
                      />
                    </Col>
                  </Row> : null
              }
              <br/>
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

// GenericFilter.propTypes = {};

// GenericFilter.defaultProps = {};

export default GenericFilter;
