/* eslint-disable */

import React from 'react';
import {
    Typography, Row, Col, Checkbox, Radio, Input, Tag, Pagination, Tooltip
} from 'antd';
import { cloneDeep, pull , orderBy , pullAllBy , filter} from 'lodash';
import IconKit from 'react-icons-kit';
import {
    empty, one, full,
} from 'react-icons-kit/entypo';

import Filter from './index';


export const FILTER_OPERAND_TYPE_ALL = 'all';
export const FILTER_OPERAND_TYPE_ONE = 'one';
export const FILTER_OPERAND_TYPE_NONE = 'none';

class GenericFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        draft: null,
        selection: [],
        indeterminate: false,
        size: null,
        page: null,
        allOptions: null,
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
    const { data, dataSet } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = data.values ? cloneDeep(data.values) : [];
    this.state.page = 1;
    this.state.size = 10;
    this.state.allOptions = cloneDeep(dataSet)

    if(this.state.selection.length > 0) {
      const that = this
      const value = filter(cloneDeep(dataSet), function(o) { return that.state.selection.includes(o.value) });
      if(value.length === 0){
        let selectedValue = []
        this.state.selection.map( x => selectedValue.push({value:x , count:0}))
        this.state.allOptions.unshift(...selectedValue)
      } else {
        const sorted = orderBy(value, ['count'] ,  ['desc']);
        pullAllBy(dataSet, cloneDeep(sorted), 'value')
        this.state.allOptions.unshift(...sorted)
      }
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
      const { intl , data , category} = this.props;
      const { Text } = Typography;

      const titleText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id });
      const descriptionText = intl.formatMessage({ id: 'screen.patientvariant.filter_'+data.id+'.description'});
      const operandText = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.'+data.operand });
      const categoryText = category ?  intl.formatMessage({ id: 'screen.patientvariant.category_'+category }) : null;
      const valueText = intl.formatMessage({ id: 'screen.patientvariant.filter_value'});
      const valueList = data.values ? data.values.map((x,index) => {return <li key={index}>{x}</li>}) : null

      return (
          <div>
              <Row type="flex" justify="space-between" gutter={32}>
                  <Col>
                    <Text strong>{titleText}</Text>
                  </Col>
                  <Col>
                    <Text >{categoryText}</Text>
                  </Col>
              </Row>
              <Row>
                  <Col>
                    <Text>{descriptionText}</Text>
                  </Col>
              </Row>
              <br/>
              <Row>
                  <Col>
                    <Text>{operandText}</Text>
                  </Col>
              </Row>
              <br/>
              <Row>
                  <Col>
                    {valueText} :
                  </Col>
              </Row>
              <Row>
                  <Col>
                    <ul>
                        {valueList}
                    </ul>
                  </Col>
              </Row>
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
      const { selection, allOptions , page , size } = this.state;

      const minValue = size*(page-1)
      const maxValue =  size * page
      const options = allOptions.slice(minValue,maxValue)

      options.map( (x , index) =>{
        if(selection.includes(x.value)){
            !values.includes(x.value) ? pull(selection, x.value) : null
        }
        else{
            values.includes(x.value) ? selection.push(x.value) : null
        }
      })
       this.setState({
          selection,
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
    this.setState({
      page,
      size,
    });
  }

  handleSearchByQuery(values) {
    const { dataSet } = this.props;
    const allOptions = cloneDeep(dataSet)
    const search = (values.target.value).toLowerCase()
    const toRemove = filter(cloneDeep(allOptions), (o) => {
      return search!='' ? !o.value.toLowerCase().startsWith(search) : null
    });

    pullAllBy(allOptions, cloneDeep(toRemove), 'value')
    this.setState({
      allOptions
    })
  }

  getEditor() {
      const { intl } = this.props;
      const { draft, selection , size, page, allOptions } = this.state;
      const { operand } = draft;
      const allSelected = allOptions ? selection.length === allOptions.length : false;
      const typeAll = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.all' });
      const typeOne = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.one' });
      const typeNone = intl.formatMessage({ id: 'screen.patientvariant.filter.operand.none' });
      const selectAll = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.all' });
      const selectNone = intl.formatMessage({ id: 'screen.patientvariant.filter.selection.none' });
      const filterSearch = intl.formatMessage({ id: 'screen.patientvariant.filter.search' });
      const minValue = size*(page-1)
      const maxValue =  size * page

      pullAllBy(allOptions, [{ value: "" }], 'value');

      const options = allOptions.slice(minValue,maxValue).map((option) => {
          const value = option.value.length < 60 ? option.value : option.value.substring(0,55)+ " ..."
            return {label: (
                <span>
                    <Tooltip title={option.value}>
                      {value}
                    </Tooltip>
                    <Tag>{option.count}</Tag>
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
                      onChange={this.handleSearchByQuery}
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
                          options={options}
                          value={selection}
                          onChange={this.handleSelectionChange}
                      />
                  </Col>
              </Row>
              <br />
              {
                allOptions.length >=size ?
                  <Row style={{ marginTop: 'auto' }}>
                    <Col align="end" span={24} >

                        <Pagination
                        total={allOptions.length}
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
