/* eslint-disable */

import React from 'react';
import {
    Typography, Row, Col, Checkbox, Radio, Tooltip, Input,
} from 'antd';
import { cloneDeep, pull } from 'lodash';
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
        options: [],
        indeterminate: false,
    };
    this.getEditor = this.getEditor.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.getPopoverContent = this.getPopoverContent.bind(this);
    this.getPopoverLegend = this.getPopoverLegend.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleOperandChange = this.handleOperandChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleCheckAllSelections = this.handleCheckAllSelections.bind(this);

    // @NOTE Initialize Component State
    const { data } = props;
    this.state.draft = cloneDeep(data);
    this.state.selection = cloneDeep(data.values);
    this.state.indeterminate = this.state.selection.length !== this.state.options.length;

    // @TODO Get possible values
    this.state.options = cloneDeep(data.values);

    console.log('GenericFilter state is');
    console.log(cloneDeep(this.state));
  }

  getLabel() {
      console.log('GenericFilter getLabel')
    const { data } = this.props;
    const { values } = data;
    return JSON.stringify(values);
  }

  getPopoverLegend() {
      console.log('GenericFilter getPopoverLegend')

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
      console.log('GenericFilter getPopoverContent')
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
      const { options } = this.state;
      this.setState({
          selection: values,
          indeterminate: (!(values.length === options.length) && values.length > 0),
      });
  }

  handleCheckAllSelections(e) {
    const { target } = e;
    const { checked } = target;
    if (!checked) {
      this.setState({
        selection: [],
        indeterminate: false
      });
    } else {
     this.setState({
       selection: cloneDeep(this.state.options),
       indeterminate: false
     });
    }
  }

  handleSearchByQuery() {
  }

  getEditor() {
      console.log('GenericFilter getEditor')
      const { intl, data } = this.props;
      const { indeterminate, options, selection } = this.state;
      const { operand } = data;
      const allSelected = selection.length === options.length;
      const typeAll = intl.formatMessage({ id: 'screen.patientVariant.filter.operand.all' });
      const typeOne = intl.formatMessage({ id: 'screen.patientVariant.filter.operand.one' });
      const typeNone = intl.formatMessage({ id: 'screen.patientVariant.filter.operand.none' });
      const selectAll = intl.formatMessage({ id: 'screen.patientVariant.filter.selection.all' });
      const selectNone = intl.formatMessage({ id: 'screen.patientVariant.filter.selection.all' });
      const filterSearch = intl.formatMessage({ id: 'screen.patientVariant.filter.search' });

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
                  <Input.Search
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
                      indeterminate={indeterminate}
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
          getEditor={this.getEditor}
          getLabel={this.getLabel}
          getLegend={this.getPopoverLegend}
          getContent={this.getPopoverContent}
      />;
  }

}

// GenericFilter.propTypes = {};

// GenericFilter.defaultProps = {};

export default GenericFilter;
