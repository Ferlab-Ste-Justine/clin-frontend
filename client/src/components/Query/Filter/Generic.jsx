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


class GenericFilter extends Filter {

  constructor(props) {
    super(props);
    this.state.selection = []
    this.state.options = []
    this.state.indeterminate = false;
    this.getEditor = this.getEditor.bind(this);
    this.getLabel = this.getLabel.bind(this);
    this.getPopoverLegend = this.getPopoverLegend.bind(this);
    this.getPopoverContent = this.getPopoverContent.bind(this);
    this.handleSearchByQuery = this.handleSearchByQuery.bind(this);
    this.handleOperandChange = this.handleOperandChange.bind(this);
    this.handleOperandChange = this.handleOperandChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handleCheckAllSelections = this.handleCheckAllSelections.bind(this);

    // @NOTE Initialize Component State
    const { draft } = this.state;
    const { values } = draft;
    this.state.selection = cloneDeep(values);
    // @TODO Get possible values
    this.state.options = cloneDeep(values);
    this.state.indeterminate = this.state.selection.length !== this.state.options.length;
  }

  getLabel() {
    const { draft } = this.state;
    const { values } = draft;
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
      const { draft, indeterminate, options, selection } = this.state;
      const { operand } = draft;
      const allSelected = selection.length === options.length;

      return (
          <>
              <Row>
                  <Col span={24}>
                      <Radio.Group size="small" type="primary" value={operand} onChange={this.handleOperandChange}>
                          <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_ALL}>All Of</Radio.Button>
                          <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_ONE}>At Least One</Radio.Button>
                          <Radio.Button style={{ width: 150, textAlign: 'center' }} value={FILTER_OPERAND_TYPE_NONE}>Not Any Of</Radio.Button>
                      </Radio.Group>
                  </Col>
              </Row>
              <br />
              <Row>
                  <Input.Search
                      placeholder="Recherche"
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
                  {`${!allSelected ? 'Tous' : 'Aucun'}`}
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
}

GenericFilter.propTypes = {};

GenericFilter.defaultProps = {};

export default GenericFilter;
